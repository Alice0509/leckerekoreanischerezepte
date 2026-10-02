import {defineArrayMember, defineField, defineType} from 'sanity'

export const recipe = defineType({
  name: 'recipe',
  title: 'Recipe',
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
      name: 'titel',
      title: 'Title',
      type: 'localizedString',
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: 'description',
      title: 'Description',
      type: 'localizedPortableText',
      validation: (Rule) => Rule.required(),
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
      name: 'category',
      title: 'Legacy category label',
      type: 'localizedString',
      description: 'Legacy Contentful category text preserved during migration.',
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: 'preparationTime',
      title: 'Preparation time',
      type: 'localizedNumber',
    }),

    defineField({
      name: 'servings',
      title: 'Servings',
      type: 'localizedNumber',
    }),

    defineField({
      name: 'ingredients',
      title: 'Ingredients',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'reference',
          to: [{type: 'recipeIngredient'}],
        }),
      ],
      validation: (Rule) => Rule.required().min(1),
    }),

    defineField({
      name: 'instructions',
      title: 'Instructions',
      type: 'localizedPortableText',
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: 'videoFile',
      title: 'Video file',
      type: 'file',
    }),

    defineField({
      name: 'youTubeUrl',
      title: 'YouTube URL',
      type: 'string',
    }),

    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'localizedSlug',
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: 'categories',
      title: 'Categories',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'reference',
          to: [{type: 'category'}],
        }),
      ],
    }),

    defineField({
      name: 'steps',
      title: 'Steps',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'reference',
          to: [{type: 'step'}],
        }),
      ],
    }),

    defineField({
      name: 'seoTitle',
      title: 'SEO title',
      type: 'localizedString',
    }),

    defineField({
      name: 'seoDescription',
      title: 'SEO description',
      type: 'localizedText',
    }),

    defineField({
      name: 'updatedDate',
      title: 'Updated date',
      type: 'date',
    }),
  ],

  preview: {
    select: {
      en: 'titel.en',
      de: 'titel.de',
      slug: 'slug.en',
      legacyId: 'legacyContentfulId',
      media: 'image.0',
    },
    prepare({en, de, slug, legacyId, media}) {
      const details = [slug, legacyId ? `Contentful: ${legacyId}` : null]
        .filter(Boolean)
        .join(' · ')

      return {
        title: en || de || 'Untitled recipe',
        subtitle: details || undefined,
        media,
      }
    },
  },
})
