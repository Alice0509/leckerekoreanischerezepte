import fs from 'node:fs/promises'

const raw = await fs.readFile(
  'migration-data/sanity-import.ndjson',
  'utf8'
)

const docs = raw
  .trim()
  .split('\n')
  .map((line) => JSON.parse(line))

const errors = []
const byId = new Map(docs.map((doc) => [doc._id, doc]))

const expectedCounts = {
  category: 7,
  favoriteItem: 4,
  gallery: 5,
  galleryEmbed: 1,
  ingredient: 143,
  recipe: 52,
  recipeIngredient: 504,
  step: 307,
}

const counts = {}

for (const doc of docs) {
  counts[doc._type] = (counts[doc._type] || 0) + 1
}

if (docs.length !== 1023) {
  errors.push(`document count ${docs.length} != 1023`)
}

if (byId.size !== docs.length) {
  errors.push('duplicate _id found')
}

for (const [type, expected] of Object.entries(expectedCounts)) {
  if ((counts[type] || 0) !== expected) {
    errors.push(`${type}: ${counts[type] || 0} != ${expected}`)
  }
}

function checkRef(ref, expectedType, source) {
  if (!ref?._ref) return

  const target = byId.get(ref._ref)

  if (!target) {
    if (ref._weak === true) return
    errors.push(`${source}: missing target ${ref._ref}`)
    return
  }

  if (target._type !== expectedType) {
    errors.push(
      `${source}: expected ${expectedType}, got ${target._type}`
    )
  }
}

for (const doc of docs) {
  if (doc._type === 'recipe') {
    for (const ref of doc.ingredients || []) {
      checkRef(ref, 'recipeIngredient', `${doc._id}.ingredients`)
    }
    for (const ref of doc.steps || []) {
      checkRef(ref, 'step', `${doc._id}.steps`)
    }
    for (const ref of doc.categories || []) {
      checkRef(ref, 'category', `${doc._id}.categories`)
    }
  }

  if (doc._type === 'recipeIngredient' && doc.ingredient) {
    checkRef(doc.ingredient, 'ingredient', `${doc._id}.ingredient`)
  }

  if (doc._type === 'step') {
    for (const ref of doc.ingredientsUsed || []) {
      checkRef(ref, 'recipeIngredient', `${doc._id}.ingredientsUsed`)
    }
  }

  if (doc._type === 'favoriteItem') {
    for (const ref of doc.relatedIngredients || []) {
      checkRef(ref, 'ingredient', `${doc._id}.relatedIngredients`)
    }
  }
}

const legacy = docs.filter(
  (doc) =>
    doc._type === 'recipeIngredient' &&
    doc.legacyIngredientTargetId
)

if (legacy.length !== 7) {
  errors.push(`legacy mismatches ${legacy.length} != 7`)
}

for (const doc of legacy) {
  if (doc.ingredient) {
    errors.push(`${doc._id}: legacy mismatch still has ingredient ref`)
  }

  if (doc.legacyIngredientTargetType !== 'recipe') {
    errors.push(
      `${doc._id}: legacy type is ${doc.legacyIngredientTargetType}`
    )
  }
}

let assetDirectives = 0

function walk(value) {
  if (!value) return

  if (Array.isArray(value)) {
    value.forEach(walk)
    return
  }

  if (typeof value !== 'object') return

  if (typeof value._sanityAsset === 'string') {
    assetDirectives += 1

    if (!/^image@https:\/\/|^file@https:\/\//.test(value._sanityAsset)) {
      errors.push(`invalid asset directive: ${value._sanityAsset}`)
    }
  }

  Object.values(value).forEach(walk)
}

docs.forEach(walk)

if (assetDirectives !== 138) {
  errors.push(`asset directives ${assetDirectives} != 138`)
}

console.log('=== SANITY IMPORT VALIDATION ===')
console.log(`Documents: ${docs.length}`)
console.log(`Legacy preserved: ${legacy.length}`)
console.log(`Asset directives: ${assetDirectives}`)
console.log(`Errors: ${errors.length}`)
console.log(errors.length === 0 ? 'RESULT: PASS' : 'RESULT: FAIL')

if (errors.length > 0) {
  for (const error of errors.slice(0, 20)) {
    console.log(`- ${error}`)
  }
}
