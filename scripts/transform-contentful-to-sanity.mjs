import fs from 'node:fs/promises'
import crypto from 'node:crypto'

const sourcePath =
  'migration-data/contentful-published-snapshot.json'
const outputPath =
  'migration-data/sanity-import.ndjson'
const summaryPath =
  'migration-data/sanity-import-summary.json'

const sourceRaw = await fs.readFile(sourcePath, 'utf8')
const snapshot = JSON.parse(sourceRaw)

const sourceSha256 = crypto
  .createHash('sha256')
  .update(sourceRaw)
  .digest('hex')

const entries = snapshot.entries || []
const assets = snapshot.assets || []

const entryIds = new Set(
  entries.map((entry) => entry.sys?.id).filter(Boolean)
)

const entryTypeById = new Map(
  entries
    .filter((entry) => entry.sys?.id)
    .map((entry) => [
      entry.sys.id,
      entry.sys?.contentType?.sys?.id ?? null,
    ])
)

const mismatchedTypedReferences = []

const assetById = new Map(
  assets
    .filter((asset) => asset.sys?.id)
    .map((asset) => [asset.sys.id, asset])
)

const weakReferences = []
const usedAssetIds = new Set()
let assetDirectives = 0

function stableKey(seed) {
  return crypto
    .createHash('sha1')
    .update(seed)
    .digest('hex')
    .slice(0, 12)
}

function absoluteUrl(url) {
  if (!url) return null
  return url.startsWith('//') ? `https:${url}` : url
}

function unwrap(value) {
  if (
    value &&
    typeof value === 'object' &&
    !Array.isArray(value) &&
    ('en' in value || 'de' in value)
  ) {
    return value.en ?? value.de
  }

  return value
}

function localizedObject(field, type, mapper = (value) => value) {
  if (!field || typeof field !== 'object') return undefined

  const result = {
    _type: type,
  }

  let found = false

  for (const locale of ['en', 'de']) {
    if (!(locale in field)) continue

    const value = field[locale]

    if (value === undefined || value === null) continue

    result[locale] = mapper(value, locale)
    found = true
  }

  return found ? result : undefined
}

function linkIds(value) {
  if (!value) return []

  const list = Array.isArray(value) ? value : [value]

  return list
    .map((item) => item?.sys?.id)
    .filter(Boolean)
}

function flattenedLinkIds(field, label) {
  if (!field) return []

  if (
    typeof field === 'object' &&
    !Array.isArray(field) &&
    ('en' in field || 'de' in field)
  ) {
    const hasEn = 'en' in field
    const hasDe = 'de' in field

    const enIds = hasEn ? linkIds(field.en) : []
    const deIds = hasDe ? linkIds(field.de) : []

    if (
      hasEn &&
      hasDe &&
      JSON.stringify(enIds) !== JSON.stringify(deIds)
    ) {
      throw new Error(
        `EN/DE reference mismatch at ${label}: ` +
          `EN=${JSON.stringify(enIds)} ` +
          `DE=${JSON.stringify(deIds)}`
      )
    }

    return hasEn ? enIds : deIds
  }

  return linkIds(field)
}

function makeReference(id, seed) {
  const reference = {
    _type: 'reference',
    _ref: id,
  }

  if (seed) {
    reference._key = stableKey(seed)
  }

  if (!entryIds.has(id)) {
    reference._weak = true

    weakReferences.push({
      targetId: id,
      source: seed || null,
    })
  }

  return reference
}

function referenceArray(field, label) {
  return flattenedLinkIds(field, label).map((id, index) =>
    makeReference(id, `${label}:${index}:${id}`)
  )
}

function singleReference(field, label) {
  const ids = flattenedLinkIds(field, label)

  if (ids.length === 0) return undefined

  if (ids.length > 1) {
    throw new Error(
      `Expected one reference at ${label}, found ${ids.length}`
    )
  }

  return makeReference(ids[0], label)
}

function singleReferenceToType(field, label, expectedType) {
  const ids = flattenedLinkIds(field, label)

  if (ids.length === 0) {
    return {reference: undefined}
  }

  if (ids.length > 1) {
    throw new Error(
      `Expected one reference at ${label}, found ${ids.length}`
    )
  }

  const id = ids[0]
  const actualType = entryTypeById.get(id) ?? null

  if (actualType && actualType !== expectedType) {
    mismatchedTypedReferences.push({
      source: label,
      targetId: id,
      expectedType,
      actualType,
    })

    return {
      reference: undefined,
      legacyTargetId: id,
      legacyTargetType: actualType,
    }
  }

  return {
    reference: makeReference(id, label),
  }
}

function assetDirective(assetId, expectedType, seed, withKey = false) {
  if (!assetId) return undefined

  const asset = assetById.get(assetId)

  if (!asset) {
    throw new Error(
      `Missing Contentful asset ${assetId} at ${seed}`
    )
  }

  const file =
    asset.fields?.file?.en ??
    asset.fields?.file?.de

  if (!file?.url) {
    throw new Error(
      `Asset ${assetId} has no file URL at ${seed}`
    )
  }

  const contentType = file.contentType || ''

  if (
    expectedType === 'image' &&
    !contentType.startsWith('image/')
  ) {
    throw new Error(
      `Expected image at ${seed}, got ${contentType}`
    )
  }

  const result = {
    _type: expectedType,
    _sanityAsset: `${expectedType}@${absoluteUrl(file.url)}`,
  }

  if (withKey) {
    result._key = stableKey(seed)
  }

  usedAssetIds.add(assetId)
  assetDirectives += 1

  return result
}

function singleAsset(field, expectedType, label) {
  const ids = flattenedLinkIds(field, label)

  if (ids.length === 0) return undefined

  if (ids.length > 1) {
    throw new Error(
      `Expected one asset at ${label}, found ${ids.length}`
    )
  }

  return assetDirective(
    ids[0],
    expectedType,
    label,
    false
  )
}

function assetArray(field, expectedType, label) {
  return flattenedLinkIds(field, label).map(
    (id, index) =>
      assetDirective(
        id,
        expectedType,
        `${label}:${index}:${id}`,
        true
      )
  )
}

function markName(mark) {
  if (mark?.type === 'bold') return 'strong'
  if (mark?.type === 'italic') return 'em'

  throw new Error(
    `Unsupported Contentful text mark: ${mark?.type}`
  )
}

function inlineContent(nodes, seed) {
  const children = []
  const markDefs = []

  function visit(node, path, inheritedMarks = []) {
    if (!node) return

    if (node.nodeType === 'text') {
      const decorators = (node.marks || []).map(markName)

      children.push({
        _type: 'span',
        _key: stableKey(`${seed}:${path}:span`),
        text: node.value ?? '',
        marks: [...new Set([
          ...decorators,
          ...inheritedMarks,
        ])],
      })

      return
    }

    if (node.nodeType === 'hyperlink') {
      const href = node.data?.uri

      if (!href) {
        throw new Error(
          `Hyperlink without URI at ${seed}:${path}`
        )
      }

      const linkKey = stableKey(
        `${seed}:${path}:link:${href}`
      )

      markDefs.push({
        _key: linkKey,
        _type: 'link',
        href,
      })

      for (let index = 0; index < (node.content || []).length; index += 1) {
        visit(
          node.content[index],
          `${path}.${index}`,
          [...inheritedMarks, linkKey]
        )
      }

      return
    }

    throw new Error(
      `Unsupported inline node ${node.nodeType} at ${seed}:${path}`
    )
  }

  for (let index = 0; index < (nodes || []).length; index += 1) {
    visit(nodes[index], `${index}`)
  }

  if (children.length === 0) {
    children.push({
      _type: 'span',
      _key: stableKey(`${seed}:empty-span`),
      text: '',
      marks: [],
    })
  }

  return {
    children,
    markDefs,
  }
}

function textBlock(
  node,
  seed,
  {
    style = 'normal',
    listItem,
    level,
  } = {}
) {
  const inline = inlineContent(
    node.content || [],
    seed
  )

  const block = {
    _type: 'block',
    _key: stableKey(`${seed}:block`),
    style,
    markDefs: inline.markDefs,
    children: inline.children,
  }

  if (listItem) {
    block.listItem = listItem
    block.level = level || 1
  }

  return block
}

function convertList(node, seed, level = 1) {
  const listItem =
    node.nodeType === 'ordered-list'
      ? 'number'
      : 'bullet'

  const blocks = []

  for (
    let itemIndex = 0;
    itemIndex < (node.content || []).length;
    itemIndex += 1
  ) {
    const item = node.content[itemIndex]

    if (item.nodeType !== 'list-item') {
      throw new Error(
        `Expected list-item at ${seed}:${itemIndex}`
      )
    }

    for (
      let childIndex = 0;
      childIndex < (item.content || []).length;
      childIndex += 1
    ) {
      const child = item.content[childIndex]
      const childSeed =
        `${seed}:${itemIndex}:${childIndex}`

      if (
        child.nodeType === 'ordered-list' ||
        child.nodeType === 'unordered-list'
      ) {
        blocks.push(
          ...convertList(
            child,
            childSeed,
            level + 1
          )
        )
        continue
      }

      if (
        child.nodeType === 'paragraph' ||
        child.nodeType?.startsWith('heading-')
      ) {
        blocks.push(
          textBlock(
            child,
            childSeed,
            {
              style: 'normal',
              listItem,
              level,
            }
          )
        )
        continue
      }

      throw new Error(
        `Unsupported list child ${child.nodeType} at ${childSeed}`
      )
    }
  }

  return blocks
}

function portableText(document, seed) {
  if (!document) return undefined

  if (document.nodeType !== 'document') {
    throw new Error(
      `Expected Rich Text document at ${seed}`
    )
  }

  const result = []

  for (
    let index = 0;
    index < (document.content || []).length;
    index += 1
  ) {
    const node = document.content[index]
    const nodeSeed = `${seed}:${index}`

    if (node.nodeType === 'paragraph') {
      result.push(
        textBlock(node, nodeSeed)
      )
      continue
    }

    if (
      ['heading-2', 'heading-3', 'heading-4', 'heading-5']
        .includes(node.nodeType)
    ) {
      result.push(
        textBlock(
          node,
          nodeSeed,
          {
            style: node.nodeType.replace(
              'heading-',
              'h'
            ),
          }
        )
      )
      continue
    }

    if (node.nodeType === 'blockquote') {
      for (
        let quoteIndex = 0;
        quoteIndex < (node.content || []).length;
        quoteIndex += 1
      ) {
        const child = node.content[quoteIndex]

        if (child.nodeType !== 'paragraph') {
          throw new Error(
            `Unsupported blockquote child ${child.nodeType} at ${nodeSeed}`
          )
        }

        result.push(
          textBlock(
            child,
            `${nodeSeed}:${quoteIndex}`,
            {style: 'blockquote'}
          )
        )
      }

      continue
    }

    if (
      node.nodeType === 'ordered-list' ||
      node.nodeType === 'unordered-list'
    ) {
      result.push(
        ...convertList(node, nodeSeed)
      )
      continue
    }

    if (node.nodeType === 'hr') {
      result.push({
        _type: 'horizontalRule',
        _key: stableKey(`${nodeSeed}:hr`),
        kind: 'hr',
      })
      continue
    }

    throw new Error(
      `Unsupported Rich Text node ${node.nodeType} at ${nodeSeed}`
    )
  }

  return result
}

function localizedPortableText(field, seed) {
  return localizedObject(
    field,
    'localizedPortableText',
    (value, locale) =>
      portableText(
        value,
        `${seed}:${locale}`
      )
  )
}

function localizedGeopoint(field, seed) {
  return localizedObject(
    field,
    'localizedGeopoint',
    (value, locale) => {
      if (
        typeof value?.lat !== 'number' ||
        typeof value?.lon !== 'number'
      ) {
        throw new Error(
          `Invalid Contentful location at ${seed}:${locale}`
        )
      }

      return {
        _type: 'geopoint',
        lat: value.lat,
        lng: value.lon,
      }
    }
  )
}

function transformEntry(entry) {
  const id = entry.sys?.id
  const type =
    entry.sys?.contentType?.sys?.id
  const fields = entry.fields || {}

  if (!id || !type) {
    throw new Error(
      'Entry is missing ID or content type'
    )
  }

  const base = {
    _id: id,
    _type: type,
    legacyContentfulId: id,
  }

  if (type === 'ingredient') {
    return {
      ...base,
      name: localizedObject(
        fields.name,
        'localizedString'
      ),
      slug: localizedObject(
        fields.slug,
        'localizedSlug'
      ),
      germanMeatCut: localizedObject(
        fields.germanMeatCut,
        'localizedString'
      ),
      bild: singleAsset(
        fields.bild,
        'image',
        `${id}.bild`
      ),
      description: localizedPortableText(
        fields.description,
        `${id}.description`
      ),
      seoTitle: localizedObject(
        fields.seoTitle,
        'localizedString'
      ),
      seoDescription: localizedObject(
        fields.seoDescription,
        'localizedText'
      ),
    }
  }

  if (type === 'category') {
    return {
      ...base,
      name: localizedObject(
        fields.name,
        'localizedString'
      ),
      image: singleAsset(
        fields.image,
        'image',
        `${id}.image`
      ),
      order: unwrap(fields.order),
    }
  }

  if (type === 'recipeIngredient') {
    const ingredientTarget = singleReferenceToType(
      fields.ingredient,
      `${id}.ingredient`,
      'ingredient'
    )

    return {
      ...base,
      title: localizedObject(
        fields.title,
        'localizedString'
      ),
      ingredient: ingredientTarget.reference,
      legacyIngredientTargetId:
        ingredientTarget.legacyTargetId,
      legacyIngredientTargetType:
        ingredientTarget.legacyTargetType,
      quantity: localizedObject(
        fields.quantity,
        'localizedString'
      ),
      prepNote: localizedObject(
        fields.prepNote,
        'localizedString'
      ),
    }
  }

  if (type === 'step') {
    return {
      ...base,
      stepName: unwrap(fields.stepName),
      stepNumber: unwrap(fields.stepNumber),
      description: localizedPortableText(
        fields.description,
        `${id}.description`
      ),
      image: assetArray(
        fields.image,
        'image',
        `${id}.image`
      ),
      timerDuration:
        unwrap(fields.timerDuration),
      ingredientsUsed: referenceArray(
        fields.ingredientsUsed,
        `${id}.ingredientsUsed`
      ),
      heatLevel: unwrap(fields.heatLevel),
      doneWhen: localizedObject(
        fields.doneWhen,
        'localizedString'
      ),
    }
  }

  if (type === 'recipe') {
    return {
      ...base,
      titel: localizedObject(
        fields.titel,
        'localizedString'
      ),
      description: localizedPortableText(
        fields.description,
        `${id}.description`
      ),
      image: assetArray(
        fields.image,
        'image',
        `${id}.image`
      ),
      category: localizedObject(
        fields.category,
        'localizedString'
      ),
      preparationTime: localizedObject(
        fields.preparationTime,
        'localizedNumber'
      ),
      servings: localizedObject(
        fields.servings,
        'localizedNumber'
      ),
      ingredients: referenceArray(
        fields.ingredients,
        `${id}.ingredients`
      ),
      instructions: localizedPortableText(
        fields.instructions,
        `${id}.instructions`
      ),
      videoFile: singleAsset(
        fields.videoFile,
        'file',
        `${id}.videoFile`
      ),
      youTubeUrl:
        typeof unwrap(fields.youTubeUrl) === 'string'
          ? unwrap(fields.youTubeUrl)
          : undefined,
      slug: localizedObject(
        fields.slug,
        'localizedSlug'
      ),
      categories: referenceArray(
        fields.categories,
        `${id}.categories`
      ),
      steps: referenceArray(
        fields.steps,
        `${id}.steps`
      ),
      seoTitle: localizedObject(
        fields.seoTitle,
        'localizedString'
      ),
      seoDescription: localizedObject(
        fields.seoDescription,
        'localizedText'
      ),
      updatedDate:
        unwrap(fields.updatedDate),
      legacyContentfulUpdatedAt:
        entry.sys?.updatedAt,
    }
  }

  if (type === 'favoriteItem') {
    return {
      ...base,
      title: localizedObject(
        fields.title,
        'localizedString'
      ),
      memo: localizedObject(
        fields.memo,
        'localizedString'
      ),
      image: singleAsset(
        fields.image,
        'image',
        `${id}.image`
      ),
      links: unwrap(fields.links),
      relatedIngredients: referenceArray(
        fields.relatedIngredients,
        `${id}.relatedIngredients`
      ),
    }
  }

  if (type === 'gallery') {
    return {
      ...base,
      titel: localizedObject(
        fields.titel,
        'localizedString'
      ),
      bild: singleAsset(
        fields.bild,
        'image',
        `${id}.bild`
      ),
      location: localizedGeopoint(
        fields.location,
        `${id}.location`
      ),
      businessName: localizedObject(
        fields.businessName,
        'localizedString'
      ),
    }
  }

  if (type === 'galleryEmbed') {
    const source =
      unwrap(fields.html)

    return {
      ...base,
      html: source
        ? portableText(
            source,
            `${id}.html`
          )
        : undefined,
    }
  }

  throw new Error(
    `Unsupported content type: ${type}`
  )
}

const documents = entries.map(transformEntry)

const documentIds = new Set()
const typeCounts = {}

for (const document of documents) {
  if (documentIds.has(document._id)) {
    throw new Error(
      `Duplicate Sanity document ID: ${document._id}`
    )
  }

  documentIds.add(document._id)

  typeCounts[document._type] =
    (typeCounts[document._type] || 0) + 1
}

if (documents.length !== entries.length) {
  throw new Error(
    `Document count mismatch: ${documents.length} vs ${entries.length}`
  )
}

function validateReferences(value, sourceId) {
  if (!value) return

  if (Array.isArray(value)) {
    for (const item of value) {
      validateReferences(item, sourceId)
    }
    return
  }

  if (typeof value !== 'object') return

  if (
    value._type === 'reference' &&
    value._ref
  ) {
    if (
      !documentIds.has(value._ref) &&
      value._weak !== true
    ) {
      throw new Error(
        `Strong reference from ${sourceId} to missing ${value._ref}`
      )
    }

    return
  }

  for (const nested of Object.values(value)) {
    validateReferences(nested, sourceId)
  }
}

for (const document of documents) {
  validateReferences(
    document,
    document._id
  )
}

const ndjson =
  documents
    .map((document) =>
      JSON.stringify(document)
    )
    .join('\n') + '\n'

await fs.writeFile(
  outputPath,
  ndjson,
  'utf8'
)

const summary = {
  generatedAt: new Date().toISOString(),
  sourcePath,
  sourceSha256,
  outputPath,
  documents: documents.length,
  typeCounts,
  weakReferences,
  mismatchedTypedReferences,
  assetDirectives,
  uniqueContentfulAssetsUsed:
    usedAssetIds.size,
}

await fs.writeFile(
  summaryPath,
  `${JSON.stringify(summary, null, 2)}\n`,
  'utf8'
)

console.log('')
console.log('=== SANITY TRANSFORM SUMMARY ===')
console.log(`Source SHA-256: ${sourceSha256}`)
console.log(`Documents: ${documents.length}`)

for (
  const [type, count]
  of Object.entries(typeCounts)
    .sort(([a], [b]) => a.localeCompare(b))
) {
  console.log(`${type}: ${count}`)
}

console.log(
  `Asset directives: ${assetDirectives}`
)
console.log(
  `Unique Contentful assets used: ${usedAssetIds.size}`
)
console.log(
  `Weak references: ${weakReferences.length}`
)
console.log(
  `Legacy mismatched references: ${mismatchedTypedReferences.length}`
)
console.log(`NDJSON: ${outputPath}`)
console.log(`Summary: ${summaryPath}`)

if (weakReferences.length > 0) {
  console.log('')
  console.log('=== WEAK REFERENCES ===')

  for (const reference of weakReferences) {
    console.log(
      `${reference.source} -> ${reference.targetId}`
    )
  }
}
