import {defineField, defineType} from 'sanity'

export const category = defineType({
  name: 'category',
  title: 'Category',
  type: 'document',

  fields: [
    defineField({
      name: 'legacyContentfulId',
      title: 'Legacy Contentful ID',
      type: 'string',
      description: 'Original Contentful entry ID preserved for migration traceability.',
      readOnly: true,
    }),

    defineField({
      name: 'name',
      title: 'Name',
      type: 'localizedString',
    }),

    defineField({
      name: 'image',
      title: 'Image',
      type: 'image',
      options: {
        hotspot: true,
      },
    }),

    defineField({
      name: 'order',
      title: 'Order',
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
