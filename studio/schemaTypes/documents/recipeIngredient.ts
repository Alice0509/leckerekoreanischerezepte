import {defineField, defineType} from 'sanity'

export const recipeIngredient = defineType({
  name: 'recipeIngredient',
  title: 'Recipe Ingredient',
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
      name: 'title',
      title: 'Title',
      type: 'localizedString',
    }),

    defineField({
      name: 'ingredient',
      title: 'Ingredient',
      type: 'reference',
      to: [{type: 'ingredient'}],
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: 'quantity',
      title: 'Quantity',
      type: 'localizedString',
    }),

    defineField({
      name: 'prepNote',
      title: 'Prep note',
      type: 'localizedString',
    }),
  ],

  preview: {
    select: {
      en: 'title.en',
      de: 'title.de',
      ingredientEn: 'ingredient.name.en',
      ingredientDe: 'ingredient.name.de',
      legacyId: 'legacyContentfulId',
    },
    prepare({en, de, ingredientEn, ingredientDe, legacyId}) {
      const title =
        en ||
        de ||
        ingredientEn ||
        ingredientDe ||
        'Untitled recipe ingredient'

      return {
        title,
        subtitle: legacyId ? `Contentful: ${legacyId}` : undefined,
      }
    },
  },
})
