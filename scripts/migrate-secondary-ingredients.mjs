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
    id: '73EkitIwlloJi833oN3p3U',
    label: 'Wheat flour Type 550',
    acceptedSlugs: {
      de: ['Typ 550', 'wheat-flour-type-550'],
      en: ['Typ 550', 'wheat-flour-type-550'],
    },
    fields: {
      slug: {
        de: 'wheat-flour-type-550',
        en: 'wheat-flour-type-550',
      },
    },
  },
  {
    id: '3UNJI2jJli2CZHpX2QdJIq',
    label: 'Chicken stock powder',
    acceptedSlugs: {
      de: ['Hühnerbrühepulver', 'chicken-stock-powder'],
      en: ['chicken-stock', 'chicken-stock-powder'],
    },
    fields: {
      slug: {
        de: 'chicken-stock-powder',
        en: 'chicken-stock-powder',
      },
    },
  },
  {
    id: '1IMDrOPalteTacrwdYQFmN',
    label: 'Beef chuck or stewing beef',
    acceptedSlugs: {
      de: ['hochrippe', 'beef-chuck-or-stewing-beef'],
      en: ['Beef (chuck or stewing beef)', 'beef-chuck-or-stewing-beef'],
    },
    fields: {
      slug: {
        de: 'beef-chuck-or-stewing-beef',
        en: 'beef-chuck-or-stewing-beef',
      },
    },
  },
  {
    id: '6a03K2Ebi1XFzmqr0sTUFB',
    label: 'Chicken pieces',
    acceptedSlugs: {
      de: ['Hähnchenstücke', 'chicken-pieces'],
      en: ['Chicken pieces', 'chicken-pieces'],
    },
    fields: {
      slug: {
        de: 'chicken-pieces',
        en: 'chicken-pieces',
      },
    },
  },
  {
    id: '2R17EI2xSLr8sDzleHSwP',
    label: 'Mixed ground beef and pork',
    acceptedSlugs: {
      de: [
        'gemischtes Hackfleisch, Rind und Schwein',
        'mixed-ground-beef-and-pork',
      ],
      en: ['mixed ground beef and pork', 'mixed-ground-beef-and-pork'],
    },
    fields: {
      slug: {
        de: 'mixed-ground-beef-and-pork',
        en: 'mixed-ground-beef-and-pork',
      },
      name: {
        en: 'Mixed ground beef and pork',
      },
    },
  },
  {
    id: '1qiOTp7Fy60GMeRryfTzwa',
    label: 'Shiitake or button mushrooms',
    acceptedSlugs: {
      de: ['shiitake-oder-champignon-pilze', 'shiitake-or-button-mushrooms'],
      en: ['Shiitake- oder Champignon-Pilze', 'shiitake-or-button-mushrooms'],
    },
    fields: {
      slug: {
        de: 'shiitake-or-button-mushrooms',
        en: 'shiitake-or-button-mushrooms',
      },
    },
  },
  {
    id: '7KVhksdKg8Y87fI6HlGIkq',
    label: 'Enoki mushrooms',
    acceptedSlugs: {
      de: ['enoki-pilze', 'enoki-mushrooms'],
      en: ['enoki-pilze', 'enoki-mushrooms'],
    },
    fields: {
      slug: {
        de: 'enoki-mushrooms',
        en: 'enoki-mushrooms',
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
  `hansik-secondary-ingredient-migration-${timestamp}.json`
);

fs.writeFileSync(backupPath, JSON.stringify(backup, null, 2));

console.log('\n===== MODE =====');
console.log(APPLY ? 'APPLY' : 'DRY RUN');

console.log('\n===== SECONDARY INGREDIENT UPDATES =====');

console.table(
  migrationEntries.map(({ migration, entry, changed }) => ({
    id: migration.id,
    ingredient: migration.label,
    status: getStatus(entry),
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

console.log('\nSecondary ingredient migration completed.');
console.log(`Backup: ${backupPath}`);
