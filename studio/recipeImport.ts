export type Fields = Record<string, unknown>
export type Localized = {en: string; de: string}
export type Document = Fields & {_id: string; _type: string; _rev?: string}
export type Catalog = {
  ingredients: Document[]
  categories: Document[]
  recipes: Document[]
  assets: Document[]
}
export type RecipeInput = {
  format: 'hansik-recipe-v1'
  key: string
  title: Localized
  description: Localized
  slug: Localized
  preparationMinutes: number
  servings: number
  categoryIds: string[]
  ingredients: {ingredientId: string; quantity: Localized; prepNote?: Localized}[]
  steps: {description: Localized; timerSeconds?: number}[]
  seoTitle?: Localized
  seoDescription?: Localized
}
export type Mutation =
  | {create: Document}
  | {patch: {id: string; ifRevisionID: string; set: Fields}}
  | {delete: {id: string}}

export const fields = (value: unknown): Fields =>
  value !== null && typeof value === 'object' && !Array.isArray(value) ? (value as Fields) : {}

function fail(message: string): never {
  throw new Error(message)
}

function text(value: unknown, label: string, limit = 12000): string {
  if (typeof value !== 'string' || !value.trim() || value.length > limit) {
    fail(`${label}: 비어 있지 않은 글자를 입력하세요. (최대 ${limit}자)`)
  }
  return value.trim()
}

function only(value: unknown, keys: string[], label: string): Fields {
  const object = fields(value)
  if (Object.keys(object).some((key) => !keys.includes(key))) {
    fail(`${label}: 지원하지 않는 항목이 있습니다. 채팅에서 가져오기 파일을 다시 정리하세요.`)
  }
  return object
}

function localized(value: unknown, label: string): Localized {
  const object = only(value, ['en', 'de'], label)
  return {en: text(object.en, `${label} English`), de: text(object.de, `${label} Deutsch`)}
}

function integer(value: unknown, label: string, min: number, max: number): number {
  if (typeof value !== 'number' || !Number.isInteger(value) || value < min || value > max) {
    fail(`${label}: ${min}~${max} 사이의 정수를 입력하세요.`)
  }
  return value
}

function list(value: unknown, label: string, max: number): unknown[] {
  if (!Array.isArray(value) || value.length < 1 || value.length > max) {
    fail(`${label}: 1~${max}개 항목이 필요합니다.`)
  }
  return value
}

function publishedId(value: unknown, label: string): string {
  const id = text(value, label, 128)
  if (!/^[a-zA-Z0-9][a-zA-Z0-9_.-]*$/.test(id) || /^(drafts|versions)\./.test(id)) {
    fail(`${label}: 발행된 식재료·분류 목록에 있는 ID를 사용하세요.`)
  }
  return id
}

function slugPair(value: unknown): Localized {
  const result = localized(value, '페이지 주소')
  if ([result.en, result.de].some((slug) => !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug))) {
    fail('페이지 주소: 소문자 영문, 숫자, 하이픈만 사용하세요.')
  }
  return result
}

export function parseRecipeInput(source: string): RecipeInput {
  if (source.length > 100000) fail('파일이 너무 큽니다. 레시피 하나씩 가져오세요.')
  let value: unknown
  try {
    value = JSON.parse(source)
  } catch {
    fail('JSON 파일을 읽을 수 없습니다. 채팅에서 받은 파일이나 JSON 내용만 가져오세요.')
  }
  const object = only(
    value,
    [
      'format',
      'key',
      'title',
      'description',
      'slug',
      'preparationMinutes',
      'servings',
      'categoryIds',
      'ingredients',
      'steps',
      'seoTitle',
      'seoDescription',
    ],
    '레시피',
  )
  if (object.format !== 'hansik-recipe-v1') fail('Hansik Young 레시피 가져오기 형식이 아닙니다.')
  const key = text(object.key, '가져오기 이름', 60)
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(key))
    fail('가져오기 이름은 영문 소문자·숫자·하이픈으로 작성하세요.')
  const categoryIds = list(object.categoryIds, '분류', 10).map((id) => publishedId(id, '분류 ID'))
  if (new Set(categoryIds).size !== categoryIds.length) fail('같은 분류가 두 번 연결되어 있습니다.')
  return {
    format: 'hansik-recipe-v1',
    key,
    title: localized(object.title, '제목'),
    description: localized(object.description, '소개'),
    slug: slugPair(object.slug),
    preparationMinutes: integer(object.preparationMinutes, '조리 시간·분', 1, 1440),
    servings: integer(object.servings, '인분', 1, 100),
    categoryIds,
    ingredients: list(object.ingredients, '재료', 60).map((item, index) => {
      const row = only(item, ['ingredientId', 'quantity', 'prepNote'], `재료 ${index + 1}`)
      return {
        ingredientId: publishedId(row.ingredientId, '식재료 ID'),
        quantity: localized(row.quantity, `재료 ${index + 1} 분량`),
        ...(row.prepNote === undefined ? {} : {prepNote: localized(row.prepNote, '손질 메모')}),
      }
    }),
    steps: list(object.steps, '조리 단계', 40).map((item, index) => {
      const row = only(item, ['description', 'timerSeconds'], `단계 ${index + 1}`)
      return {
        description: localized(row.description, `단계 ${index + 1} 설명`),
        ...(row.timerSeconds === undefined
          ? {}
          : {
              timerSeconds: integer(row.timerSeconds, '타이머·초', 0, 86400),
            }),
      }
    }),
    ...(object.seoTitle === undefined ? {} : {seoTitle: localized(object.seoTitle, '검색 제목')}),
    ...(object.seoDescription === undefined
      ? {}
      : {seoDescription: localized(object.seoDescription, '검색 소개')}),
  }
}

export function recipeId(input: RecipeInput): string {
  return `chat-recipe-${input.key}`
}

function strongReference(id: string, key?: string): Fields {
  return {_type: 'reference', _ref: id, ...(key ? {_key: key} : {})}
}

function draftReference(id: string, type: string, key: string): Fields {
  return {...strongReference(id, key), _weak: true, _strengthenOnPublish: {type}}
}

function richText(value: string): Fields[] {
  return value.split(/\n\s*\n/).map((paragraph, index) => ({
    _type: 'block',
    _key: `p${index + 1}`,
    style: 'normal',
    markDefs: [],
    children: [{_type: 'span', _key: 'text', text: paragraph, marks: []}],
  }))
}

function localizedRichText(value: Localized): Fields {
  return {_type: 'localizedPortableText', en: richText(value.en), de: richText(value.de)}
}

function localizedString(value: Localized): Fields {
  return {_type: 'localizedString', ...value}
}

export function readText(value: unknown): string {
  if (typeof value === 'string') return value
  if (!Array.isArray(value)) return ''
  return value
    .map((block) => {
      const children = fields(block).children
      return Array.isArray(children)
        ? children
            .map((child) => {
              const value = fields(child).text
              return typeof value === 'string' ? value : ''
            })
            .join('')
        : ''
    })
    .join('\n\n')
}

function checkSlugs(slugs: Localized, catalog: Catalog, ownId?: string): void {
  for (const doc of catalog.recipes) {
    if (doc._id === ownId || doc._id === `drafts.${ownId}`) continue
    const slug = fields(doc.slug)
    if (slug.en === slugs.en || slug.de === slugs.de)
      fail('이미 사용 중인 레시피 주소입니다. 채팅에서 Slug를 바꿔 다시 정리하세요.')
  }
}

export function createDraftDocuments(input: RecipeInput, catalog: Catalog): Document[] {
  checkSlugs(input.slug, catalog)
  for (const row of input.ingredients) {
    if (
      !catalog.ingredients.some((doc) => doc._id === row.ingredientId && doc._type === 'ingredient')
    ) {
      fail('목록에 없는 식재료가 있습니다. 최신 식재료 목록을 채팅에 올려 다시 정리하세요.')
    }
  }
  for (const id of input.categoryIds) {
    if (!catalog.categories.some((doc) => doc._id === id && doc._type === 'category')) {
      fail('목록에 없는 분류입니다. 최신 목록을 채팅에 올려 다시 정리하세요.')
    }
  }
  const id = recipeId(input)
  const ingredients = input.ingredients.map((row, index): Document => ({
    _id: `drafts.${id}-ingredient-${index + 1}`,
    _type: 'recipeIngredient',
    title: localizedString({
      en: `${input.title.en} · ${index + 1}`,
      de: `${input.title.de} · ${index + 1}`,
    }),
    ingredient: strongReference(row.ingredientId),
    quantity: localizedString(row.quantity),
    ...(row.prepNote ? {prepNote: localizedString(row.prepNote)} : {}),
  }))
  const steps = input.steps.map((row, index): Document => ({
    _id: `drafts.${id}-step-${index + 1}`,
    _type: 'step',
    stepName: `${input.title.en} · ${index + 1}`,
    stepNumber: index + 1,
    description: localizedRichText(row.description),
    ...(row.timerSeconds === undefined ? {} : {timerDuration: row.timerSeconds}),
  }))
  const recipe: Document = {
    _id: `drafts.${id}`,
    _type: 'recipe',
    titel: localizedString(input.title),
    description: localizedRichText(input.description),
    slug: {_type: 'localizedSlug', en: input.slug.en, de: input.slug.de},
    preparationTime: {
      _type: 'localizedNumber',
      en: input.preparationMinutes,
      de: input.preparationMinutes,
    },
    servings: {_type: 'localizedNumber', en: input.servings, de: input.servings},
    categories: input.categoryIds.map((target, index) => strongReference(target, `c${index + 1}`)),
    ingredients: ingredients.map((doc, index) =>
      draftReference(doc._id.slice(7), doc._type, `i${index + 1}`),
    ),
    steps: steps.map((doc, index) => draftReference(doc._id.slice(7), doc._type, `s${index + 1}`)),
    ...(input.seoTitle ? {seoTitle: localizedString(input.seoTitle)} : {}),
    ...(input.seoDescription
      ? {seoDescription: {_type: 'localizedText', ...input.seoDescription}}
      : {}),
  }
  return [...ingredients, ...steps, recipe]
}

export function importMutations(documents: Document[], existing: Document[]): Mutation[] {
  const ids = documents.flatMap((doc) => [doc._id, doc._id.slice(7)])
  if (existing.some((doc) => ids.includes(doc._id))) {
    fail(
      '이미 가져온 레시피입니다. 기존 초안을 열어 수정하세요. 같은 파일을 다시 가져오지 않습니다.',
    )
  }
  return documents.map((create) => ({create}))
}

function referenceIds(value: unknown): string[] {
  return list(value, '연결 항목', 100).map((ref) => publishedId(fields(ref)._ref, '연결 ID'))
}

function allReferences(value: unknown): string[] {
  if (Array.isArray(value)) return value.flatMap(allReferences)
  const object = fields(value)
  if (object._type === 'reference') return [publishedId(object._ref, '연결 ID')]
  return Object.values(object).flatMap(allReferences)
}

function publicationCopy(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(publicationCopy)
  if (value === null || typeof value !== 'object') return value
  const object = fields(value)
  return Object.fromEntries(
    Object.entries(object)
      .filter(
        ([key]) =>
          !(object._type === 'reference' && ['_weak', '_strengthenOnPublish'].includes(key)),
      )
      .map(([key, child]) => [key, publicationCopy(child)]),
  )
}

function translatedBody(value: unknown, label: string): void {
  const object = fields(value)
  localized({en: readText(object.en), de: readText(object.de)}, label)
}

export type Publication = {
  recipe: Document
  ingredients: Document[]
  steps: Document[]
  mutations: Mutation[]
}

// Only the new recipe and its own linked documents can be published here.
// Each create fails on an existing published ID; each draft is revision-guarded.
export function preparePublication(id: string, bundle: Document[], catalog: Catalog): Publication {
  if (!/^chat-recipe-[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id))
    fail('이 메뉴에서 가져온 새 레시피만 함께 발행할 수 있습니다.')
  const byId = new Map(bundle.map((doc) => [doc._id, doc]))
  if (byId.has(id)) fail('이미 발행한 레시피입니다. 이후 수정은 일반 편집 화면에서 발행하세요.')
  const recipe = byId.get(`drafts.${id}`) || fail('레시피 초안을 찾을 수 없습니다.')
  if (recipe._type !== 'recipe') fail('레시피 문서 형식이 다릅니다.')
  const title = fields(recipe.titel)
  localized({en: title.en, de: title.de}, '제목')
  translatedBody(recipe.description, '소개')
  const slug = fields(recipe.slug)
  const slugs = slugPair({en: slug.en, de: slug.de})
  checkSlugs(slugs, catalog, id)
  for (const field of ['preparationTime', 'servings']) {
    const pair = fields(recipe[field])
    integer(pair.en, field, 1, field === 'servings' ? 100 : 1440)
    integer(pair.de, field, 1, field === 'servings' ? 100 : 1440)
    if (pair.en !== pair.de) fail('두 언어의 조리 시간·인분을 같은 숫자로 맞추세요.')
  }
  // _type metadata on localized objects is accepted during editing.
  const categoryIds = referenceIds(recipe.categories)
  if (categoryIds.some((target) => !catalog.categories.some((doc) => doc._id === target)))
    fail('분류를 발행된 분류에 연결하세요.')
  if (
    !Array.isArray(recipe.image) ||
    recipe.image.length < 1 ||
    recipe.image.some((image) => {
      const assetId = fields(fields(image).asset)._ref
      return !catalog.assets.some(
        (asset) => asset._id === assetId && asset._type === 'sanity.imageAsset',
      )
    })
  )
    fail('레시피 편집 화면의 기본 정보에서 대표 사진을 업로드하세요.')

  function child(target: string, type: string, suffix: string): Document {
    if (!new RegExp(`^${id}-${suffix}-[1-9][0-9]*$`).test(target)) {
      fail('다른 레시피의 재료·단계가 연결되어 있습니다. 이 레시피용 항목으로 연결하세요.')
    }
    if (byId.has(target) && byId.has(`drafts.${target}`))
      fail('이미 발행한 연결 문서에 새 수정이 있습니다. 일반 편집 화면에서 먼저 확인하세요.')
    const doc = byId.get(`drafts.${target}`) || byId.get(target) || fail('연결된 초안이 없습니다.')
    if (doc._type !== type) fail('연결된 문서 형식이 다릅니다.')
    return doc
  }
  const ingredientIds = referenceIds(recipe.ingredients)
  const stepIds = referenceIds(recipe.steps)
  if (
    new Set(ingredientIds).size !== ingredientIds.length ||
    new Set(stepIds).size !== stepIds.length
  )
    fail('같은 재료·단계가 두 번 연결되어 있습니다.')
  const ingredients = ingredientIds.map((target) => child(target, 'recipeIngredient', 'ingredient'))
  for (const doc of ingredients) {
    const quantity = fields(doc.quantity)
    localized({en: quantity.en, de: quantity.de}, '재료 분량')
    if (!catalog.ingredients.some((item) => item._id === fields(doc.ingredient)._ref))
      fail('식재료를 발행된 식재료 사전에 연결하세요.')
  }
  const steps = stepIds.map((target) => child(target, 'step', 'step'))
  const numbers = steps.map((doc) => integer(doc.stepNumber, '단계 번호', 1, 100))
  if (new Set(numbers).size !== numbers.length) fail('조리 단계 번호가 겹칩니다.')
  for (const doc of steps) {
    translatedBody(doc.description, '조리 단계 설명')
    if (doc.timerDuration !== undefined) integer(doc.timerDuration, '타이머·초', 0, 86400)
    if (
      doc.heatLevel !== undefined &&
      !['low', 'medium-low', 'medium', 'medium-high', 'high'].includes(String(doc.heatLevel))
    ) {
      fail('조리 단계의 불 세기를 목록에서 선택하세요.')
    }
    if (
      doc.image !== undefined &&
      (!Array.isArray(doc.image) ||
        doc.image.some(
          (image) =>
            !catalog.assets.some(
              (asset) =>
                asset._id === fields(fields(image).asset)._ref &&
                asset._type === 'sanity.imageAsset',
            ),
        ))
    )
      fail('조리 단계 사진을 올바른 이미지에 연결하세요.')
  }
  steps.sort((a, b) => Number(a.stepNumber) - Number(b.stepNumber))
  const documents = [...ingredients, ...steps, recipe]
  const available = new Set(
    [
      ...catalog.ingredients,
      ...catalog.categories,
      ...catalog.assets,
      ...documents.map((doc) => ({...doc, _id: doc._id.replace(/^drafts\./, '')})),
    ].map((doc) => doc._id),
  )
  if (documents.flatMap(allReferences).some((target) => !available.has(target)))
    fail('발행되지 않았거나 이 레시피에 속하지 않는 연결이 있습니다.')
  const mutations: Mutation[] = []
  for (const doc of documents.filter((item) => item._id.startsWith('drafts.'))) {
    if (!doc._rev) fail('초안 버전을 확인할 수 없습니다. 발행 내용을 다시 확인하세요.')
    const {_rev, _createdAt, _updatedAt, ...attributes} = doc
    void _rev
    void _createdAt
    void _updatedAt
    const published = publicationCopy({...attributes, _id: doc._id.slice(7)}) as Document
    mutations.push(
      {
        patch: {
          id: doc._id,
          ifRevisionID: doc._rev,
          set: {
            [doc._type === 'recipe' ? 'titel' : doc._type === 'step' ? 'description' : 'quantity']:
              doc[
                doc._type === 'recipe' ? 'titel' : doc._type === 'step' ? 'description' : 'quantity'
              ],
          },
        },
      },
      {create: published},
      {delete: {id: doc._id}},
    )
  }
  return {recipe, ingredients, steps, mutations}
}
