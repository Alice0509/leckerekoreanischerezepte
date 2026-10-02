import {defineField, defineType} from 'sanity'

export const localizedNumber = defineType({
  name: 'localizedNumber',
  title: 'Localized number',
  type: 'object',
  fields: [
    defineField({
      name: 'en',
      title: 'English',
      type: 'number',
      validation: (Rule) => Rule.integer(),
    }),
    defineField({
      name: 'de',
      title: 'Deutsch',
      type: 'number',
      validation: (Rule) => Rule.integer(),
    }),
  ],
})
