import {defineField, defineType} from 'sanity'

export const localizedGeopoint = defineType({
  name: 'localizedGeopoint',
  title: 'Localized location',
  type: 'object',
  fields: [
    defineField({
      name: 'en',
      title: 'English',
      type: 'geopoint',
    }),
    defineField({
      name: 'de',
      title: 'Deutsch',
      type: 'geopoint',
    }),
  ],
})
