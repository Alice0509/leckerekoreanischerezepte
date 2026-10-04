const test = require('node:test');
const assert = require('node:assert/strict');
const {
  prepare,
  updateNoodlePasta,
} = require('../studio/noodlePastaUpdate.cjs');
const fixture = require('./fixtures/noodle-pasta-before.json');
const plan = require('../content/noodle-pasta-updates.json');
const copy = () => structuredClone(fixture);
const fake = (reads = [copy()], config = {}) => {
  let index = 0;
  const writes = [];
  return {
    writes,
    config: () => ({ projectId: 'o9hshko6', dataset: 'production', ...config }),
    fetch: async () =>
      structuredClone(reads[Math.min(index++, reads.length - 1)]),
    mutate: async (mutations) => writes.push(mutations),
  };
};

test('preview is read-only and one atomic apply changes only the reviewed descriptions and guide body', async () => {
  const client = fake();
  assert.equal((await updateNoodlePasta(client)).changedDocuments, 5);
  assert.equal(client.writes.length, 0);
  assert.equal(
    (await updateNoodlePasta(client, { apply: true })).written,
    true
  );
  assert.equal(client.writes.length, 1);
  const docs = copy();
  for (const { patch } of client.writes[0]) {
    const doc = docs.find((row) => row._id === patch.id);
    assert.equal(patch.ifRevisionID, doc._rev);
    assert.ok(
      Object.keys(patch.set).every((key) =>
        ['description', 'instructions'].includes(key)
      )
    );
    Object.assign(doc, patch.set);
  }
  for (const before of fixture) {
    const after = docs.find((row) => row._id === before._id);
    const changed = Object.keys(
      plan.updates.find((item) => item.id === before._id)?.set || {}
    );
    for (const key of Object.keys(before).filter(
      (key) => !changed.includes(key)
    ))
      assert.deepEqual(after[key], before[key]);
  }
  assert.equal(prepare(docs).length, 0);
  const repeated = fake([docs]);
  assert.equal(
    (await updateNoodlePasta(repeated, { apply: true })).written,
    false
  );
  assert.equal(repeated.writes.length, 0);
});

test('drafts, edited text, changed links and concurrent revisions abort all writes', async () => {
  for (const edit of [
    (docs) => docs.push({ ...docs[0], _id: `drafts.${docs[0]._id}` }),
    (docs) => {
      docs.find(
        (d) => d._id === plan.updates[0].id
      ).description.en[0].children[0].text = 'new text';
    },
    (docs) => {
      docs.find((d) => d._id === plan.recipes[0].id).steps[0]._ref =
        'other-step';
    },
  ]) {
    const docs = copy();
    edit(docs);
    const client = fake([docs]);
    await assert.rejects(updateNoodlePasta(client, { apply: true }));
    assert.equal(client.writes.length, 0);
  }
  const edited = copy();
  edited.find((d) => d._id === plan.updates[0].id)._rev = 'concurrent';
  const client = fake([copy(), edited]);
  await assert.rejects(updateNoodlePasta(client, { apply: true }));
  assert.equal(client.writes.length, 0);
});

test('wrong project and dataset are blocked before reads or writes', async () => {
  for (const config of [{ projectId: 'another' }, { dataset: 'staging' }]) {
    const client = fake([copy()], config);
    await assert.rejects(updateNoodlePasta(client, { apply: true }));
    assert.equal(client.writes.length, 0);
  }
});
