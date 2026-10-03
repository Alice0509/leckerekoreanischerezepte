const {createHash} = require('node:crypto')
const replacement = require('../content/gochugaru-english-guide.json')
const GOCHUGARU_ID = '45AmuOcPL5dEMn8AXNlRGD'
const digest = (value) => createHash('sha256').update(JSON.stringify(value)).digest('hex')

async function createGochugaruEnglishDraft(client) {
  const config = client.config()
  if (config.projectId !== 'o9hshko6' || config.dataset !== 'production') {
    throw new Error('예상한 Sanity 프로젝트와 데이터셋이 아닙니다.')
  }
  const draftId = `drafts.${GOCHUGARU_ID}`
  const [published, draft] = await client.getDocuments([GOCHUGARU_ID, draftId])
  if (!published || published._type !== 'ingredient') {
    throw new Error('기존 고춧가루 재료를 찾지 못했습니다.')
  }
  if (draft) throw new Error('이미 편집 중인 초안이 있습니다. Studio에서 먼저 확인해주세요.')
  if (published.slug?.en !== 'gochugaru' || published.slug?.de !== 'gochugaru') {
    throw new Error('재료 주소가 준비 당시와 다릅니다.')
  }
  if (JSON.stringify(published.description?.en) === JSON.stringify(replacement.blocks)) {
    return {status: 'already-updated', id: GOCHUGARU_ID}
  }
  if (digest(published.description?.en) !== replacement.expectedEnglishHash) {
    throw new Error('영어 설명이 준비 당시와 다릅니다. 변경하지 않았습니다.')
  }
  const [latest, latestDraft] = await client.getDocuments([GOCHUGARU_ID, draftId])
  if (!latest || latest._rev !== published._rev || latestDraft) {
    throw new Error('확인 중 재료가 수정됐습니다. 초안을 만들지 않았습니다.')
  }
  const {_rev, _createdAt, _updatedAt, ...fields} = latest
  // create fails if a draft appears concurrently. Published content is never
  // patched; an editor reviews and publishes the draft separately in Studio.
  await client.create({
    ...fields,
    _id: draftId,
    description: {...latest.description, en: replacement.blocks},
  })
  return {status: 'draft-created', id: draftId}
}

module.exports = {GOCHUGARU_ID, createGochugaruEnglishDraft}
