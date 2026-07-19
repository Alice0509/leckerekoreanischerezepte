import { createClient } from 'contentful';
import { getRecipeCategoryFromFields } from '../../lib/recipeCategories';

const client = createClient({
  space: process.env.CONTENTFUL_SPACE_ID,
  accessToken: process.env.CONTENTFUL_ACCESS_TOKEN,
});

export default async function handler(req, res) {
  let { page = 1, limit = 20, locale = 'en' } = req.query;

  if (locale === 'de-DE') {
    locale = 'de';
  } else if (locale === 'en-US') {
    locale = 'en';
  }

  const parsedPage = Math.max(parseInt(page, 10) || 1, 1);
  const parsedLimit = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 50);

  try {
    const query = {
      content_type: 'recipe',
      locale,
      include: 1,
      select:
        'fields.slug,fields.titel,fields.category,fields.categories,fields.image,fields.youTubeUrl',
      skip: (parsedPage - 1) * parsedLimit,
      limit: parsedLimit,
    };

    const resEntries = await client.getEntries(query);

    const assetsMap = {};

    if (resEntries.includes && resEntries.includes.Asset) {
      resEntries.includes.Asset.forEach((asset) => {
        assetsMap[asset.sys.id] = asset;
      });
    }

    const resolveImageUrl = async (imageField) => {
      const image = Array.isArray(imageField) ? imageField[0] : imageField;
      if (!image) return null;

      const directUrl = image.fields?.file?.url;
      if (directUrl) {
        return directUrl.startsWith('//') ? `https:${directUrl}` : directUrl;
      }

      const assetUrl = image.sys?.id
        ? assetsMap[image.sys.id]?.fields?.file?.url
        : null;

      if (assetUrl) {
        return assetUrl.startsWith('//') ? `https:${assetUrl}` : assetUrl;
      }

      if (image.sys?.id) {
        try {
          const asset = await client.getAsset(image.sys.id, { locale });
          const fallbackUrl = asset.fields?.file?.url;

          if (fallbackUrl) {
            return fallbackUrl.startsWith('//')
              ? `https:${fallbackUrl}`
              : fallbackUrl;
          }
        } catch (error) {
          console.warn(
            `Could not resolve recipe image asset ${image.sys.id}:`,
            error.message
          );
        }
      }

      return null;
    };

    const recipes = await Promise.all(
      resEntries.items.map(async (item) => {
        const imageUrl = await resolveImageUrl(item.fields.image);
        const categoryData = getRecipeCategoryFromFields(item.fields, locale);

        return {
          id: item.sys.id,
          slug: item.fields.slug,
          titel: item.fields.titel,
          category: categoryData.label,
          categoryKey: categoryData.key,
          youTubeUrl: item.fields.youTubeUrl || null,
          image: imageUrl || '/images/default.png',
        };
      })
    );

    res.setHeader(
      'Cache-Control',
      's-maxage=43200, stale-while-revalidate=86400'
    );

    res.status(200).json({ recipes });
  } catch (error) {
    console.error('Error fetching recipes:', error);

    res.status(500).json({
      error: 'Failed to fetch recipes.',
    });
  }
}
