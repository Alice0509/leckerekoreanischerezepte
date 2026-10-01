import fs from 'node:fs/promises';
import { createRequire } from 'node:module';
import { createClient } from 'contentful';

const require = createRequire(import.meta.url);
const { loadEnvConfig } = require('@next/env');

loadEnvConfig(process.cwd());

const space = process.env.CONTENTFUL_SPACE_ID;
const accessToken = process.env.CONTENTFUL_ACCESS_TOKEN;

if (!space || !accessToken) {
  throw new Error(
    'CONTENTFUL_SPACE_ID and CONTENTFUL_ACCESS_TOKEN are required.'
  );
}

const client = createClient({
  space,
  accessToken,
});

const allLocalesClient = client.withAllLocales;
const limit = 1000;

async function fetchAll(fetchPage) {
  const items = [];
  let skip = 0;

  while (true) {
    const response = await fetchPage({ limit, skip });
    items.push(...response.items);

    if (items.length >= response.total) {
      return items;
    }

    skip += response.items.length;

    if (response.items.length === 0) {
      return items;
    }
  }
}

function collectLinks(value, links = []) {
  if (!value) return links;

  if (Array.isArray(value)) {
    for (const item of value) {
      collectLinks(item, links);
    }
    return links;
  }

  if (typeof value !== 'object') {
    return links;
  }

  if (value.sys?.type === 'Link' && value.sys?.id) {
    links.push({
      id: value.sys.id,
      linkType: value.sys.linkType || null,
    });
    return links;
  }

  for (const nested of Object.values(value)) {
    collectLinks(nested, links);
  }

  return links;
}

console.log('[inventory] Reading Contentful locales...');

const localesResponse = await client.getLocales();
const locales = localesResponse.items.map((locale) => ({
  code: locale.code,
  name: locale.name,
  default: Boolean(locale.default),
  fallbackCode: locale.fallbackCode || null,
}));

console.log('[inventory] Reading content types...');

const contentTypes = await fetchAll(({ limit, skip }) =>
  client.getContentTypes({ limit, skip })
);

console.log('[inventory] Reading published entries with all locales...');

const entries = await fetchAll(({ limit, skip }) =>
  allLocalesClient.getEntries({
    limit,
    skip,
    include: 0,
  })
);

console.log('[inventory] Reading published assets with all locales...');

const assets = await fetchAll(({ limit, skip }) =>
  allLocalesClient.getAssets({
    limit,
    skip,
  })
);

const entryCounts = {};
const referenceCounts = {};
let totalReferences = 0;

for (const entry of entries) {
  const contentType =
    entry.sys?.contentType?.sys?.id || 'unknown-content-type';

  entryCounts[contentType] = (entryCounts[contentType] || 0) + 1;

  for (const [fieldId, fieldValue] of Object.entries(entry.fields || {})) {
    const links = collectLinks(fieldValue);

    if (links.length === 0) continue;

    const key = `${contentType}.${fieldId}`;

    if (!referenceCounts[key]) {
      referenceCounts[key] = {
        total: 0,
        entryLinks: 0,
        assetLinks: 0,
      };
    }

    for (const link of links) {
      referenceCounts[key].total += 1;
      totalReferences += 1;

      if (link.linkType === 'Entry') {
        referenceCounts[key].entryLinks += 1;
      }

      if (link.linkType === 'Asset') {
        referenceCounts[key].assetLinks += 1;
      }
    }
  }
}

const contentTypeInventory = contentTypes
  .map((contentType) => ({
    id: contentType.sys.id,
    name: contentType.name,
    publishedEntries: entryCounts[contentType.sys.id] || 0,
    fields: contentType.fields.map((field) => ({
      id: field.id,
      name: field.name,
      type: field.type,
      localized: Boolean(field.localized),
      required: Boolean(field.required),
      disabled: Boolean(field.disabled),
      omitted: Boolean(field.omitted),
      linkType: field.linkType || field.items?.linkType || null,
      arrayItemType: field.items?.type || null,
    })),
  }))
  .sort((a, b) => a.id.localeCompare(b.id));

const report = {
  generatedAt: new Date().toISOString(),
  source: {
    cms: 'Contentful',
    scope: 'published Delivery API data',
    spaceId: space,
  },
  summary: {
    locales: locales.length,
    contentTypes: contentTypes.length,
    publishedEntries: entries.length,
    publishedAssets: assets.length,
    referencesFound: totalReferences,
  },
  locales,
  entryCounts: Object.fromEntries(
    Object.entries(entryCounts).sort(([a], [b]) => a.localeCompare(b))
  ),
  contentTypes: contentTypeInventory,
  referenceCounts: Object.fromEntries(
    Object.entries(referenceCounts).sort(([a], [b]) => a.localeCompare(b))
  ),
};

const outputPath = '/tmp/hansik-contentful-migration-inventory.json';

await fs.writeFile(
  outputPath,
  `${JSON.stringify(report, null, 2)}\n`,
  'utf8'
);

console.log('');
console.log('=== CONTENTFUL MIGRATION INVENTORY ===');
console.log(`Locales: ${report.summary.locales}`);
console.log(`Content types: ${report.summary.contentTypes}`);
console.log(`Published entries: ${report.summary.publishedEntries}`);
console.log(`Published assets: ${report.summary.publishedAssets}`);
console.log(`References found: ${report.summary.referencesFound}`);

console.log('');
console.log('=== ENTRIES BY CONTENT TYPE ===');

for (const item of contentTypeInventory) {
  console.log(`${item.id}: ${item.publishedEntries}`);
}

console.log('');
console.log(`Report: ${outputPath}`);
