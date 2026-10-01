import {defineField, defineType} from 'sanity'

export const galleryEmbed = defineType({
  name: 'galleryEmbed',
  title: 'Gallery Embed',
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
      name: 'html',
      title: 'Content',
      type: 'portableText',
    }),
  ],

  preview: {
    select: {
      legacyId: 'legacyContentfulId',
    },
    prepare({legacyId}) {
      return {
        title: 'Gallery Embed',
        subtitle: legacyId ? `Contentful: ${legacyId}` : undefined,
      }
    },
  },
})
