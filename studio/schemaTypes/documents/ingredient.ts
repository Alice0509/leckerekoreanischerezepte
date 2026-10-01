import {defineField, defineType} from 'sanity'

export const ingredient = defineType({
  name: 'ingredient',
  title: 'Ingredient',
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
      name: 'slug',
      title: 'Slug',
      type: 'localizedSlug',
    }),

    defineField({
      name: 'germanMeatCut',
      title: 'German meat cut',
      type: 'localizedString',
    }),

    defineField({
      name: 'bild',
      title: 'Image',
      type: 'image',
      options: {
        hotspot: true,
      },
    }),

    defineField({
      name: 'description',
      title: 'Description',
      type: 'localizedPortableText',
    }),

    defineField({
      name: 'seoTitle',
      title: 'SEO title',
      type: 'localizedString',
    }),

    defineField({
      name: 'seoDescription',
      title: 'SEO description',
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
