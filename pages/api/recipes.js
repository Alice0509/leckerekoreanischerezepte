import { createClient } from 'contentful';

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
        'fields.slug,fields.titel,fields.category,fields.image,fields.youTubeUrl',
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

    const recipes = resEntries.items.map((item) => {
      const imageAsset = item.fields.image;
      let imageUrl = null;

      if (imageAsset) {
        if (Array.isArray(imageAsset)) {
          const firstImage = imageAsset[0];

          if (firstImage?.sys?.id && assetsMap[firstImage.sys.id]) {
            imageUrl = `https:${assetsMap[firstImage.sys.id].fields.file.url}`;
          }
        } else if (imageAsset.sys?.id && assetsMap[imageAsset.sys.id]) {
          imageUrl = `https:${assetsMap[imageAsset.sys.id].fields.file.url}`;
        }
      }

      return {
        id: item.sys.id,
        slug: item.fields.slug,
        titel: item.fields.titel,
        category: item.fields.category || null,
        youTubeUrl: item.fields.youTubeUrl || null,
        image: imageUrl || '/images/default.png',
      };
    });

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
