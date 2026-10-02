import {defineField, defineType} from 'sanity'

export const gallery = defineType({
  name: 'gallery',
  title: 'Gallery',
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
      name: 'titel',
      title: 'Title',
      type: 'localizedString',
    }),

    defineField({
      name: 'bild',
      title: 'Image',
      type: 'image',
      options: {
        hotspot: true,
      },
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: 'location',
      title: 'Location',
      type: 'localizedGeopoint',
    }),

    defineField({
      name: 'businessName',
      title: 'Business name',
      type: 'localizedString',
    }),
  ],

  preview: {
    select: {
      en: 'titel.en',
      de: 'titel.de',
      businessEn: 'businessName.en',
      media: 'bild',
    },
    prepare({en, de, businessEn, media}) {
      return {
        title: en || de || businessEn || 'Untitled gallery item',
        subtitle: businessEn || undefined,
        media,
      }
    },
  },
})
