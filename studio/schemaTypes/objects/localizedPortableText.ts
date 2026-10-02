import {defineField, defineType} from 'sanity'

export const localizedPortableText = defineType({
  name: 'localizedPortableText',
  title: 'Localized rich text',
  type: 'object',
  fields: [
    defineField({
      name: 'en',
      title: 'English',
      type: 'portableText',
    }),
    defineField({
      name: 'de',
      title: 'Deutsch',
      type: 'portableText',
    }),
  ],
})
