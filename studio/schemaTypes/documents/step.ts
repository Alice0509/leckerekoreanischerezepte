import {defineArrayMember, defineField, defineType} from 'sanity'

const heatLevels = [
  {title: 'Low', value: 'low'},
  {title: 'Medium-low', value: 'medium-low'},
  {title: 'Medium', value: 'medium'},
  {title: 'Medium-high', value: 'medium-high'},
  {title: 'High', value: 'high'},
]

export const step = defineType({
  name: 'step',
  title: 'Step',
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
      name: 'stepName',
      title: 'Step name',
      type: 'string',
    }),

    defineField({
      name: 'stepNumber',
      title: 'Step number',
      type: 'number',
      validation: (Rule) => Rule.required().integer().min(1),
    }),

    defineField({
      name: 'description',
      title: 'Description',
      type: 'localizedPortableText',
    }),

    defineField({
      name: 'image',
      title: 'Images',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'image',
          options: {
            hotspot: true,
          },
        }),
      ],
    }),

    defineField({
      name: 'timerDuration',
      title: 'Timer duration',
      description: 'Duration in seconds.',
      type: 'number',
      validation: (Rule) => Rule.integer().min(0),
    }),

    defineField({
      name: 'ingredientsUsed',
      title: 'Ingredients used',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'reference',
          to: [{type: 'recipeIngredient'}],
        }),
      ],
    }),

    defineField({
      name: 'heatLevel',
      title: 'Heat level',
      type: 'string',
      options: {
        list: heatLevels,
        layout: 'dropdown',
      },
      validation: (Rule) =>
        Rule.custom((value) => {
          if (value === undefined) return true

          return heatLevels.some((item) => item.value === value)
            ? true
            : 'Invalid heat level'
        }),
    }),

    defineField({
      name: 'doneWhen',
      title: 'Done when',
      type: 'localizedString',
    }),
  ],

  orderings: [
    {
      title: 'Step number',
      name: 'stepNumberAsc',
      by: [{field: 'stepNumber', direction: 'asc'}],
    },
  ],

  preview: {
    select: {
      stepName: 'stepName',
      stepNumber: 'stepNumber',
      legacyId: 'legacyContentfulId',
      media: 'image.0',
    },
    prepare({stepName, stepNumber, legacyId, media}) {
      const number = Number.isInteger(stepNumber) ? `Step ${stepNumber}` : 'Step'

      return {
        title: stepName ? `${number}: ${stepName}` : number,
        subtitle: legacyId ? `Contentful: ${legacyId}` : undefined,
        media,
      }
    },
  },
})
