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

const PRIMARY_COOKED_RICE_ID = '565tNcixoYvuQrW8JAku01';

const DUPLICATE_COOKED_RICE_ID = '2ydA0j8PoVJFlKmCaXWYTQ';

const MIGRATIONS = [
  {
    id: 'cjt4N0pZJ12wUS55QvobE',
    label: 'Tofu',
    acceptedSlugs: [' Tofu', 'Tofu', 'tofu'],
    fields: {
      slug: {
        de: 'tofu',
        en: 'tofu',
      },
      name: {
        de: 'Tofu',
        en: 'Tofu',
      },
    },
  },
  {
    id: PRIMARY_COOKED_RICE_ID,
    label: 'Cooked rice',
    acceptedSlugs: ['Cooked-rice', 'cooked-rice'],
    fields: {
      slug: {
        de: 'cooked-rice',
        en: 'cooked-rice',
      },
      name: {
        de: 'Gekochter Reis (밥)',
        en: 'Cooked rice (밥)',
      },
    },
  },
  {
    id: '31qLwPpZYSKIi7ZpC41EZp',
    label: 'Gochujang',
    acceptedSlugs: ['Gochujang', 'gochujang'],
    fields: {
      slug: {
        de: 'gochujang',
        en: 'gochujang',
      },
      name: {
        de: 'Gochujang (koreanische Chilipaste)',
        en: 'Gochujang (Korean chili paste)',
      },
    },
  },
  {
    id: '4VCUgo7h3dh3Smy7rDGx1n',
    label: 'Ottogi Sesame Oil',
    acceptedSlugs: ['OttogiSesameOil', 'ottogi-sesame-oil'],
    fields: {
      slug: {
        de: 'ottogi-sesame-oil',
        en: 'ottogi-sesame-oil',
      },
      name: {
        de: 'Ottogi Sesamöl (참기름)',
        en: 'Ottogi Sesame Oil (참기름)',
      },
    },
  },
  {
    id: 'shlldn8xv5DD87UVszZAG',
    label: 'La Monegasque Sesame Oil',
    acceptedSlugs: [
      'LaMonegasqueSesamöl ',
      'LaMonegasqueSesamöl',
      'la-monegasque-sesame-oil',
    ],
    fields: {
      slug: {
        de: 'la-monegasque-sesame-oil',
        en: 'la-monegasque-sesame-oil',
      },
      name: {
        de: 'La Monegasque Sesamöl (참기름)',
        en: 'La Monegasque Sesame Oil (참기름)',
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

const hasCleanPublishedState = (entry) =>
  getStatus(entry) === 'published-current';

const getContentTypeId = (entry) => entry.sys.contentType?.sys?.id || '';

const countEntryLinks = (value, targetId) => {
  if (!value) return 0;

  if (Array.isArray(value)) {
    return value.reduce(
      (total, item) => total + countEntryLinks(item, targetId),
      0
    );
  }

  if (typeof value !== 'object') {
    return 0;
  }

  let count = 0;

  if (
    value.sys?.type === 'Link' &&
    value.sys?.linkType === 'Entry' &&
    value.sys?.id === targetId
  ) {
    count += 1;
  }

  for (const nestedValue of Object.values(value)) {
    count += countEntryLinks(nestedValue, targetId);
  }

  return count;
};

const replaceEntryLinks = (value, oldId, newId) => {
  if (!value) {
    return {
      value,
      replacements: 0,
    };
  }

  if (Array.isArray(value)) {
    let replacements = 0;

    const nextValue = value.map((item) => {
      const result = replaceEntryLinks(item, oldId, newId);

      replacements += result.replacements;
      return result.value;
    });

    return {
      value: nextValue,
      replacements,
    };
  }

  if (typeof value !== 'object') {
    return {
      value,
      replacements: 0,
    };
  }

  if (
    value.sys?.type === 'Link' &&
    value.sys?.linkType === 'Entry' &&
    value.sys?.id === oldId
  ) {
    return {
      value: {
        ...value,
        sys: {
          ...value.sys,
          id: newId,
        },
      },
      replacements: 1,
    };
  }

  let replacements = 0;
  const nextValue = {};

  for (const [key, nestedValue] of Object.entries(value)) {
    const result = replaceEntryLinks(nestedValue, oldId, newId);

    nextValue[key] = result.value;
    replacements += result.replacements;
  }

  return {
    value: nextValue,
    replacements,
  };
};

const getAllEntries = async (query = {}) => {
  const items = [];
  const limit = 500;
  let skip = 0;

  while (true) {
    const response = await client.entry.getMany({
      query: {
        ...query,
        limit,
        skip,
      },
    });

    items.push(...response.items);

    if (response.items.length < limit || items.length >= response.total) {
      break;
    }

    skip += response.items.length;
  }

  return items;
};

const findIncomingReferences = async (entryId) => {
  try {
    return await getAllEntries({
      links_to_entry: entryId,
    });
  } catch (error) {
    console.warn(
      'links_to_entry query failed; scanning all entries instead:',
      error.message
    );

    const allEntries = await getAllEntries();

    return allEntries.filter(
      (entry) => countEntryLinks(entry.fields, entryId) > 0
    );
  }
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

const isMigrationChanged = (entry, migration) => {
  const nextFields = mergeLocalizedFields(entry, migration);

  return JSON.stringify(entry.fields) !== JSON.stringify(nextFields);
};

const assertAcceptedSlug = (entry, migration) => {
  const localizedSlugs = entry.fields.slug || {};

  for (const locale of ['de', 'en']) {
    const current = localizedSlugs[locale];

    if (!migration.acceptedSlugs.includes(current)) {
      throw new Error(
        `${migration.label} has an unexpected ${locale} slug: ${JSON.stringify(
          current
        )}`
      );
    }
  }
};

const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

const migrationEntries = [];

for (const migration of MIGRATIONS) {
  const entry = await client.entry.get({
    entryId: migration.id,
  });

  assertAcceptedSlug(entry, migration);

  migrationEntries.push({
    migration,
    entry,
    changed: isMigrationChanged(entry, migration),
  });
}

const duplicateEntry = await client.entry.get({
  entryId: DUPLICATE_COOKED_RICE_ID,
});

const incomingReferences = await findIncomingReferences(
  DUPLICATE_COOKED_RICE_ID
);

const referencePlans = incomingReferences
  .map((entry) => {
    const result = replaceEntryLinks(
      entry.fields,
      DUPLICATE_COOKED_RICE_ID,
      PRIMARY_COOKED_RICE_ID
    );

    return {
      entry,
      nextFields: result.value,
      replacements: result.replacements,
    };
  })
  .filter((plan) => plan.replacements > 0);

const backup = {
  generatedAt: new Date().toISOString(),
  applyRequested: APPLY,
  spaceId,
  environmentId,
  migrationEntries: migrationEntries.map(({ migration, entry, changed }) => ({
    migration,
    changed,
    entry,
  })),
  duplicateEntry,
  referenceEntries: referencePlans.map(({ entry, replacements }) => ({
    replacements,
    entry,
  })),
};

const backupPath = path.join(
  '/tmp',
  `hansik-priority-ingredient-migration-${timestamp}.json`
);

fs.writeFileSync(backupPath, JSON.stringify(backup, null, 2));

console.log('\n===== MODE =====');
console.log(APPLY ? 'APPLY' : 'DRY RUN');

console.log('\n===== INGREDIENT UPDATES =====');

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

console.log('\n===== COOKED RICE DUPLICATE =====');
console.table([
  {
    id: duplicateEntry.sys.id,
    status: getStatus(duplicateEntry),
    deName: duplicateEntry.fields.name?.de || '',
    enName: duplicateEntry.fields.name?.en || '',
    deSlug: duplicateEntry.fields.slug?.de || '',
    enSlug: duplicateEntry.fields.slug?.en || '',
  },
]);

console.log('\n===== INCOMING REFERENCES =====');

if (referencePlans.length === 0) {
  console.log('No incoming references found.');
} else {
  console.table(
    referencePlans.map(({ entry, replacements }) => ({
      id: entry.sys.id,
      contentType: getContentTypeId(entry),
      status: getStatus(entry),
      replacements,
    }))
  );
}

console.log(`\nBackup: ${backupPath}`);

if (!APPLY) {
  console.log('\nDry run complete. No Contentful entries were changed.');
  process.exit(0);
}

const unsafeEntries = [
  ...migrationEntries
    .filter(({ changed }) => changed)
    .map(({ entry }) => entry),
  ...referencePlans.map(({ entry }) => entry),
  duplicateEntry,
].filter((entry) => !hasCleanPublishedState(entry));

if (unsafeEntries.length > 0) {
  console.error(
    '\nApply aborted because some entries are not clean, currently published entries:'
  );

  console.table(
    unsafeEntries.map((entry) => ({
      id: entry.sys.id,
      contentType: getContentTypeId(entry),
      status: getStatus(entry),
      version: entry.sys.version,
      publishedVersion: entry.sys.publishedVersion || '',
    }))
  );

  process.exit(1);
}

console.log('\n===== APPLYING INGREDIENT UPDATES =====');

for (const { migration, entry, changed } of migrationEntries) {
  if (!changed) {
    console.log(`Skipped ${migration.label}: already migrated`);
    continue;
  }

  const nextEntry = {
    ...entry,
    fields: mergeLocalizedFields(entry, migration),
  };

  const updatedEntry = await client.entry.update(
    {
      entryId: migration.id,
    },
    nextEntry
  );

  await client.entry.publish(
    {
      entryId: migration.id,
    },
    updatedEntry
  );

  console.log(`Updated and published: ${migration.label}`);
}

console.log('\n===== REPLACING DUPLICATE REFERENCES =====');

for (const plan of referencePlans) {
  const nextEntry = {
    ...plan.entry,
    fields: plan.nextFields,
  };

  const updatedEntry = await client.entry.update(
    {
      entryId: plan.entry.sys.id,
    },
    nextEntry
  );

  await client.entry.publish(
    {
      entryId: plan.entry.sys.id,
    },
    updatedEntry
  );

  console.log(
    `Updated ${plan.entry.sys.id}: ${plan.replacements} reference(s)`
  );
}

const remainingReferences = await findIncomingReferences(
  DUPLICATE_COOKED_RICE_ID
);

const remainingReferenceCount = remainingReferences.reduce(
  (total, entry) =>
    total + countEntryLinks(entry.fields, DUPLICATE_COOKED_RICE_ID),
  0
);

if (remainingReferenceCount > 0) {
  throw new Error(
    `Duplicate cooked-rice entry still has ${remainingReferenceCount} incoming reference(s). It was not archived.`
  );
}

console.log('\n===== ARCHIVING DUPLICATE =====');

let latestDuplicate = await client.entry.get({
  entryId: DUPLICATE_COOKED_RICE_ID,
});

if (latestDuplicate.sys.publishedVersion) {
  latestDuplicate = await client.entry.unpublish(
    {
      entryId: DUPLICATE_COOKED_RICE_ID,
    },
    latestDuplicate
  );

  console.log('Duplicate entry unpublished.');
}

if (!latestDuplicate.sys.archivedVersion) {
  await client.entry.archive({
    entryId: DUPLICATE_COOKED_RICE_ID,
  });

  console.log('Duplicate entry archived.');
}

console.log('\nMigration successfully completed.');
console.log(`Backup: ${backupPath}`);
