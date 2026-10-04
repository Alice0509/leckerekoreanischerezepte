const {isDeepStrictEqual} = require('node:util')
const plan = require('../content/noodle-pasta-updates.json')
const ids = [
  ...new Set(
    plan.recipes.flatMap(({id, context}) => [
      id,
      ...context.ingredients.map((ref) => ref._ref),
      ...context.steps.map((ref) => ref._ref),
    ]),
  ),
]

function prepare(documents) {
  if (documents.some((doc) => doc._id.startsWith('drafts.'))) {
    throw new Error(
      '대상 레시피에 작성 중인 초안이 있습니다. Studio에서 먼저 확인하세요. 변경하지 않았습니다.',
    )
  }
  for (const {id, context} of plan.recipes) {
    const recipe = documents.find((doc) => doc._id === id && doc._type === 'recipe')
    if (!recipe) throw new Error('공개된 대상 레시피를 찾지 못했습니다.')
    for (const [field, value] of Object.entries(context)) {
      if (!isDeepStrictEqual(recipe[field], value))
        throw new Error('레시피 주소 또는 연결이 달라졌습니다. 변경하지 않았습니다.')
    }
  }
  const mutations = []
  for (const item of plan.updates) {
    const doc = documents.find((row) => row._id === item.id)
    if (!doc || doc._type !== item.type || !doc._rev)
      throw new Error('문서 또는 버전을 확인할 수 없습니다.')
    const selected = Object.fromEntries(Object.keys(item.set).map((field) => [field, doc[field]]))
    if (isDeepStrictEqual(selected, item.set)) continue
    if (!isDeepStrictEqual(selected, item.before))
      throw new Error('준비 이후 설명이 수정되었습니다. 기존 편집을 덮어쓰지 않았습니다.')
    mutations.push({patch: {id: doc._id, ifRevisionID: doc._rev, set: item.set}})
  }
  return mutations
}

async function updateNoodlePasta(client, {apply = false} = {}) {
  const {projectId, dataset} = client.config()
  if (projectId !== 'o9hshko6' || dataset !== 'production')
    throw new Error('예상한 Sanity 프로젝트와 데이터셋이 아닙니다.')
  const read = () =>
    client.fetch('*[_id in $ids]', {ids: [...ids, ...ids.map((id) => `drafts.${id}`)]})
  const changes = prepare(await read())
  const preview = {
    mode: apply ? 'apply' : 'preview',
    changedDocuments: changes.length,
    changes: changes.map(({patch}) => ({id: patch.id, fields: Object.keys(patch.set)})),
    note: '비빔 소스와 국수 삶기 안내에 얇은 파스타 활용법을 추가합니다. 3–5분은 작성자가 쓰는 제품 기준이며 다른 제품은 포장지 시간을 따릅니다.',
    text: plan.updates[0].set.description.en.at(-1).children[0].text,
  }
  if (!apply || !changes.length) return {...preview, written: false}
  const checked = prepare(await read())
  if (!isDeepStrictEqual(changes, checked))
    throw new Error('검토 도중 문서가 수정되었습니다. 전체 변경을 중단했습니다.')
  await client.mutate(checked, {returnDocuments: false, visibility: 'sync'})
  return {...preview, written: true}
}

module.exports = {prepare, updateNoodlePasta}
