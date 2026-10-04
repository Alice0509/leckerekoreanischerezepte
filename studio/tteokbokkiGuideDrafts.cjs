const {createHash} = require('node:crypto')
const packet = require('../content/tteokbokki-guide-updates.json')

const TARGETS = [
  {
    id: 'MTVJJZTDiOrFtOjZxK4La',
    type: 'recipe',
    slug: 'tteokbokki',
    locales: ['en'],
    label: '떡볶이',
  },
  {
    id: '75UfpJXs9YtOZKMg6qu4wv',
    type: 'ingredient',
    slug: 'tteokbokki-tteok',
    locales: ['en', 'de'],
    label: '떡 재료',
  },
]
const FIELDS = {
  description: 'localizedPortableText',
  seoTitle: 'localizedString',
  seoDescription: 'localizedText',
}
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
const clean = ({_id, _rev, _createdAt, _updatedAt, ...fields}) => fields
const selected = (doc, locales) =>
  Object.fromEntries(
    Object.keys(FIELDS).map((field) => [
      field,
      Object.fromEntries(locales.map((locale) => [locale, doc[field]?.[locale] ?? null])),
    ]),
  )
const context = (doc) =>
  Object.fromEntries(
    ['servings', 'preparationTime', 'ingredients', 'steps'].map((key) => [key, doc[key] ?? null]),
  )

function validatePacket() {
  if (
    packet.format !== 'hansik-tteokbokki-guides-v1' ||
    packet.updates?.length !== 2 ||
    packet.sources?.length !== 11 ||
    new Set(packet.sources.map((row) => row.id)).size !== 11 ||
    !/^[a-f0-9]{64}$/.test(packet.expectedRecipeContextHash)
  )
    throw new Error('준비한 설명 파일의 형식이 다릅니다.')
  for (const [index, target] of TARGETS.entries()) {
    const update = packet.updates[index]
    if (
      update.id !== target.id ||
      JSON.stringify(update.locales) !== JSON.stringify(target.locales) ||
      !/^[a-f0-9]{64}$/.test(update.expectedContentHash) ||
      Object.keys(update.fields || {})
        .sort()
        .join(',') !== Object.keys(FIELDS).sort().join(',')
    ) {
      throw new Error('준비한 문서 또는 필드가 다릅니다.')
    }
    for (const field of Object.keys(FIELDS)) {
      if (
        Object.keys(update.fields[field]).sort().join(',') !== [...target.locales].sort().join(',')
      )
        throw new Error('준비한 언어가 다릅니다.')
      for (const locale of target.locales) {
        const value = update.fields[field][locale]
        if (field !== 'description') {
          if (typeof value !== 'string' || !value.trim())
            throw new Error('검색 문구가 비어 있습니다.')
          continue
        }
        if (
          !Array.isArray(value) ||
          !value.length ||
          new Set(value.map((b) => b._key)).size !== value.length
        )
          throw new Error('소개 본문이 비어 있거나 중복됩니다.')
        for (const block of value) {
          if (
            block._type !== 'block' ||
            !block._key ||
            !['normal', 'h2'].includes(block.style) ||
            !block.children?.length ||
            block.children.some((child) => child._type !== 'span' || typeof child.text !== 'string')
          )
            throw new Error('소개 본문의 형식이 다릅니다.')
        }
      }
    }
  }
}

function inspectDocuments(documents) {
  for (const [index, source] of packet.sources.entries()) {
    const doc = documents[TARGETS.length * 2 + index]
    if (!doc || doc._id !== source.id || !doc._rev || digest(clean(doc)) !== source.expectedHash) {
      throw new Error(
        '연결된 재료 분량 또는 조리 단계가 준비 당시와 다릅니다. 변경하지 않았습니다.',
      )
    }
  }
  if (digest(context(documents[0] || {})) !== packet.expectedRecipeContextHash)
    throw new Error('떡볶이 인분·시간·연결 항목이 준비 당시와 다릅니다.')
  const prepared = []
  const results = []
  for (const [index, target] of TARGETS.entries()) {
    const published = documents[index * 2]
    const draft = documents[index * 2 + 1]
    const update = packet.updates[index]
    if (
      !published ||
      published._id !== target.id ||
      published._type !== target.type ||
      !published._rev ||
      published.slug?.en !== target.slug ||
      published.slug?.de !== target.slug
    )
      throw new Error(`${target.label} 문서 또는 주소가 예상과 다릅니다.`)
    const fields = structuredClone(clean(published))
    for (const [field, type] of Object.entries(FIELDS))
      fields[field] = {_type: type, ...fields[field], ...update.fields[field]}
    if (draft) {
      if (
        draft._id !== `drafts.${target.id}` ||
        draft._type !== target.type ||
        digest(clean(draft)) !== digest(fields)
      ) {
        throw new Error(
          `${target.label}에 다른 편집 초안이 있습니다. Studio에서 먼저 확인해주세요.`,
        )
      }
      results.push({label: target.label, status: 'already-prepared', id: draft._id})
    } else if (digest(selected(published, target.locales)) === digest(update.fields)) {
      results.push({label: target.label, status: 'already-published', id: target.id})
    } else {
      if (digest(selected(published, target.locales)) !== update.expectedContentHash)
        throw new Error(`${target.label} 소개가 준비 당시와 달라졌습니다.`)
      prepared.push({...fields, _id: `drafts.${target.id}`})
      results.push({label: target.label, status: 'draft-created', id: `drafts.${target.id}`})
    }
  }
  return {prepared, results}
}

async function createTteokbokkiGuideDrafts(client, {dryRun = false} = {}) {
  const config = client.config()
  if (config.projectId !== 'o9hshko6' || config.dataset !== 'production')
    throw new Error('예상한 Sanity 프로젝트와 데이터셋이 아닙니다.')
  validatePacket()
  const ids = [
    ...TARGETS.flatMap(({id}) => [id, `drafts.${id}`]),
    ...packet.sources.map((row) => row.id),
  ]
  const first = await client.getDocuments(ids)
  const plan = inspectDocuments(first)
  if (dryRun)
    return {
      dryRun: true,
      results: plan.results.map((row) => ({
        ...row,
        status: row.status === 'draft-created' ? 'would-create-draft' : row.status,
      })),
    }
  if (!plan.prepared.length) return {dryRun: false, results: plan.results}
  const latest = await client.getDocuments(ids)
  if (latest.some((doc, index) => (doc?._rev ?? null) !== (first[index]?._rev ?? null)))
    throw new Error('확인 중 문서가 수정됐습니다. 초안을 만들지 않았습니다.')
  const current = inspectDocuments(latest)
  let transaction = client.transaction()
  for (const draft of current.prepared) transaction = transaction.create(draft)
  // A create conflict aborts the batch. A published edit after the final read
  // cannot be locked by this create-only transaction; review before publishing.
  await transaction.commit()
  return {dryRun: false, results: current.results}
}

module.exports = {TARGETS, FIELDS, createTteokbokkiGuideDrafts}
