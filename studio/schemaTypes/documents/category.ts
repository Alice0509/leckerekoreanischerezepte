import {defineField, defineType} from 'sanity'

export const category = defineType({
  name: 'category',
  title: '분류',
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
      title: '분류 이름',
      type: 'localizedString',
    }),

    defineField({
      name: 'image',
      title: '사진',
      type: 'image',
      options: {
        hotspot: true,
      },
    }),

    defineField({
      name: 'order',
      title: '표시 순서',
      type: 'number',
      validation: (Rule) => Rule.integer(),
    }),
  ],

  preview: {
    select: {
      en: 'name.en',
      de: 'name.de',
      media: 'image',
      order: 'order',
    },
    prepare({en, de, media, order}) {
      return {
        title: en || de || 'Untitled category',
        subtitle: Number.isInteger(order) ? `Order: ${order}` : undefined,
        media,
      }
    },
  },
})
