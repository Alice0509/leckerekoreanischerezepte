const {isDeepStrictEqual} = require('node:util')
const plan = require('../content/bibim-measurement-updates.json')

const ids = [
  plan.recipeId,
  ...plan.context.ingredients.map((ref) => ref._ref),
  ...plan.context.steps.map((ref) => ref._ref),
]

function prepare(documents) {
  if (documents.some((doc) => doc._id.startsWith('drafts.'))) {
    throw new Error('이 레시피에 작성 중인 초안이 있습니다. 먼저 Studio에서 확인하세요. 변경하지 않았습니다.')
  }
  const recipe = documents.find((doc) => doc._id === plan.recipeId)
  if (!recipe || recipe._type !== 'recipe') throw new Error('공개된 비빔 소스 레시피를 찾지 못했습니다.')
  for (const [field, expected] of Object.entries(plan.context)) {
    if (!isDeepStrictEqual(recipe[field], expected)) {
      throw new Error('레시피 주소 또는 연결 재료·단계가 바뀌었습니다. 변경하지 않았습니다.')
    }
  }
  const changes = []
  for (const item of plan.updates) {
    const doc = documents.find((row) => row._id === item.id)
    if (!doc || doc._type !== item.type || !doc._rev) throw new Error('대상 문서 또는 버전이 올바르지 않습니다.')
    const fields = Object.keys(item.set)
    const selected = Object.fromEntries(fields.map((field) => [field, doc[field]]))
    if (isDeepStrictEqual(selected, item.set)) continue
    if (!isDeepStrictEqual(selected, item.before)) {
      throw new Error('분량 또는 설명이 준비 이후 수정되었습니다. 기존 편집을 덮어쓰지 않았습니다.')
    }
    changes.push({patch: {id: doc._id, ifRevisionID: doc._rev, set: item.set}})
  }
  return changes
}

async function updateBibimMeasurements(client, {apply = false} = {}) {
  const config = client.config()
  if (config.projectId !== 'o9hshko6' || config.dataset !== 'production') {
    throw new Error('예상한 Sanity 프로젝트와 production 데이터셋이 아닙니다.')
  }
  const queryIds = [...ids, ...ids.map((id) => `drafts.${id}`)]
  const read = () => client.fetch('*[_id in $ids]', {ids: queryIds})
  const first = await read()
  const changes = prepare(first)
  const preview = {
    mode: apply ? 'apply' : 'preview',
    changedDocuments: changes.length,
    quantities: plan.updates.filter((item) => item.type === 'recipeIngredient').map((item) => item.set.quantity),
    note: '재료 8개의 분량을 parts/Teile로 표시하고 소개와 첫 단계의 계량 설명을 수정합니다. 깨·사진·인분·시간·나머지 단계는 유지합니다.',
  }
  if (!apply || changes.length === 0) return {...preview, written: false}
  const second = await read()
  const checked = prepare(second)
  if (!isDeepStrictEqual(changes, checked)) {
    throw new Error('검토 도중 문서가 수정되었습니다. 전체 변경을 중단했습니다.')
  }
  // All field patches commit in one transaction; a changed revision rejects the batch.
  await client.mutate(checked, {returnDocuments: false})
  return {...preview, written: true}
}

module.exports = {prepare, updateBibimMeasurements}
