const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const readerGuide = require('../lib/recipeReaderGuide.cjs');
const { SSAMJANG_RECIPE_ID } = readerGuide;

function loadComponent(file, boundaries, react = React) {
  const mod = { exports: {} };
  // JSX styling is a Next build boundary, not the behavior under test here.
  const source = fs
    .readFileSync(path.join(__dirname, '..', file), 'utf8')
    .replace('<style jsx>', '<style>');
  const js = ts.transpileModule(source, {
    compilerOptions: {
      jsx: ts.JsxEmit.React,
      module: ts.ModuleKind.CommonJS,
      esModuleInterop: true,
    },
  }).outputText;
  const dependencies = {
    react,
    '../lib/recipeReaderGuide.cjs': readerGuide,
    ...boundaries,
  };
  vm.runInNewContext(js, {
    React: react,
    module: mod,
    exports: mod.exports,
    process: { env: boundaries.env || {} },
    require(id) {
      assert.ok(
        Object.hasOwn(dependencies, id),
        `Unexpected dependency: ${id}`
      );
      return dependencies[id];
    },
  });
  return mod.exports.default;
}

test('actual guide renders localized links and closed details in both languages', () => {
  const Guide = loadComponent('components/RecipeReaderGuide.js', {
    'next/link': ({ href, children }) =>
      React.createElement('a', { href }, children),
    '../styles/YukgaejangRecipeGuide.module.css': {},
  });
  for (const locale of ['en', 'de']) {
    const html = renderToStaticMarkup(
      React.createElement(Guide, { recipeId: SSAMJANG_RECIPE_ID, locale })
    );
    const copy = readerGuide.getRecipeReaderGuide(SSAMJANG_RECIPE_ID, locale);
    assert.ok(html.includes(copy.title));
    assert.equal((html.match(/<h3/g) || []).length, 3);
    assert.match(html, /<details>/);
    assert.doesNotMatch(html, /<details[^>]*\bopen/);
    for (const link of copy.links)
      assert.ok(html.includes(`href="${link.href}"`));
  }
  assert.equal(
    renderToStaticMarkup(
      React.createElement(Guide, { recipeId: 'other', locale: 'en' })
    ),
    ''
  );
});

function commentsHarness(
  locale,
  env = { NEXT_PUBLIC_DISQUS_SHORTNAME: 'test-only' }
) {
  let open = false;
  let embedCount = 0;
  let config;
  const react = {
    ...React,
    useState: () => [
      open,
      (value) => {
        open = value;
      },
    ],
  };
  const Comments = loadComponent(
    'components/DisqusComments.js',
    {
      env,
      'next/router': {
        useRouter: () => ({
          locale,
          asPath: '/recipes/ssamjang-korean-bbq-dipping-sauce',
        }),
      },
      'disqus-react': {
        DiscussionEmbed: (props) => {
          embedCount += 1;
          config = props.config;
          return React.createElement('div', { 'data-test-embed': true });
        },
      },
    },
    react
  );
  return { Comments, count: () => embedCount, config: () => config };
}

function findButton(node) {
  if (!node || typeof node !== 'object') return null;
  if (node.type === 'button') return node;
  for (const child of React.Children.toArray(node.props?.children)) {
    const found = findButton(child);
    if (found) return found;
  }
  return null;
}

test('specific question renders before click, and clicking preserves the existing discussion identity', () => {
  for (const locale of ['en', 'de']) {
    const h = commentsHarness(locale);
    const post = { id: SSAMJANG_RECIPE_ID, title: 'Ssamjang' };
    const tree = h.Comments({ post });
    const html = renderToStaticMarkup(tree);
    assert.ok(
      html.includes(
        readerGuide.getRecipeReaderGuide(post.id, locale).feedbackButton
      )
    );
    assert.match(
      html,
      locale === 'de' ? /Ein Foto ist nicht nötig/ : /No photo is needed/
    );
    assert.equal(h.count(), 0);
    findButton(tree).props.onClick();
    const opened = renderToStaticMarkup(h.Comments({ post }));
    assert.match(opened, /data-test-embed/);
    assert.equal(h.count(), 1);
    assert.equal(h.config().identifier, post.id);
    assert.equal(h.config().title, post.title);
    assert.doesNotMatch(opened, /<button/);
  }
});

test('missing Disqus configuration or incomplete post hides the comments safely', () => {
  assert.equal(
    commentsHarness('en', {}).Comments({
      post: { id: SSAMJANG_RECIPE_ID, title: 'Ssamjang' },
    }),
    null
  );
  const h = commentsHarness('en');
  for (const post of [undefined, {}, { id: SSAMJANG_RECIPE_ID }]) {
    assert.equal(h.Comments({ post }), null);
  }
  assert.equal(h.count(), 0);
});

test('other recipes retain their ordinary localized question and comments button', () => {
  for (const locale of ['en', 'de']) {
    const h = commentsHarness(locale);
    const html = renderToStaticMarkup(
      h.Comments({ post: { id: 'other', title: 'Other recipe' } })
    );
    assert.match(html, locale === 'de' ? /Kommentare öffnen/ : /Open comments/);
    assert.doesNotMatch(html, /ssamjang|Ssamjang/);
    assert.equal(h.count(), 0);
  }
});
