import {defineArrayMember, defineField, defineType} from 'sanity'

export const favoriteItem = defineType({
  name: 'favoriteItem',
  title: 'Favorite Item',
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
      name: 'title',
      title: 'Title',
      type: 'localizedString',
    }),

    defineField({
      name: 'memo',
      title: 'Memo',
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
      name: 'links',
      title: 'Links',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'string',
        }),
      ],
    }),

    defineField({
      name: 'relatedIngredients',
      title: 'Related ingredients',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'reference',
          to: [{type: 'ingredient'}],
        }),
      ],
    }),
  ],

  preview: {
    select: {
      en: 'title.en',
      de: 'title.de',
      media: 'image',
      legacyId: 'legacyContentfulId',
    },
    prepare({en, de, media, legacyId}) {
      return {
        title: en || de || 'Untitled favorite item',
        subtitle: legacyId ? `Contentful: ${legacyId}` : undefined,
        media,
      }
    },
  },
})
