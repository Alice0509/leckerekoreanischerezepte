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

const nodeTypeCounts = new Map();
const markCounts = new Map();
const fieldCounts = new Map();
const linkedTargets = new Map();

function increment(map, key, amount = 1) {
  map.set(key, (map.get(key) || 0) + amount);
}

function visitNode(node) {
  if (!node || typeof node !== 'object') return;

  if (typeof node.nodeType === 'string') {
    increment(nodeTypeCounts, node.nodeType);
  }

  if (Array.isArray(node.marks)) {
    for (const mark of node.marks) {
      if (mark?.type) increment(markCounts, mark.type);
    }
  }

  const target = node.data?.target?.sys;
  if (target?.id) {
    const type = target.linkType || target.type || 'unknown';
    increment(linkedTargets, `${type}:${target.id}`);
  }

  if (Array.isArray(node.content)) {
    for (const child of node.content) {
      visitNode(child);
    }
  }
}

console.log('[richtext] Reading published Contentful entries...');

const entries = await fetchAll(({ limit, skip }) =>
  allLocalesClient.getEntries({
    limit,
    skip,
    include: 0,
  })
);

let richTextDocuments = 0;

for (const entry of entries) {
  const contentType =
    entry.sys?.contentType?.sys?.id || 'unknown-content-type';

  for (const [fieldId, localizedValue] of Object.entries(entry.fields || {})) {
    if (!localizedValue || typeof localizedValue !== 'object') continue;

    for (const [locale, value] of Object.entries(localizedValue)) {
      if (value?.nodeType !== 'document') continue;

      richTextDocuments += 1;
      increment(fieldCounts, `${contentType}.${fieldId} [${locale}]`);
      visitNode(value);
    }
  }
}

const sortedEntries = (map) =>
  [...map.entries()].sort((a, b) => a[0].localeCompare(b[0]));

console.log('');
console.log('=== RICH TEXT DOCUMENTS ===');
console.log(richTextDocuments);

console.log('');
console.log('=== FIELDS ===');
for (const [key, count] of sortedEntries(fieldCounts)) {
  console.log(`${key}: ${count}`);
}

console.log('');
console.log('=== NODE TYPES ===');
for (const [key, count] of sortedEntries(nodeTypeCounts)) {
  console.log(`${key}: ${count}`);
}

console.log('');
console.log('=== MARKS ===');
if (markCounts.size === 0) {
  console.log('none');
} else {
  for (const [key, count] of sortedEntries(markCounts)) {
    console.log(`${key}: ${count}`);
  }
}

console.log('');
console.log('=== LINKED TARGETS INSIDE RICH TEXT ===');
console.log(linkedTargets.size);

for (const [key, count] of sortedEntries(linkedTargets)) {
  console.log(`${key}: ${count}`);
}
