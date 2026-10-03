export const GOLDEN_CURRY_ID = 'ingredient-sb-golden-curry-roux'

// Create a photo-only draft. Publication remains an explicit Studio action.
export async function createGoldenCurryPhotoDraft(client, imageBytes) {
  const config = client.config()
  if (config.projectId !== 'o9hshko6' || config.dataset !== 'production') {
    throw new Error('예상한 Sanity 프로젝트와 데이터셋이 아닙니다.')
  }
  const draftId = `drafts.${GOLDEN_CURRY_ID}`
  const [published, draft] = await client.getDocuments([GOLDEN_CURRY_ID, draftId])
  if (!published || published._type !== 'ingredient') {
    throw new Error('기존 Golden Curry 식재료를 찾지 못했습니다.')
  }
  if (draft) {
    throw new Error('이미 편집 중인 초안이 있습니다. Studio에서 먼저 확인해주세요.')
  }
  if (published.bild?.asset?._ref) {
    return {status: 'already-has-photo', id: GOLDEN_CURRY_ID}
  }
  if (
    published.slug?.en?.current !== 'sb-golden-curry-roux' ||
    published.slug?.de?.current !== 'sb-golden-curry-roux'
  ) {
    throw new Error('식재료 주소가 준비 당시와 다릅니다. 변경하지 않았습니다.')
  }
  if (!imageBytes?.length || imageBytes[0] !== 0xff || imageBytes[1] !== 0xd8) {
    throw new Error('제품 사진은 JPEG 파일이어야 합니다.')
  }
  const asset = await client.assets.upload('image', imageBytes, {
    filename: 'golden-curry-packages.jpg',
    contentType: 'image/jpeg',
  })
  const [latest, latestDraft] = await client.getDocuments([GOLDEN_CURRY_ID, draftId])
  if (!latest || latest._rev !== published._rev || latestDraft) {
    throw new Error('사진을 준비하는 동안 식재료가 수정됐습니다. 초안은 만들지 않았습니다.')
  }
  const {_rev, _createdAt, _updatedAt, ...fields} = latest
  await client.create({
    ...fields,
    _id: draftId,
    bild: {_type: 'image', asset: {_type: 'reference', _ref: asset._id}},
  })
  return {status: 'draft-created', id: draftId}
}
