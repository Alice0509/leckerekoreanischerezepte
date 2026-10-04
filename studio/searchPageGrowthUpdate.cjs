const {isDeepStrictEqual} = require('node:util')
const plan = require('../content/search-page-growth-updates.json')
const ids = plan.recipes.map((item) => item.id)

function prepare(documents) {
  if (documents.some((doc) => ids.some((id) => doc._id === `drafts.${id}`))) {
    throw new Error('대상 레시피에 작성 중인 초안이 있습니다. 변경하지 않았습니다.')
  }
  const mutations = []
  for (const item of plan.recipes) {
    const doc = documents.find((row) => row._id === item.id)
    if (!doc || doc._type !== 'recipe' || !doc._rev) {
      throw new Error('공개 레시피 또는 버전을 확인할 수 없습니다.')
    }
    if (!isDeepStrictEqual(doc.slug, item.slug)) {
      throw new Error('레시피 주소가 달라졌습니다. 변경하지 않았습니다.')
    }
    const selected = Object.fromEntries(Object.keys(item.set).map((field) => [field, doc[field]]))
    if (isDeepStrictEqual(selected, item.set)) continue
    if (!isDeepStrictEqual(selected, item.before)) {
      throw new Error('준비 이후 제목 또는 설명이 수정되었습니다. 편집을 덮어쓰지 않았습니다.')
    }
    mutations.push({patch: {id: doc._id, ifRevisionID: doc._rev, set: item.set}})
  }
  return mutations
}

async function updateSearchPages(client, {apply = false} = {}) {
  const config = client.config()
  if (config.projectId !== plan.projectId || config.dataset !== plan.dataset) {
    throw new Error('예상한 Sanity 프로젝트와 데이터셋이 아닙니다.')
  }
  if (config.perspective !== 'raw' || config.useCdn !== false) {
    throw new Error('초안 확인을 위해 raw perspective와 useCdn: false가 필요합니다.')
  }
  const read = () =>
    client.fetch('*[_id in $ids]', {ids: [...ids, ...ids.map((id) => `drafts.${id}`)]})
  const changes = prepare(await read())
  const preview = {
    changedDocuments: changes.length,
    mode: apply ? 'apply' : 'preview',
    pages: plan.recipes.map((item) => ({
      slug: item.slug.en,
      title: item.set.seoTitle,
      searchDescription: item.set.seoDescription,
      introduction: Object.fromEntries(
        ['en', 'de'].map((lang) => [lang, item.set.description[lang][0].children[0].text]),
      ),
    })),
  }
  if (!apply || !changes.length) return {...preview, written: false}
  const checked = prepare(await read())
  if (!isDeepStrictEqual(changes, checked)) {
    throw new Error('확인 도중 레시피가 수정되었습니다. 전체 변경을 중단했습니다.')
  }
  await client.mutate(checked, {returnDocuments: false, visibility: 'sync'})
  return {...preview, written: true}
}

module.exports = {prepare, updateSearchPages}
