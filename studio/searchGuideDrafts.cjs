const {createHash} = require('node:crypto')
const packet = require('../content/search-guide-updates.json')

const TARGETS = [
  {
    id: 'iqvr9JyBrbxsh9PSeFW86',
    type: 'recipe',
    slug: 'soboro-brot',
    locale: 'en',
    label: '소보로빵',
  },
  {
    id: '6MrScHBmL3Q85jAADFwrSH',
    type: 'recipe',
    slug: 'danpatbbang',
    locale: 'en',
    label: '단팥빵',
  },
  {
    id: '31qLwPpZYSKIi7ZpC41EZp',
    type: 'ingredient',
    slug: 'gochujang',
    locale: 'de',
    label: '고추장',
  },
]
const FIELDS = ['description', 'seoTitle', 'seoDescription']
const canonical = (value) =>
  Array.isArray(value)
    ? value.map(canonical)
    : value && typeof value === 'object'
      ? Object.fromEntries(
          Object.keys(value)
            .sort()
            .map((key) => [key, canonical(value[key])]),
        )
      : value
const digest = (value) =>
  createHash('sha256')
    .update(JSON.stringify(canonical(value)))
    .digest('hex')
const selectedFields = (document, locale) =>
  Object.fromEntries(FIELDS.map((field) => [field, document[field]?.[locale] ?? null]))

function validatePacket() {
  if (packet.format !== 'hansik-search-guides-v1' || packet.updates?.length !== TARGETS.length) {
    throw new Error('준비한 설명 파일의 형식이 다릅니다.')
  }
  for (const [index, target] of TARGETS.entries()) {
    const update = packet.updates[index]
    if (
      update.id !== target.id ||
      update.locale !== target.locale ||
      Object.keys(update.fields || {})
        .sort()
        .join(',') !== [...FIELDS].sort().join(',') ||
      !/^[a-f0-9]{64}$/.test(update.expectedContentHash || '') ||
      typeof update.fields.seoTitle !== 'string' ||
      !update.fields.seoTitle.trim() ||
      typeof update.fields.seoDescription !== 'string' ||
      !update.fields.seoDescription.trim() ||
      !Array.isArray(update.fields.description) ||
      !update.fields.description.length
    ) {
      throw new Error(`${target.label} 설명 파일의 형식이 다릅니다.`)
    }
    for (const block of update.fields.description) {
      if (
        block._type !== 'block' ||
        !['normal', 'h2', 'h3'].includes(block.style) ||
        !block._key ||
        !Array.isArray(block.children) ||
        !block.children.length ||
        block.children.some((child) => child._type !== 'span' || typeof child.text !== 'string')
      ) {
        throw new Error(`${target.label} 소개 본문의 형식이 다릅니다.`)
      }
    }
  }
}

function inspectDocuments(documents) {
  const prepared = []
  const results = []
  for (const [index, target] of TARGETS.entries()) {
    const published = documents[index * 2]
    const existingDraft = documents[index * 2 + 1]
    const update = packet.updates[index]
    if (
      !published ||
      published._id !== target.id ||
      published._type !== target.type ||
      published.slug?.en !== target.slug ||
      published.slug?.de !== target.slug ||
      !published._rev
    ) {
      throw new Error(`${target.label} 문서 또는 주소가 예상과 다릅니다. 변경하지 않았습니다.`)
    }
    if (existingDraft) {
      if (existingDraft._id !== `drafts.${target.id}` || existingDraft._type !== target.type) {
        throw new Error(`${target.label} 초안의 형식이 예상과 다릅니다.`)
      }
      const {_id, _rev, _createdAt, _updatedAt, ...draftFields} = existingDraft
      const {
        _id: publishedId,
        _rev: publishedRev,
        _createdAt: created,
        _updatedAt: updated,
        ...publishedFields
      } = published
      const expected = structuredClone(publishedFields)
      for (const field of FIELDS)
        expected[field] = {...expected[field], [target.locale]: update.fields[field]}
      if (digest(draftFields) !== digest(expected)) {
        throw new Error(
          `${target.label}에 다른 편집 초안이 있습니다. Studio에서 먼저 확인해주세요.`,
        )
      }
      results.push({label: target.label, status: 'already-prepared', id: existingDraft._id})
      continue
    }
    if (digest(selectedFields(published, target.locale)) === digest(update.fields)) {
      results.push({label: target.label, status: 'already-published', id: target.id})
      continue
    }
    if (digest(selectedFields(published, target.locale)) !== update.expectedContentHash) {
      throw new Error(`${target.label} 설명이 준비 당시와 달라졌습니다. 변경하지 않았습니다.`)
    }
    const {_rev, _createdAt, _updatedAt, ...fields} = structuredClone(published)
    for (const field of FIELDS)
      fields[field] = {...fields[field], [target.locale]: update.fields[field]}
    fields._id = `drafts.${target.id}`
    prepared.push(fields)
    results.push({label: target.label, status: 'draft-created', id: fields._id})
  }
  return {prepared, results}
}

async function createSearchGuideDrafts(client, {dryRun = false} = {}) {
  if (client.config().projectId !== 'o9hshko6' || client.config().dataset !== 'production') {
    throw new Error('예상한 Sanity 프로젝트와 데이터셋이 아닙니다.')
  }
  validatePacket()
  const ids = TARGETS.flatMap(({id}) => [id, `drafts.${id}`])
  const first = await client.getDocuments(ids)
  const plan = inspectDocuments(first)
  if (dryRun)
    return {
      dryRun: true,
      results: plan.results.map((result) => ({
        ...result,
        status: result.status === 'draft-created' ? 'would-create-draft' : result.status,
      })),
    }
  if (!plan.prepared.length) return {dryRun: false, results: plan.results}

  // Re-read before drafting. A publish after this read cannot be locked by a
  // create-only transaction: editors must still review the drafts in Studio.
  const latest = await client.getDocuments(ids)
  if (latest.some((document, index) => (document?._rev ?? null) !== (first[index]?._rev ?? null))) {
    throw new Error('확인 중 문서가 수정됐습니다. 초안을 만들지 않았습니다.')
  }
  const current = inspectDocuments(latest)
  let transaction = client.transaction()
  for (const draft of current.prepared) transaction = transaction.create(draft)
  // create, rather than createOrReplace, aborts the entire transaction if a
  // competing draft appears. Never patch or publish an existing document.
  await transaction.commit()
  return {dryRun: false, results: current.results}
}

module.exports = {TARGETS, FIELDS, createSearchGuideDrafts}
