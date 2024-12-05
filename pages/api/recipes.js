import { createClient } from 'contentful';

const client = createClient({
  space: process.env.CONTENTFUL_SPACE_ID,
  accessToken: process.env.CONTENTFUL_ACCESS_TOKEN,
});

export default async function handler(req, res) {
  let { page = 1, limit = 20, locale = 'en' } = req.query;

  // 로케일 매핑
  if (locale === 'de-DE') {
    locale = 'de';
  } else if (locale === 'en-US') {
    locale = 'en';
  }

  console.log(
    `API Request Params - Page: ${page}, Limit: ${limit}, Locale: ${locale}`
  );

  try {
    const query = {
      content_type: 'recipe',
      locale: locale,
      include: 1,
      select:
        'fields.slug,fields.titel,fields.category,fields.image,fields.youTubeUrl',
      skip: (parseInt(page, 10) - 1) * parseInt(limit, 10),
      limit: parseInt(limit, 10),
    };

    const resEntries = await client.getEntries(query);

    console.log('Contentful response:', JSON.stringify(resEntries, null, 2));

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
        category: item.fields.category,
        youTubeUrl: item.fields.youTubeUrl || null,
        image: imageUrl || '/images/default.png',
      };
    });

    res.status(200).json({ recipes });
  } catch (error) {
    console.error('Error fetching recipes:', error);
    res.status(500).json({ error: 'Failed to fetch recipes.' });
  }
}
