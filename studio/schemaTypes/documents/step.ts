import {defineArrayMember, defineField, defineType} from 'sanity'

const heatLevels = [
  {title: 'Low', value: 'low'},
  {title: 'Medium-low', value: 'medium-low'},
  {title: 'Medium', value: 'medium'},
  {title: 'Medium-high', value: 'medium-high'},
  {title: 'High', value: 'high'},
]

export const step = defineType({
  name: 'step',
  title: '조리 단계',
  type: 'document',

  groups: [
    {name: 'basics', title: '단계 설명·사진', default: true},
    {name: 'extra', title: '타이머·추가 안내'},
  ],

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
      name: 'stepName',
      description: '어느 레시피의 단계인지 구분할 이름입니다. 예: Miyeokguk · 1 · soak seaweed.',
      group: 'basics',
      title: '관리용 이름 · 선택',
      type: 'string',
    }),

    defineField({
      name: 'stepNumber',
      description: '1부터 순서대로 입력하세요. 사이트에서는 이 번호 순으로 표시됩니다.',
      group: 'basics',
      title: '단계 번호',
      type: 'number',
      validation: (Rule) => Rule.required().integer().min(1),
    }),

    defineField({
      name: 'description',
      description: 'English와 Deutsch 조리 설명을 각각 입력하세요.',
      group: 'basics',
      title: '조리 설명',
      type: 'localizedPortableText',
    }),

    defineField({
      name: 'image',
      group: 'basics',
      title: '단계 사진 · 선택',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'image',
          options: {
            hotspot: true,
          },
        }),
      ],
    }),

    defineField({
      name: 'timerDuration',
      description: '예: 5분은 300, 10분은 600입니다. 타이머가 필요 없으면 비워두세요.',
      group: 'extra',
      title: '타이머 · 초',
      type: 'number',
      validation: (Rule) => Rule.integer().min(0),
    }),

    defineField({
      name: 'ingredientsUsed',
      description: '레시피에서 연결한 동일한 레시피 재료 문서를 선택하세요.',
      group: 'extra',
      title: '이 단계에서 사용하는 재료 · 선택',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'reference',
          to: [{type: 'recipeIngredient'}],
        }),
      ],
    }),

    defineField({
      name: 'heatLevel',
      group: 'extra',
      title: '불 세기 · 선택',
      type: 'string',
      options: {
        list: heatLevels,
        layout: 'dropdown',
      },
      validation: (Rule) =>
        Rule.custom((value) => {
          if (value === undefined) return true

          return heatLevels.some((item) => item.value === value) ? true : 'Invalid heat level'
        }),
    }),

    defineField({
      name: 'doneWhen',
      description: '예: 양파가 투명해질 때까지. English와 Deutsch로 입력하세요.',
      group: 'extra',
      title: '완성 판단 기준 · 선택',
      type: 'localizedString',
    }),
  ],

  orderings: [
    {
      title: 'Step number',
      name: 'stepNumberAsc',
      by: [{field: 'stepNumber', direction: 'asc'}],
    },
  ],

  preview: {
    select: {
      stepName: 'stepName',
      stepNumber: 'stepNumber',
      legacyId: 'legacyContentfulId',
      media: 'image.0',
    },
    prepare({stepName, stepNumber, legacyId, media}) {
      const number = Number.isInteger(stepNumber) ? `Step ${stepNumber}` : 'Step'

      return {
        title: stepName ? `${number}: ${stepName}` : number,
        subtitle: legacyId ? `Contentful: ${legacyId}` : undefined,
        media,
      }
    },
  },
})
