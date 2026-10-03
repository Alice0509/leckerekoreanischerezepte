import {defineField, defineType} from 'sanity'

export const ingredient = defineType({
  name: 'ingredient',
  title: '식재료 사전',
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
      name: 'name',
      title: '식재료 이름',
      type: 'localizedString',
    }),

    defineField({
      name: 'slug',
      title: '페이지 주소 · Slug',
      type: 'localizedSlug',
    }),

    defineField({
      name: 'germanMeatCut',
      title: '독일 정육점 명칭 · 선택',
      type: 'localizedString',
    }),

    defineField({
      name: 'bild',
      title: '사진',
      type: 'image',
      options: {
        hotspot: true,
      },
    }),

    defineField({
      name: 'description',
      title: '식재료 소개',
      type: 'localizedPortableText',
    }),

    defineField({
      name: 'seoTitle',
      title: '검색 결과 제목 · 선택',
      type: 'localizedString',
    }),

    defineField({
      name: 'seoDescription',
      title: '검색 결과 설명 · 선택',
      type: 'localizedText',
    }),
  ],

  preview: {
    select: {
      en: 'name.en',
      de: 'name.de',
      media: 'bild',
      legacyId: 'legacyContentfulId',
    },
    prepare({en, de, media, legacyId}) {
      return {
        title: en || de || 'Untitled ingredient',
        subtitle: legacyId ? `Contentful: ${legacyId}` : undefined,
        media,
      }
    },
  },
})
