import {defineArrayMember, defineField, defineType} from 'sanity'
import {validateRecipeStructure} from '../../recipePublishing'

export const recipe = defineType({
  name: 'recipe',
  title: '레시피',
  type: 'document',

  groups: [
    {name: 'basics', title: '1 · 기본 정보', default: true},
    {name: 'ingredients', title: '2 · 재료'},
    {name: 'steps', title: '3 · 조리 단계'},
    {name: 'search', title: '4 · 검색·주소'},
    {name: 'extra', title: '추가 항목'},
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
      name: 'legacyContentfulUpdatedAt',
      title: 'Legacy Contentful updated at',
      type: 'datetime',
      description: 'Original Contentful sys.updatedAt preserved for migration history.',
      readOnly: true,
      hidden: true,
    }),

    defineField({
      name: 'titel',
      description: 'English와 Deutsch 제목을 각각 입력하세요.',
      group: 'basics',
      title: '레시피 제목',
      type: 'localizedString',
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: 'description',
      description: '음식의 특징과 맛을 English / Deutsch로 간단히 소개하세요.',
      group: 'basics',
      title: '레시피 소개',
      type: 'localizedPortableText',
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: 'image',
      description: '첫 번째 사진이 대표 이미지입니다. 사진을 끌어다 놓거나 업로드하세요.',
      group: 'basics',
      title: '대표 사진',
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
      name: 'category',
      description:
        '이전한 레시피에 보존된 값입니다. 새 레시피는 기본 정보의 분류를 선택하면 이 항목을 입력하지 않아도 됩니다.',
      group: 'extra',
      title: '분류 이름 · 기존 방식',
      type: 'localizedString',
    }),

    defineField({
      name: 'preparationTime',
      description: '예: 30. English와 Deutsch에 같은 분 단위 숫자를 입력하세요.',
      group: 'basics',
      title: '조리 시간 · 분',
      type: 'localizedNumber',
    }),

    defineField({
      name: 'servings',
      description: '예: 2. English와 Deutsch에 같은 인분 숫자를 입력하세요.',
      group: 'basics',
      title: '인분',
      type: 'localizedNumber',
    }),

    defineField({
      name: 'ingredients',
      description:
        '항목 추가에서 레시피 재료를 만들거나 선택하세요. 재료 문서에는 식재료, 분량, 손질 메모를 입력합니다. 재료를 먼저 Publish하고 레시피는 마지막에 Publish하세요.',
      group: 'ingredients',
      title: '이 레시피의 재료와 분량',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'reference',
          to: [{type: 'recipeIngredient'}],
        }),
      ],
      validation: (Rule) => Rule.required().min(1),
    }),

    defineField({
      name: 'instructions',
      description:
        '이전한 본문 조리 설명입니다. 새 레시피는 조리 단계 탭에서 단계를 추가하면 이 본문을 중복 입력하지 않아도 됩니다.',
      group: 'extra',
      title: '조리 설명 · 기존 방식',
      type: 'localizedPortableText',
    }),

    defineField({
      name: 'videoFile',
      group: 'extra',
      title: '동영상 파일 · 선택',
      type: 'file',
    }),

    defineField({
      name: 'youTubeUrl',
      group: 'extra',
      title: 'YouTube 주소 · 선택',
      type: 'string',
    }),

    defineField({
      name: 'slug',
      description:
        'English와 Deutsch 주소를 각각 입력하세요. 예: miyeokguk. 소문자 영문, 숫자, 하이픈을 사용하고 공개한 주소는 유지하세요.',
      group: 'search',
      title: '페이지 주소 · Slug',
      type: 'localizedSlug',
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: 'categories',
      description:
        '기존 분류를 선택하세요. 새 레시피는 이 분류를 사용하며, 추가 항목의 기존 분류 이름은 비워둘 수 있습니다.',
      group: 'basics',
      title: '분류',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'reference',
          to: [{type: 'category'}],
        }),
      ],
    }),

    defineField({
      name: 'steps',
      description:
        '항목 추가에서 조리 단계를 만들고 1, 2, 3 순서로 연결하세요. 각 단계를 먼저 Publish한 뒤 레시피를 마지막에 Publish하세요.',
      group: 'steps',
      title: '순서대로 조리 단계',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'reference',
          to: [{type: 'step'}],
        }),
      ],
    }),

    defineField({
      name: 'seoTitle',
      description: '비워두면 레시피 제목을 사용합니다.',
      group: 'search',
      title: '검색 결과 제목 · 선택',
      type: 'localizedString',
    }),

    defineField({
      name: 'seoDescription',
      description:
        '검색 결과에 보여줄 소개를 English / Deutsch로 입력하세요. 비워두면 레시피 소개를 사용합니다.',
      group: 'search',
      title: '검색 결과 설명 · 선택',
      type: 'localizedText',
    }),

    defineField({
      name: 'firstPublishedAt',
      title: '첫 공개 날짜 · 새 글 표시',
      type: 'datetime',
      group: 'search',
      description: '채팅 레시피의 일괄 발행 시 자동 기록됩니다. 일반 편집기로 만든 새 레시피는 실제 첫 공개 날짜를 입력하세요. 수정할 때는 바꾸지 않습니다. 이전한 레시피에 오늘 날짜를 넣지 마세요.',
    }),

    defineField({
      name: 'updatedDate',
      description: '레시피 내용을 실제로 업데이트한 날짜를 입력하세요.',
      group: 'search',
      title: '내용 수정일 · 선택',
      type: 'date',
    }),
  ],

  validation: (Rule) => Rule.custom(validateRecipeStructure),

  preview: {
    select: {
      en: 'titel.en',
      de: 'titel.de',
      slug: 'slug.en',
      legacyId: 'legacyContentfulId',
      media: 'image.0',
    },
    prepare({en, de, slug, legacyId, media}) {
      const details = [slug, legacyId ? `Contentful: ${legacyId}` : null]
        .filter(Boolean)
        .join(' · ')

      return {
        title: en || de || 'Untitled recipe',
        subtitle: details || undefined,
        media,
      }
    },
  },
})
