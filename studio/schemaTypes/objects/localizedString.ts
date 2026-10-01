import {defineField, defineType} from 'sanity'

export const localizedString = defineType({
  name: 'localizedString',
  title: 'Localized string',
  type: 'object',
  fields: [
    defineField({
      name: 'en',
      title: 'English',
      type: 'string',
    }),
    defineField({
      name: 'de',
      title: 'Deutsch',
      type: 'string',
    }),
  ],
})
