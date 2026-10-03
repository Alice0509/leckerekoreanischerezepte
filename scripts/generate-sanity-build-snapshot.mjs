import fs from 'node:fs/promises';
import path from 'node:path';
import { createClient } from '@sanity/client';

const projectId = process.env.SANITY_PROJECT_ID || 'o9hshko6';
const dataset = process.env.SANITY_DATASET || 'production';
const apiVersion = process.env.SANITY_API_VERSION || '2025-08-15';

const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
});

const snapshotPath = path.join(
  process.cwd(),
  '.next',
  'cache',
  'contentful-build-snapshot.json'
);

const query = `{
  "recipes": *[_type == "recipe"] | order(_createdAt asc),
  "ingredients": *[_type == "ingredient"] | order(_createdAt asc),
  "recipeIngredients": *[_type == "recipeIngredient"] | order(_createdAt asc),
  "steps": *[_type == "step"] | order(_createdAt asc),
  "categories": *[_type == "category"] | order(_createdAt asc),
  "favorites": *[_type == "favoriteItem"] | order(_createdAt asc),
  "galleries": *[_type == "gallery"] | order(_createdAt asc),
  "assets": *[_type in ["sanity.imageAsset", "sanity.fileAsset"]]{
    _id,
    _type,
    _createdAt,
    _updatedAt,
    url,
    mimeType,
    size,
    originalFilename,
    metadata {
      dimensions {
        width,
        height
      }
    }
  }
}`;

const data = await client.fetch(query);

const byId = (items = []) =>
  new Map(items.filter((item) => item?._id).map((item) => [item._id, item]));

const assetDocs = byId(data.assets);

const localized = (value, locale) => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return value;
  }

  if ('en' in value || 'de' in value) {
    return value[locale];
  }

  return value;
};

const protocolRelative = (url) =>
  typeof url === 'string' ? url.replace(/^https?:/, '') : url;

const compact = (object) =>
  Object.fromEntries(
    Object.entries(object).filter(([, value]) => value !== undefined)
  );

const entrySys = (doc, contentType, locale) => ({
  id: doc.legacyContentfulId || doc._id,
  type: 'Entry',
  createdAt: doc._createdAt,
  updatedAt: doc._updatedAt,
  locale,
  contentType: {
    sys: {
      type: 'Link',
      linkType: 'ContentType',
      id: contentType,
    },
  },
});

const emptyMetadata = () => ({
  tags: [],
  concepts: [],
});

const assetToContentful = (assetRef, locale) => {
  const assetId = assetRef?.asset?._ref || assetRef?._ref || assetRef?._id;

  if (!assetId) return undefined;

  const asset = assetDocs.get(assetId);

  if (!asset?.url) {
    throw new Error(`Missing Sanity asset: ${assetId}`);
  }

  const width = asset.metadata?.dimensions?.width;
  const height = asset.metadata?.dimensions?.height;

  return {
    metadata: emptyMetadata(),
    sys: {
      id: asset._id,
      type: 'Asset',
      createdAt: asset._createdAt,
      updatedAt: asset._updatedAt,
      locale,
    },
    fields: {
      title: asset.originalFilename || '',
      description: '',
      file: {
        url: protocolRelative(asset.url),
        details: {
          size: asset.size || 0,
          ...(width && height
            ? {
                image: {
                  width,
                  height,
                },
              }
            : {}),
        },
        fileName: asset.originalFilename || '',
        contentType: asset.mimeType || '',
      },
    },
  };
};

const decoratorMarks = (marks = []) =>
  marks
    .filter((mark) => mark === 'strong' || mark === 'em')
    .map((mark) => ({
      type: mark === 'strong' ? 'bold' : 'italic',
    }));

const inlineToContentful = (block) => {
  const markDefs = new Map(
    (block.markDefs || [])
      .filter((mark) => mark?._key)
      .map((mark) => [mark._key, mark])
  );

  return (block.children || []).flatMap((span) => {
    if (span?._type !== 'span') return [];

    const marks = span.marks || [];
    const text = {
      nodeType: 'text',
      value: span.text || '',
      marks: decoratorMarks(marks),
      data: {},
    };

    const link = marks
      .map((mark) => markDefs.get(mark))
      .find((markDef) => markDef?._type === 'link' && markDef.href);

    if (!link) return [text];

    return [
      {
        nodeType: 'hyperlink',
        data: {
          uri: link.href,
        },
        content: [text],
      },
    ];
  });
};

const textBlockToContentful = (block, nodeType = 'paragraph') => ({
  nodeType,
  data: {},
  content: inlineToContentful(block),
});

const listNodeType = (listItem) =>
  listItem === 'number' ? 'ordered-list' : 'unordered-list';

const consumeList = (blocks, start, level, listItem) => {
  const node = {
    nodeType: listNodeType(listItem),
    data: {},
    content: [],
  };

  let index = start;

  while (index < blocks.length) {
    const block = blocks[index];

    if (block?._type !== 'block' || !block.listItem) break;

    const currentLevel = block.level || 1;

    if (currentLevel < level) break;

    if (currentLevel > level) {
      const lastItem = node.content.at(-1);

      if (!lastItem) break;

      const nested = consumeList(blocks, index, currentLevel, block.listItem);

      lastItem.content.push(nested.node);
      index = nested.next;
      continue;
    }

    if (block.listItem !== listItem) break;

    const item = {
      nodeType: 'list-item',
      data: {},
      content: [textBlockToContentful(block)],
    };

    node.content.push(item);
    index += 1;

    while (index < blocks.length) {
      const nextBlock = blocks[index];

      if (nextBlock?._type !== 'block' || !nextBlock.listItem) break;

      const nextLevel = nextBlock.level || 1;

      if (nextLevel <= level) break;

      const nested = consumeList(
        blocks,
        index,
        nextLevel,
        nextBlock.listItem
      );

      item.content.push(nested.node);
      index = nested.next;
    }
  }

  return {
    node,
    next: index,
  };
};

const portableTextToContentful = (blocks) => {
  if (!Array.isArray(blocks)) return undefined;

  const content = [];
  let index = 0;

  while (index < blocks.length) {
    const block = blocks[index];

    if (block?._type === 'horizontalRule') {
      content.push({
        nodeType: 'hr',
        data: {},
        content: [],
      });
      index += 1;
      continue;
    }

    if (block?._type !== 'block') {
      throw new Error(
        `Unsupported Portable Text block: ${block?._type || 'unknown'}`
      );
    }

    if (block.listItem) {
      const list = consumeList(
        blocks,
        index,
        block.level || 1,
        block.listItem
      );

      content.push(list.node);
      index = list.next;
      continue;
    }

    if (block.style === 'blockquote') {
      content.push({
        nodeType: 'blockquote',
        data: {},
        content: [textBlockToContentful(block)],
      });
      index += 1;
      continue;
    }

    const nodeType =
      ['h2', 'h3', 'h4', 'h5'].includes(block.style)
        ? `heading-${block.style.slice(1)}`
        : 'paragraph';

    content.push(textBlockToContentful(block, nodeType));
    index += 1;
  }

  return {
    nodeType: 'document',
    data: {},
    content,
  };
};

const makeEntry = (doc, contentType, locale, fields) => ({
  metadata: emptyMetadata(),
  sys: entrySys(doc, contentType, locale),
  fields: compact(fields),
});

const makeLocaleEntries = (locale) => {
  const ingredients = new Map();

  for (const doc of data.ingredients || []) {
    ingredients.set(
      doc._id,
      makeEntry(doc, 'ingredient', locale, {
        name: localized(doc.name, locale),
        slug: localized(doc.slug, locale),
        germanMeatCut: localized(doc.germanMeatCut, locale),
        bild: assetToContentful(doc.bild, locale),
        description: portableTextToContentful(localized(doc.description, locale)),
        seoTitle: localized(doc.seoTitle, locale),
        seoDescription: localized(doc.seoDescription, locale),
      })
    );
  }

  const recipeIngredients = new Map();

  for (const doc of data.recipeIngredients || []) {
    const ingredientId = doc.ingredient?._ref;

    recipeIngredients.set(
      doc._id,
      makeEntry(doc, 'recipeIngredient', locale, {
        title: localized(doc.title, locale),
        ingredient: ingredientId ? ingredients.get(ingredientId) : undefined,
        quantity: localized(doc.quantity, locale),
        prepNote: localized(doc.prepNote, locale),
      })
    );
  }

  const steps = new Map();

  for (const doc of data.steps || []) {
    steps.set(
      doc._id,
      makeEntry(doc, 'step', locale, {
        stepName: doc.stepName,
        stepNumber: doc.stepNumber,
        description: portableTextToContentful(localized(doc.description, locale)),
        image: (doc.image || [])
          .map((asset) => assetToContentful(asset, locale))
          .filter(Boolean),
        timerDuration: doc.timerDuration,
        ingredientsUsed: (doc.ingredientsUsed || [])
          .map((reference) => recipeIngredients.get(reference?._ref))
          .filter(Boolean),
        heatLevel: doc.heatLevel,
        doneWhen: localized(doc.doneWhen, locale),
      })
    );
  }

  const categories = new Map();

  for (const doc of data.categories || []) {
    categories.set(
      doc._id,
      makeEntry(doc, 'category', locale, {
        name: localized(doc.name, locale),
        image: assetToContentful(doc.image, locale),
        order: doc.order,
      })
    );
  }

  const favorites = (data.favorites || []).map((doc) =>
    makeEntry(doc, 'favoriteItem', locale, {
      title: localized(doc.title, locale),
      memo: localized(doc.memo, locale),
      image: assetToContentful(doc.image, locale),
      links: doc.links,
      relatedIngredients: (doc.relatedIngredients || [])
        .map((reference) => ingredients.get(reference?._ref))
        .filter(Boolean),
    })
  );

  const galleries = (data.galleries || []).map((doc) =>
    makeEntry(doc, 'gallery', locale, {
      titel: localized(doc.titel, locale),
      bild: assetToContentful(doc.bild, locale),
      location: localized(doc.location, locale),
      businessName: localized(doc.businessName, locale),
    })
  );

  const recipes = (data.recipes || []).map((doc) =>
    makeEntry(doc, 'recipe', locale, {
      titel: localized(doc.titel, locale),
      description: portableTextToContentful(localized(doc.description, locale)),
      image: (doc.image || [])
        .map((asset) => assetToContentful(asset, locale))
        .filter(Boolean),
      category: localized(doc.category, locale),
      preparationTime: localized(doc.preparationTime, locale),
      servings: localized(doc.servings, locale),
      ingredients: (doc.ingredients || [])
        .map((reference) => recipeIngredients.get(reference?._ref))
        .filter(Boolean),
      instructions: portableTextToContentful(localized(doc.instructions, locale)),
      videoFile: assetToContentful(doc.videoFile, locale),
      youTubeUrl:
        typeof doc.youTubeUrl === 'string' ? doc.youTubeUrl : undefined,
      slug: localized(doc.slug, locale),
      categories: (doc.categories || [])
        .map((reference) => categories.get(reference?._ref))
        .filter(Boolean),
      steps: (doc.steps || [])
        .map((reference) => steps.get(reference?._ref))
        .filter(Boolean),
      seoTitle: localized(doc.seoTitle, locale),
      seoDescription: localized(doc.seoDescription, locale),
      updatedDate: doc.updatedDate,
      legacyContentfulUpdatedAt: doc.legacyContentfulUpdatedAt,
    })
  );

  const allAssets = [...assetDocs.values()].map((asset) =>
    assetToContentful({ _id: asset._id }, locale)
  );

  const response = (items, includes = {}) => ({
    items,
    total: items.length,
    skip: 0,
    limit: items.length,
    includes,
  });

  return {
    recipes: response(recipes, {
      Entry: [
        ...recipeIngredients.values(),
        ...ingredients.values(),
        ...steps.values(),
        ...categories.values(),
      ],
      Asset: allAssets,
    }),
    ingredients: response([...ingredients.values()], {
      Asset: allAssets,
    }),
    favorites: response(favorites, {
      Entry: [...ingredients.values()],
      Asset: allAssets,
    }),
    galleries: response(galleries, {
      Asset: allAssets,
    }),
  };
};

console.log(
  `[sanity snapshot] Fetching ${dataset} from project ${projectId}...`
);

const de = makeLocaleEntries('de');
const en = makeLocaleEntries('en');

const snapshot = {
  version: 1,
  source: 'sanity',
  generatedAt: new Date().toISOString(),
  locales: {
    de,
    en,
  },
};

// Keep the migration inventory as a minimum completeness check, not a cap.
// Publishing new content must not require changing this build script.
for (const locale of ['de', 'en']) {
  const localeData = snapshot.locales[locale];

  if (localeData.recipes.items.length < 52) {
    throw new Error(
      `Expected at least 52 ${locale.toUpperCase()} recipes, got ${localeData.recipes.items.length}`
    );
  }

  if (localeData.ingredients.items.length < 143) {
    throw new Error(
      `Expected at least 143 ${locale.toUpperCase()} ingredients, got ${localeData.ingredients.items.length}`
    );
  }

  if (localeData.favorites.items.length < 4) {
    throw new Error(
      `Expected at least 4 ${locale.toUpperCase()} favorites, got ${localeData.favorites.items.length}`
    );
  }

  if (localeData.galleries.items.length < 5) {
    throw new Error(
      `Expected at least 5 ${locale.toUpperCase()} galleries, got ${localeData.galleries.items.length}`
    );
  }
}

await fs.mkdir(path.dirname(snapshotPath), {
  recursive: true,
});

await fs.writeFile(snapshotPath, `${JSON.stringify(snapshot)}\n`, 'utf8');

console.log(
  `[sanity snapshot] DE: ${de.recipes.items.length} recipes, ` +
    `${de.ingredients.items.length} ingredients, ` +
    `${de.favorites.items.length} favorites`
);

console.log(
  `[sanity snapshot] EN: ${en.recipes.items.length} recipes, ` +
    `${en.ingredients.items.length} ingredients, ` +
    `${en.favorites.items.length} favorites`
);

const stat = await fs.stat(snapshotPath);

console.log(
  `[sanity snapshot] Written to ${snapshotPath} (${Math.round(
    stat.size / 1024
  )} KB)`
);
