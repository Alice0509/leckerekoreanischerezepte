import {defineField, defineType} from 'sanity'

export const horizontalRule = defineType({
  name: 'horizontalRule',
  title: 'Horizontal rule',
  type: 'object',
  fields: [
    defineField({
      name: 'kind',
      type: 'string',
      initialValue: 'hr',
      readOnly: true,
      hidden: true,
    }),
  ],
  preview: {
    prepare() {
      return {
        title: 'Horizontal rule',
      }
    },
  },
})
