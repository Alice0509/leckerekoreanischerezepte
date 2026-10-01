import fs from 'node:fs/promises';
import crypto from 'node:crypto';
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

    if (items.length >= response.total || response.items.length === 0) {
      return items;
    }

    skip += response.items.length;
  }
}

console.log('[export] Reading locales...');
const localesResponse = await client.getLocales();

console.log('[export] Reading content types...');
const contentTypes = await fetchAll(({ limit, skip }) =>
  client.getContentTypes({ limit, skip })
);

console.log('[export] Reading published entries with all locales...');
const entries = await fetchAll(({ limit, skip }) =>
  allLocalesClient.getEntries({
    limit,
    skip,
    include: 0,
  })
);

console.log('[export] Reading published asset metadata with all locales...');
const assets = await fetchAll(({ limit, skip }) =>
  allLocalesClient.getAssets({
    limit,
    skip,
  })
);

const snapshot = {
  exportedAt: new Date().toISOString(),
  source: {
    cms: 'Contentful',
    spaceId: space,
    scope: 'published Delivery API data',
  },
  counts: {
    locales: localesResponse.items.length,
    contentTypes: contentTypes.length,
    entries: entries.length,
    assets: assets.length,
  },
  locales: localesResponse.items,
  contentTypes,
  entries,
  assets,
};

const json = `${JSON.stringify(snapshot, null, 2)}\n`;

await fs.mkdir('migration-data', { recursive: true });

const snapshotPath = 'migration-data/contentful-published-snapshot.json';
const hashPath = `${snapshotPath}.sha256`;

await fs.writeFile(snapshotPath, json, 'utf8');

const hash = crypto.createHash('sha256').update(json).digest('hex');
await fs.writeFile(
  hashPath,
  `${hash}  contentful-published-snapshot.json\n`,
  'utf8'
);

console.log('');
console.log('=== CONTENTFUL SOURCE SNAPSHOT ===');
console.log(`Locales: ${snapshot.counts.locales}`);
console.log(`Content types: ${snapshot.counts.contentTypes}`);
console.log(`Entries: ${snapshot.counts.entries}`);
console.log(`Assets: ${snapshot.counts.assets}`);
console.log(`Snapshot: ${snapshotPath}`);
console.log(`SHA-256: ${hash}`);
