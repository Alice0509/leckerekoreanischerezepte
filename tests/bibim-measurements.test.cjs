const test = require('node:test')
const assert = require('node:assert/strict')
const {prepare, updateBibimMeasurements} = require('../studio/bibimMeasurementUpdate.cjs')
const fixture = require('./fixtures/bibim-measurements-before.json')
const plan = require('../content/bibim-measurement-updates.json')
const copy = () => structuredClone(fixture)
const fake = (reads = [copy()], overrides = {}) => {
  let index = 0
  const writes = []
  return {
    writes,
    config: () => ({projectId: 'o9hshko6', dataset: 'production', ...overrides}),
    fetch: async () => structuredClone(reads[Math.min(index++, reads.length - 1)]),
    mutate: async (mutations) => {writes.push(mutations)},
  }
}

test('preview makes no writes; applying changes only the reviewed ten fields in one transaction', async () => {
  const client = fake()
  assert.equal((await updateBibimMeasurements(client)).changedDocuments, 10)
  assert.equal(client.writes.length, 0)
  assert.equal((await updateBibimMeasurements(client, {apply: true})).written, true)
  assert.equal(client.writes.length, 1)
  const docs = copy()
  for (const {patch} of client.writes[0]) {
    assert.equal(patch.ifRevisionID, docs.find((doc) => doc._id === patch.id)._rev)
    assert.equal(Object.keys(patch.set).length, 1)
    Object.assign(docs.find((doc) => doc._id === patch.id), patch.set)
  }
  for (const old of fixture) {
    const now = docs.find((doc) => doc._id === old._id)
    for (const key of Object.keys(old).filter((key) => !['quantity', 'description'].includes(key))) {
      assert.deepEqual(now[key], old[key])
    }
  }
  assert.deepEqual(docs.find((doc) => doc._id.endsWith('ingredient-9')), fixture.find((doc) => doc._id.endsWith('ingredient-9')))
  assert.deepEqual(docs.find((doc) => doc._id.endsWith('step-2')), fixture.find((doc) => doc._id.endsWith('step-2')))
  assert.deepEqual(docs.find((doc) => doc._id.endsWith('step-3')), fixture.find((doc) => doc._id.endsWith('step-3')))
  assert.equal(prepare(docs).length, 0)
})

test('existing drafts, changed text and changed ownership links stop all writes', async () => {
  for (const edit of [
    (docs) => docs.push({...docs[0], _id: `drafts.${docs[0]._id}`}),
    (docs) => {docs.find((doc) => doc._id === plan.updates[1].id).quantity.en = 'edited'},
    (docs) => {docs[0].steps[0]._ref = 'another-recipes-step'},
  ]) {
    const docs = copy(); edit(docs)
    const client = fake([docs])
    await assert.rejects(updateBibimMeasurements(client, {apply: true}))
    assert.equal(client.writes.length, 0)
  }
})

test('a concurrent revision or draft change aborts before committing', async () => {
  for (const edit of [
    (docs) => {docs[0]._rev = 'new-version'},
    (docs) => docs.push({...docs[0], _id: `drafts.${docs[0]._id}`}),
  ]) {
    const second = copy(); edit(second)
    const client = fake([copy(), second])
    await assert.rejects(updateBibimMeasurements(client, {apply: true}))
    assert.equal(client.writes.length, 0)
  }
})

test('wrong project or dataset makes no writes', async () => {
  for (const config of [{projectId: 'wrong'}, {dataset: 'staging'}]) {
    const client = fake([copy()], config)
    await assert.rejects(updateBibimMeasurements(client, {apply: true}))
    assert.equal(client.writes.length, 0)
  }
})
