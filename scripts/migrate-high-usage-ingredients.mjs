import fs from 'node:fs';
import path from 'node:path';
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

if (!spaceId) {
  throw new Error('CONTENTFUL_SPACE_ID is missing');
}

if (!accessToken) {
  throw new Error('CONTENTFUL_MANAGEMENT_TOKEN is missing');
}

if (APPLY && !CONFIRMED) {
  throw new Error('Apply mode requires CONFIRM_CONTENTFUL_MIGRATION=YES');
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

const MIGRATIONS = [
  {
    id: '3pxIpo3j2wLFFl5lzgsdFm',
    label: 'Daepa',
    acceptedSlugs: {
      de: ['Daepa', 'daepa'],
      en: ['Daepa', 'daepa'],
    },
    fields: {
      slug: {
        de: 'daepa',
        en: 'daepa',
      },
    },
  },
  {
    id: '6g42vVsU6ryPS65cHmIkTl',
    label: 'Minced garlic',
    acceptedSlugs: {
      de: ['MincedGarlic', 'minced-garlic'],
      en: ['MincedGarlic', 'minced-garlic'],
    },
    fields: {
      slug: {
        de: 'minced-garlic',
        en: 'minced-garlic',
      },
    },
  },
  {
    id: '6T98N3gW2KqiAuFtiQInG5',
    label: 'Egg',
    acceptedSlugs: {
      de: ['Egg', 'egg'],
      en: ['Egg', 'egg'],
    },
    fields: {
      slug: {
        de: 'egg',
        en: 'egg',
      },
      name: {
        de: 'Ei',
        en: 'Egg',
      },
    },
  },
  {
    id: '6MvnL7q2uoQv5tGRbFiD5Q',
    label: 'Corn syrup',
    acceptedSlugs: {
      de: ['Corn-syrup', 'corn-syrup'],
      en: ['Corn-syrup', 'corn-syrup'],
    },
    fields: {
      slug: {
        de: 'corn-syrup',
        en: 'corn-syrup',
      },
    },
  },
];

const clone = (value) => JSON.parse(JSON.stringify(value));

const getStatus = (entry) => {
  if (entry.sys.archivedVersion) {
    return 'archived';
  }

  if (!entry.sys.publishedVersion) {
    return 'draft';
  }

  if (entry.sys.version > entry.sys.publishedVersion + 1) {
    return 'published-with-unpublished-changes';
  }

  return 'published-current';
};

const mergeLocalizedFields = (entry, migration) => {
  const fields = clone(entry.fields);

  for (const [fieldId, localizedValues] of Object.entries(migration.fields)) {
    fields[fieldId] = {
      ...(fields[fieldId] || {}),
      ...localizedValues,
    };
  }

  return fields;
};

const isMigrationChanged = (entry, migration) =>
  JSON.stringify(entry.fields) !==
  JSON.stringify(mergeLocalizedFields(entry, migration));

const assertAcceptedSlugs = (entry, migration) => {
  for (const locale of ['de', 'en']) {
    const current = entry.fields.slug?.[locale];

    if (!migration.acceptedSlugs[locale].includes(current)) {
      throw new Error(
        `${migration.label} has an unexpected ${locale} slug: ${JSON.stringify(
          current
        )}`
      );
    }
  }
};

const migrationEntries = [];

for (const migration of MIGRATIONS) {
  const entry = await client.entry.get({
    entryId: migration.id,
  });

  assertAcceptedSlugs(entry, migration);

  migrationEntries.push({
    migration,
    entry,
    changed: isMigrationChanged(entry, migration),
  });
}

const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

const backup = {
  generatedAt: new Date().toISOString(),
  applyRequested: APPLY,
  spaceId,
  environmentId,
  entries: migrationEntries.map(({ migration, entry, changed }) => ({
    migration,
    changed,
    entry,
  })),
};

const backupPath = path.join(
  '/tmp',
  `hansik-high-usage-ingredient-migration-${timestamp}.json`
);

fs.writeFileSync(backupPath, JSON.stringify(backup, null, 2));

console.log('\n===== MODE =====');
console.log(APPLY ? 'APPLY' : 'DRY RUN');

console.log('\n===== HIGH-USAGE INGREDIENT UPDATES =====');

console.table(
  migrationEntries.map(({ migration, entry, changed }) => ({
    id: migration.id,
    ingredient: migration.label,
    status: getStatus(entry),
    currentDeName: entry.fields.name?.de || '',
    currentEnName: entry.fields.name?.en || '',
    currentDeSlug: entry.fields.slug?.de || '',
    currentEnSlug: entry.fields.slug?.en || '',
    nextSlug: migration.fields.slug.en,
    changed,
  }))
);

console.log(`\nBackup: ${backupPath}`);

if (!APPLY) {
  console.log('\nDry run complete. No Contentful entries were changed.');

  process.exit(0);
}

const unsafeEntries = migrationEntries
  .filter(({ changed }) => changed)
  .map(({ entry }) => entry)
  .filter((entry) => getStatus(entry) !== 'published-current');

if (unsafeEntries.length > 0) {
  console.error(
    '\nApply aborted because some entries are not clean, currently published entries:'
  );

  console.table(
    unsafeEntries.map((entry) => ({
      id: entry.sys.id,
      status: getStatus(entry),
      version: entry.sys.version,
      publishedVersion: entry.sys.publishedVersion || '',
    }))
  );

  process.exit(1);
}

console.log('\n===== APPLYING UPDATES =====');

for (const { migration, entry, changed } of migrationEntries) {
  if (!changed) {
    console.log(`Skipped ${migration.label}: already migrated`);

    continue;
  }

  const updatedEntry = await client.entry.update(
    {
      entryId: migration.id,
    },
    {
      ...entry,
      fields: mergeLocalizedFields(entry, migration),
    }
  );

  await client.entry.publish(
    {
      entryId: migration.id,
    },
    updatedEntry
  );

  console.log(`Updated and published: ${migration.label}`);
}

console.log('\nHigh-usage ingredient migration completed.');
console.log(`Backup: ${backupPath}`);
