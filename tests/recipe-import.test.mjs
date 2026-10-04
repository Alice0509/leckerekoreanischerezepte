import assert from 'node:assert/strict';
import test from 'node:test';
import {
  createDraftDocuments,
  importMutations,
  parseRecipeInput,
  preparePublication,
} from '../studio/recipeImport.ts';

const pair = (en, de = en) => ({ en, de });
const input = () => ({
  format: 'hansik-recipe-v1',
  key: 'test-recipe',
  title: pair('Test recipe', 'Testrezept'),
  description: pair('A test description.', 'Eine Testbeschreibung.'),
  slug: pair('test-recipe', 'testrezept'),
  preparationMinutes: 20,
  servings: 2,
  categoryIds: ['category-side'],
  ingredients: [
    { ingredientId: 'ingredient-spinach', quantity: pair('200 g') },
  ],
  steps: [
    {
      description: pair('Cook the spinach.', 'Den Spinat garen.'),
      timerSeconds: 30,
    },
  ],
});
const catalog = () => ({
  ingredients: [
    {
      _id: 'ingredient-spinach',
      _type: 'ingredient',
      name: pair('Spinach', 'Spinat'),
    },
  ],
  categories: [
    {
      _id: 'category-side',
      _type: 'category',
      name: pair('Side dishes', 'Beilagen'),
    },
  ],
  recipes: [],
  assets: [{ _id: 'image-test-10x10-png', _type: 'sanity.imageAsset' }],
});
function ready() {
  const docs = createDraftDocuments(
    parseRecipeInput(JSON.stringify(input())),
    catalog()
  );
  docs.forEach((doc) => {
    doc._rev = 'reviewed-revision';
  });
  docs.at(-1).image = [
    {
      _type: 'image',
      _key: 'photo',
      asset: { _type: 'reference', _ref: 'image-test-10x10-png' },
    },
  ];
  return docs;
}

// A transactional model checks the guard behavior without writing to a CMS.
function applyAtomic(state, mutations) {
  const working = new Map(
    [...state].map(([id, doc]) => [id, structuredClone(doc)])
  );
  for (const mutation of mutations) {
    if (mutation.create) {
      const doc = mutation.create;
      if (working.has(doc._id)) throw new Error('create conflict');
      working.set(doc._id, {
        ...structuredClone(doc),
        _rev: 'created-revision',
      });
    } else if (mutation.patch) {
      const patch = mutation.patch;
      const doc = working.get(patch.id);
      if (!doc || doc._rev !== patch.ifRevisionID)
        throw new Error('revision conflict');
      Object.assign(doc, patch.set);
    } else {
      working.delete(mutation.delete.id);
    }
  }
  return working;
}

test('one import creates only linked drafts and reuses the published dictionary', () => {
  const data = catalog();
  const before = structuredClone(data);
  const docs = createDraftDocuments(
    parseRecipeInput(JSON.stringify(input())),
    data
  );
  assert.equal(docs.length, 3);
  assert.ok(docs.every((doc) => doc._id.startsWith('drafts.chat-recipe-')));
  assert.equal(docs[0].ingredient._ref, 'ingredient-spinach');
  assert.equal(docs[1].description.de[0].children[0].text, 'Den Spinat garen.');
  assert.equal(docs[2].ingredients[0]._weak, true);
  assert.equal(
    docs[2].ingredients[0]._strengthenOnPublish.type,
    'recipeIngredient'
  );
  assert.ok(docs.every((doc) => !('legacyContentfulId' in doc)));
  assert.deepEqual(data, before);
});

test('invalid input does not create documents: missing translations, invalid time, injected fields, excessive size', () => {
  for (const modify of [
    (value) => {
      value.title.de = '';
    },
    (value) => {
      value.preparationMinutes = '20';
    },
    (value) => {
      value.steps[0].timerSeconds = -1;
    },
    (value) => {
      value._id = 'existing-document';
    },
    (value) => {
      value.ingredients[0]._type = 'recipe';
    },
    (value) => {
      value.categoryIds = ['drafts.category-side'];
    },
    (value) => {
      value.slug.en = '../old-page';
    },
  ]) {
    const value = input();
    modify(value);
    assert.throws(() => parseRecipeInput(JSON.stringify(value)));
  }
  assert.throws(() => parseRecipeInput('x'.repeat(100001)), /너무 큽니다/);
  assert.throws(() => parseRecipeInput('```json\n{}\n```'), /JSON/);
});

test('unknown ingredients and categories must be resolved against a fresh published catalog', () => {
  const value = parseRecipeInput(JSON.stringify(input()));
  assert.throws(
    () => createDraftDocuments(value, { ...catalog(), ingredients: [] }),
    /식재료/
  );
  assert.throws(
    () => createDraftDocuments(value, { ...catalog(), categories: [] }),
    /분류/
  );
});

test('URLs collide with either published recipes or other drafts in their locale', () => {
  const value = parseRecipeInput(JSON.stringify(input()));
  for (const _id of ['existing-recipe', 'drafts.existing-recipe']) {
    for (const slug of [
      { en: value.slug.en, de: 'different' },
      { en: 'different', de: value.slug.de },
    ]) {
      assert.throws(
        () =>
          createDraftDocuments(value, {
            ...catalog(),
            recipes: [{ _id, _type: 'recipe', slug }],
          }),
        /이미 사용 중/
      );
    }
  }
});

test('repeat imports cannot replace any existing published document or draft', () => {
  const docs = ready();
  for (const doc of docs) {
    for (const _id of [doc._id, doc._id.slice(7)]) {
      assert.throws(
        () => importMutations(docs, [{ _id, _type: doc._type }]),
        /이미 가져온/
      );
    }
  }
  const mutations = importMutations(docs, []);
  assert.ok(
    mutations.every((item) => 'create' in item && !('createOrReplace' in item))
  );
});

test('publication requires a real image, both languages, complete amounts and distinct step numbers', () => {
  for (const modify of [
    (docs) => {
      delete docs.at(-1).image;
    },
    (docs) => {
      docs.at(-1).image[0].asset._ref = 'missing-image';
    },
    (docs) => {
      docs.at(-1).titel.de = '';
    },
    (docs) => {
      docs[0].quantity.de = '';
    },
    (docs) => {
      docs[1].description.de[0].children[0].text = ' ';
    },
    (docs) => {
      docs.at(-1).servings.de = 3;
    },
    (docs) => {
      docs.at(-1).steps.push({ ...docs.at(-1).steps[0], _key: 'second' });
    },
  ]) {
    const docs = ready();
    modify(docs);
    assert.throws(() =>
      preparePublication('chat-recipe-test-recipe', docs, catalog())
    );
  }
});

test('bulk publication is confined to this imported recipe and its own connected documents', () => {
  assert.throws(
    () => preparePublication('legacy-recipe', ready(), catalog()),
    /이 메뉴/
  );
  const docs = ready();
  docs.at(-1).steps[0]._ref = 'chat-recipe-other-step-1';
  assert.throws(
    () => preparePublication('chat-recipe-test-recipe', docs, catalog()),
    /다른 레시피/
  );
  const missing = ready().filter((doc) => doc._type !== 'step');
  assert.throws(
    () => preparePublication('chat-recipe-test-recipe', missing, catalog()),
    /연결된 초안/
  );
});

test('publication strips draft-only weak metadata, guards every revision and leaves recipe creation last', () => {
  const publication = preparePublication(
    'chat-recipe-test-recipe',
    ready(),
    catalog()
  );
  const created = publication.mutations
    .filter((item) => item.create)
    .map((item) => item.create);
  assert.deepEqual(
    created.map((doc) => doc._type),
    ['recipeIngredient', 'step', 'recipe']
  );
  assert.ok(
    created.every((doc) => !doc._id.startsWith('drafts.') && !doc._rev)
  );
  assert.ok(
    created
      .at(-1)
      .ingredients.every((ref) => !ref._weak && !ref._strengthenOnPublish)
  );
  assert.equal(
    publication.mutations.filter(
      (item) => item.patch?.ifRevisionID === 'reviewed-revision'
    ).length,
    3
  );
});

test('editing after review aborts the whole publication without any partial writes', () => {
  const docs = ready();
  const publication = preparePublication(
    'chat-recipe-test-recipe',
    docs,
    catalog()
  );
  const state = new Map(docs.map((doc) => [doc._id, structuredClone(doc)]));
  const changed = state.get(docs[1]._id);
  changed._rev = 'newer-revision';
  changed.stepNumber = 2;
  const before = structuredClone(state);
  assert.throws(
    () => applyAtomic(state, publication.mutations),
    /revision conflict/
  );
  assert.deepEqual(state, before);
});

test('another client publishing first aborts instead of overwriting the published recipe', () => {
  const docs = ready();
  const publication = preparePublication(
    'chat-recipe-test-recipe',
    docs,
    catalog()
  );
  const state = new Map(docs.map((doc) => [doc._id, structuredClone(doc)]));
  state.set('chat-recipe-test-recipe', {
    _id: 'chat-recipe-test-recipe',
    _type: 'recipe',
    titel: pair('Other version'),
  });
  const before = structuredClone(state);
  assert.throws(
    () => applyAtomic(state, publication.mutations),
    /create conflict/
  );
  assert.deepEqual(state, before);
});

test('successful publication removes all linked drafts and preserves existing dictionary documents', () => {
  const docs = ready();
  const data = catalog();
  const existing = [...data.ingredients, ...data.categories, ...data.assets];
  const state = new Map(
    [...existing, ...docs].map((doc) => [doc._id, structuredClone(doc)])
  );
  const after = applyAtomic(
    state,
    preparePublication('chat-recipe-test-recipe', docs, data).mutations
  );
  assert.ok(
    docs.every((doc) => !after.has(doc._id) && after.has(doc._id.slice(7)))
  );
  existing.forEach((doc) => assert.deepEqual(after.get(doc._id), doc));
});

test('a child already published through Studio is reused, but an edited published child is not overwritten', () => {
  const docs = ready();
  docs[0]._id = docs[0]._id.slice(7);
  const publication = preparePublication(
    'chat-recipe-test-recipe',
    docs,
    catalog()
  );
  assert.equal(publication.mutations.filter((item) => item.create).length, 2);
  docs.push({ ...docs[0], _id: `drafts.${docs[0]._id}`, _rev: 'edited' });
  assert.throws(
    () => preparePublication('chat-recipe-test-recipe', docs, catalog()),
    /새 수정/
  );
});

test('first publication records the publish time, never the draft creation time or an injected date', () => {
  const docs = ready();
  const recipe = docs.at(-1);
  recipe._createdAt = '2026-08-01T00:00:00Z';
  recipe.firstPublishedAt = '2026-01-01T00:00:00Z';
  const publishedAt = '2026-10-04T12:00:00Z';
  const publication = preparePublication(
    'chat-recipe-test-recipe',
    docs,
    catalog(),
    publishedAt
  );
  const published = publication.mutations.find(
    (item) => item.create?._type === 'recipe'
  ).create;
  assert.equal(published.firstPublishedAt, publishedAt);
  assert.equal(published._createdAt, undefined);
  assert.equal(recipe.firstPublishedAt, '2026-01-01T00:00:00Z');
  assert.ok(
    publication.mutations
      .filter((item) => item.create?._type !== 'recipe' && item.create)
      .every((item) => item.create.firstPublishedAt === undefined)
  );
});
