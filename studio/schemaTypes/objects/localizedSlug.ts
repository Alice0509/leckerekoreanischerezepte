import {defineField, defineType} from 'sanity'

export const localizedSlug = defineType({
  name: 'localizedSlug',
  title: 'Localized slug',
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
