import {defineField, defineType} from 'sanity'

export const localizedText = defineType({
  name: 'localizedText',
  title: 'Localized text',
  type: 'object',
  fields: [
    defineField({
      name: 'en',
      title: 'English',
      type: 'text',
    }),
    defineField({
      name: 'de',
      title: 'Deutsch',
      type: 'text',
    }),
  ],
})
