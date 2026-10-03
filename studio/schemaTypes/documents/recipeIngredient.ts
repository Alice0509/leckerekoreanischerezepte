import {defineField, defineType} from 'sanity'

export const recipeIngredient = defineType({
  name: 'recipeIngredient',
  title: '레시피 재료 · 분량',
  type: 'document',

  fields: [
    defineField({
      name: 'legacyContentfulId',
      hidden: true,
      title: '이전 기록 ID',
      type: 'string',
      description: 'Original Contentful entry ID preserved for migration traceability.',
      readOnly: true,
    }),

    defineField({
      name: 'title',
      description:
        '다른 레시피의 재료와 구분할 이름입니다. 예: Miyeokguk · dried seaweed. 비워두면 선택한 식재료 이름이 목록에 표시됩니다.',
      title: '관리용 이름 · 선택',
      type: 'localizedString',
    }),

    defineField({
      name: 'ingredient',
      description:
        '기존 식재료를 검색해서 선택하세요. 새 식재료가 필요하면 먼저 만들고 Publish하세요.',
      title: '식재료 선택',
      type: 'reference',
      to: [{type: 'ingredient'}],
    }),

    defineField({
      name: 'legacyIngredientTargetId',
      title: 'Legacy ingredient target ID',
      type: 'string',
      readOnly: true,
      hidden: true,
    }),

    defineField({
      name: 'legacyIngredientTargetType',
      title: 'Legacy ingredient target type',
      type: 'string',
      readOnly: true,
      hidden: true,
    }),

    defineField({
      name: 'quantity',
      description:
        'English / Deutsch 분량을 입력하세요. 예: 20 g, 1 tbsp / 1 EL. 단계에서 다시 사용할 수 있으므로 이 레시피용으로 만드세요.',
      title: '분량',
      type: 'localizedString',
    }),

    defineField({
      name: 'prepNote',
      description: '예: thinly sliced / in dünne Scheiben geschnitten.',
      title: '손질 메모 · 선택',
      type: 'localizedString',
    }),
  ],

  preview: {
    select: {
      en: 'title.en',
      de: 'title.de',
      ingredientEn: 'ingredient.name.en',
      ingredientDe: 'ingredient.name.de',
      legacyId: 'legacyContentfulId',
    },
    prepare({en, de, ingredientEn, ingredientDe, legacyId}) {
      const title = en || de || ingredientEn || ingredientDe || 'Untitled recipe ingredient'

      return {
        title,
        subtitle: legacyId ? `Contentful: ${legacyId}` : undefined,
      }
    },
  },
})
