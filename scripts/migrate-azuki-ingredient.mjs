import fs from 'node:fs';
import dotenv from 'dotenv';
import { createClient } from 'contentful-management';

dotenv.config({ path: '.env.local' });

const APPLY = process.argv.includes('--apply');
const CONFIRMED = process.env.CONFIRM_CONTENTFUL_MIGRATION === 'YES';

const spaceId = process.env.CONTENTFUL_SPACE_ID;
const environmentId =
  process.env.CONTENTFUL_ENVIRONMENT_ID ||
  process.env.CONTENTFUL_ENVIRONMENT ||
  'master';
const accessToken = process.env.CONTENTFUL_MANAGEMENT_TOKEN;

const entryId = '3ybhkfB2FuBnXCwIQqYVOd';
const nextSlug = 'azuki-beans';
const acceptedSlugs = ['Azuki-Bohnen', 'azuki-beans'];

if (!spaceId || !accessToken) {
  throw new Error('Contentful credentials are missing');
}

if (APPLY && !CONFIRMED) {
  throw new Error('Apply requires CONFIRM_CONTENTFUL_MIGRATION=YES');
}

const client = createClient(
  {
    accessToken,
    throttle: 'auto',
  },
  {
    type: 'plain',
    defaults: {
      spaceId,
      environmentId,
    },
  }
);

const getStatus = (entry) => {
  if (entry.sys.archivedVersion) return 'archived';
  if (!entry.sys.publishedVersion) return 'draft';

  if (entry.sys.version > entry.sys.publishedVersion + 1) {
    return 'published-with-unpublished-changes';
  }

  return 'published-current';
};

const entry = await client.entry.get({ entryId });

for (const locale of ['de', 'en']) {
  const currentSlug = entry.fields.slug?.[locale];

  if (!acceptedSlugs.includes(currentSlug)) {
    throw new Error(`Unexpected ${locale} slug: ${currentSlug}`);
  }
}

const nextFields = structuredClone(entry.fields);

nextFields.slug = {
  ...(nextFields.slug || {}),
  de: nextSlug,
  en: nextSlug,
};

const changed = JSON.stringify(entry.fields) !== JSON.stringify(nextFields);

const backupPath = `/tmp/hansik-azuki-ingredient-${Date.now()}.json`;

fs.writeFileSync(
  backupPath,
  JSON.stringify(
    {
      generatedAt: new Date().toISOString(),
      applyRequested: APPLY,
      entry,
    },
    null,
    2
  )
);

console.table([
  {
    id: entry.sys.id,
    status: getStatus(entry),
    currentDeSlug: entry.fields.slug?.de,
    currentEnSlug: entry.fields.slug?.en,
    nextSlug,
    changed,
  },
]);

console.log(`Backup: ${backupPath}`);

if (!APPLY) {
  console.log('Dry run complete.');
  process.exit(0);
}

if (changed && getStatus(entry) !== 'published-current') {
  throw new Error(`Unsafe entry status: ${getStatus(entry)}`);
}

if (!changed) {
  console.log('Already migrated.');
  process.exit(0);
}

const updated = await client.entry.update(
  { entryId },
  {
    ...entry,
    fields: nextFields,
  }
);

await client.entry.publish({ entryId }, updated);

console.log('Updated and published: Azuki beans');
