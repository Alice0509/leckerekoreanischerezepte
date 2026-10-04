const test = require('node:test');
const assert = require('node:assert/strict');
const {
  buildShareCaption,
  drawShareCard,
  SHARE_WIDTH,
  SHARE_HEIGHT,
  wrapCanvasText,
} = require('../lib/recipeShare.cjs');

test('captions use the correct language and exact public recipe link without invented timing or nutrition', () => {
  for (const locale of ['en', 'de']) {
    const url =
      locale === 'de'
        ? 'https://www.leckere-koreanische-rezepte.de/recipes/bibim-noodle-sauce'
        : 'https://www.hansikyoung.com/recipes/bibim-noodle-sauce';
    const caption = buildShareCaption({
      title: 'Bibim Noodle Sauce (면 비빔 소스)',
      description: 'A sweet and spicy sauce. More details.',
      canonicalUrl: url,
      locale,
    });
    assert.ok(caption.startsWith('Bibim Noodle Sauce\n'));
    assert.ok(caption.endsWith(url));
    assert.ok(
      caption.includes(locale === 'de' ? 'Das ganze Rezept:' : 'Full recipe:')
    );
    assert.ok(!caption.includes('minutes') && !caption.includes('calories'));
    assert.ok(!caption.includes('More details.'));
  }
});

test('share card reuses the complete photo and keeps the title and exact URL in a portrait canvas', () => {
  const calls = [];
  const context = {
    fillRect: (...args) => calls.push(['rect', ...args]),
    drawImage: (...args) => calls.push(['image', ...args]),
    fillText: (...args) => calls.push(['text', ...args]),
    measureText: (text) => ({ width: text.length * 10 }),
  };
  const image = { width: 1200, height: 800 };
  const url = 'https://www.hansikyoung.com/recipes/bibim-noodle-sauce';
  drawShareCard(context, image, {
    title: 'Bibim Noodle Sauce',
    canonicalUrl: url,
    locale: 'en',
  });
  assert.deepEqual(calls[0], ['rect', 0, 0, SHARE_WIDTH, SHARE_HEIGHT]);
  const photo = calls.find((call) => call[0] === 'image');
  assert.equal(photo.length, 6); // full image, no source crop
  assert.ok(Math.abs(photo[4] / photo[5] - image.width / image.height) < 1e-10);
  assert.ok(
    calls.some(
      (call) =>
        call[0] === 'text' &&
        call[1] === 'www.hansikyoung.com/recipes/bibim-noodle-sauce'
    )
  );
  assert.ok(
    calls
      .filter((call) => call[0] === 'text')
      .every((call) => call[3] <= SHARE_HEIGHT)
  );
  assert.throws(() =>
    drawShareCard(
      context,
      { width: 0, height: 0 },
      { title: 'bad', canonicalUrl: url }
    )
  );
  assert.throws(() =>
    drawShareCard(context, image, {
      title: 'bad',
      canonicalUrl: 'http://example.com',
    })
  );
  const lines = wrapCanvasText(
    context,
    'Long title repeated '.repeat(15),
    200,
    3
  );
  assert.equal(lines.length, 3);
  assert.ok(lines.at(-1).endsWith('…'));
  assert.ok(lines.every((line) => context.measureText(line).width <= 200));
});
