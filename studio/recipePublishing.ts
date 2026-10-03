type Fields = Record<string, unknown>

const asFields = (value: unknown): Fields =>
  value !== null && typeof value === 'object' ? (value as Fields) : {}

const hasText = (value: unknown): boolean => typeof value === 'string' && value.trim().length > 0

const hasReferences = (value: unknown): boolean =>
  Array.isArray(value) && value.some((item) => hasText(asFields(item)._ref))

const hasLocalizedText = (value: unknown): boolean => {
  const fields = asFields(value)
  return hasText(fields.en) || hasText(fields.de)
}

const hasInstructions = (value: unknown): boolean => {
  const fields = asFields(value)
  return [fields.en, fields.de].some(
    (blocks) =>
      Array.isArray(blocks) &&
      blocks.some((block) => {
        const children = asFields(block).children
        return Array.isArray(children) && children.some((child) => hasText(asFields(child).text))
      }),
  )
}

// Both authoring styles are supported by the current site build. New recipes
// can use references without filling the migrated legacy fields a second time.
export function validateRecipeStructure(value: unknown): true | string {
  if (value === undefined || value === null) return true

  const recipe = asFields(value)
  const issues: string[] = []

  if (!hasReferences(recipe.categories) && !hasLocalizedText(recipe.category)) {
    issues.push('기본 정보 탭에서 분류를 선택하세요.')
  }

  if (!hasReferences(recipe.steps) && !hasInstructions(recipe.instructions)) {
    issues.push('조리 단계 탭에서 단계를 추가하세요.')
  }

  return issues.length ? issues.join(' ') : true
}
