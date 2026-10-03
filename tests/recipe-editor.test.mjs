import assert from 'node:assert/strict';
import test from 'node:test';
import { validateRecipeStructure } from '../studio/recipePublishing.ts';

const reference = (id) => ({ _type: 'reference', _ref: id });
const body = (text) => [
  { _type: 'block', children: [{ _type: 'span', text }] },
];

test('new recipes can publish with linked categories and steps, without duplicate legacy fields', () => {
  assert.equal(
    validateRecipeStructure({
      categories: [reference('category-main')],
      steps: [reference('step-one')],
    }),
    true
  );
});

test('legacy recipes retain their localized text category and instructions workflow', () => {
  for (const locale of ['en', 'de']) {
    assert.equal(
      validateRecipeStructure({
        category: { [locale]: 'Main dishes' },
        instructions: { [locale]: body('Simmer for ten minutes.') },
      }),
      true
    );
  }
});

test('mixed reference and legacy recipes are supported', () => {
  assert.equal(
    validateRecipeStructure({
      categories: [reference('category-main')],
      instructions: { en: body('Serve warm.') },
    }),
    true
  );
  assert.equal(
    validateRecipeStructure({
      category: { de: 'Hauptgerichte' },
      steps: [reference('step-one')],
    }),
    true
  );
});

test('missing category gives the editor an actionable message', () => {
  assert.match(
    validateRecipeStructure({ steps: [reference('step-one')] }),
    /기본 정보 탭에서 분류/
  );
});

test('missing cooking instructions gives the editor an actionable message', () => {
  assert.match(
    validateRecipeStructure({ categories: [reference('category-main')] }),
    /조리 단계 탭에서 단계/
  );
});

test('empty placeholder references and rich text do not count as completed content', () => {
  const result = validateRecipeStructure({
    categories: [{ _type: 'reference', _ref: ' ' }],
    category: { en: ' ', de: '' },
    steps: [{}],
    instructions: { en: body('  '), de: [{ _type: 'block', children: [] }] },
  });
  assert.match(result, /분류/);
  assert.match(result, /조리 단계/);
});

test('uninitialized documents do not crash validation', () => {
  assert.equal(validateRecipeStructure(undefined), true);
  assert.equal(validateRecipeStructure(null), true);
});
