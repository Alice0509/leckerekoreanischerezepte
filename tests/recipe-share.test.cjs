const test = require('node:test');
const assert = require('node:assert/strict');
const {
  buildShareCaption,
  buildPinterestDetails,
  drawShareCard,
  getShareSize,
  SHARE_WIDTH,
  SHARE_HEIGHT,
  PIN_WIDTH,
  PIN_HEIGHT,
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

test('Pinterest fields preserve the locale recipe destination and use public campaign values only', () => {
  for (const [locale, origin, slug, description] of [
    [
      'en',
      'https://www.hansikyoung.com',
      'easy-japanese-golden-curry',
      'Japanese curry with onion and carrot. Serve with rice.',
    ],
    [
      'de',
      'https://www.leckere-koreanische-rezepte.de',
      'einfaches-japanisches-golden-curry',
      'Japanisches Curry mit Zwiebel und Karotte. Dazu passt Reis.',
    ],
  ]) {
    const pin = buildPinterestDetails({
      title: 'Golden Curry (카레)',
      description,
      canonicalUrl: `${origin}/recipes/${slug}?email=private#steps`,
      locale,
    });
    const url = new URL(pin.link);
    assert.equal(url.origin, origin);
    assert.equal(url.pathname, `/recipes/${slug}`);
    assert.equal(url.hash, '');
    assert.deepEqual(Object.fromEntries(url.searchParams), {
      utm_source: 'pinterest',
      utm_medium: 'social',
      utm_campaign: 'recipe_discovery',
      utm_content: `${slug}_${locale}`,
    });
    assert.equal(pin.title, 'Golden Curry');
    assert.equal(pin.description, description);
    assert.ok(!pin.description.includes('Korean curry'));
    assert.ok(!pin.link.includes('private'));
  }
});

test('Pinterest text fits field limits without splitting Unicode or inventing preparation time', () => {
  const pin = buildPinterestDetails({
    title: '🥣'.repeat(110),
    description: '한'.repeat(810),
    canonicalUrl: 'https://www.hansikyoung.com/recipes/bibim-noodle-sauce',
  });
  assert.equal(Array.from(pin.title).length, 100);
  assert.equal(Array.from(pin.description).length, 800);
  assert.ok(pin.title.endsWith('…') && pin.description.endsWith('…'));
  assert.ok(!pin.title.includes('\uFFFD'));
  for (const locale of ['en', 'de']) {
    const fallback = buildPinterestDetails({
      title: 'Bibim sauce',
      description: '   ',
      canonicalUrl: 'https://www.hansikyoung.com/recipes/bibim-noodle-sauce',
      locale,
    });
    assert.ok(fallback.description.includes('Hansik Young'));
    assert.ok(!/5|minute|Minute|calori|Kalori/.test(fallback.description));
  }
  for (const canonicalUrl of [
    'http://www.hansikyoung.com/recipes/sauce',
    'https://name:secret@www.hansikyoung.com/recipes/sauce',
  ]) {
    assert.throws(() => buildPinterestDetails({ canonicalUrl }));
  }
});

test('Pinterest cards fit full landscape, portrait and square photos inside a 2:3 canvas', () => {
  assert.deepEqual(getShareSize(), { width: 1080, height: 1350 });
  assert.deepEqual(getShareSize('pinterest'), { width: 1000, height: 1500 });
  assert.throws(() => getShareSize('unknown'));
  for (const locale of ['en', 'de']) {
    for (const image of [
      { width: 1600, height: 900 },
      { width: 900, height: 1600 },
      { width: 1200, height: 1200 },
    ]) {
      const calls = [];
      const context = {
        fillRect: (...args) => calls.push(['rect', ...args]),
        drawImage: (...args) => calls.push(['image', ...args]),
        fillText: (...args) => calls.push(['text', ...args]),
        measureText: (text) => ({ width: Array.from(text).length * 12 }),
      };
      drawShareCard(context, image, {
        title: 'A long recipe title with vegetables and sauce '.repeat(6),
        canonicalUrl:
          locale === 'de'
            ? 'https://www.leckere-koreanische-rezepte.de/recipes/sauce'
            : 'https://www.hansikyoung.com/recipes/sauce',
        locale,
        format: 'pinterest',
      });
      assert.deepEqual(calls[0], ['rect', 0, 0, PIN_WIDTH, PIN_HEIGHT]);
      const photo = calls.find((call) => call[0] === 'image');
      assert.equal(photo.length, 6); // Draw the whole image; no source crop.
      assert.ok(
        Math.abs(photo[4] / photo[5] - image.width / image.height) < 1e-10
      );
      assert.ok(photo[2] >= 50 && photo[3] >= 390);
      assert.ok(photo[2] + photo[4] <= 950 && photo[3] + photo[5] <= 1210);
      for (const [, text, x, y] of calls.filter((call) => call[0] === 'text')) {
        assert.ok(x + context.measureText(text).width <= PIN_WIDTH);
        assert.ok(y > 0 && y < PIN_HEIGHT);
      }
      assert.ok(
        calls.some(
          (call) =>
            call[0] === 'text' &&
            call[1] ===
              (locale === 'de' ? 'AUS MEINER KÜCHE' : 'FROM MY KITCHEN')
        )
      );
    }
  }
});

test('a long unbroken word cannot overflow any canvas title line', () => {
  const context = {
    measureText: (text) => ({ width: Array.from(text).length * 10 }),
  };
  const lines = wrapCanvasText(
    context,
    '🥣'.repeat(50) + ' sauce recipe',
    200,
    3
  );
  assert.ok(lines.length <= 3);
  assert.ok(lines.every((line) => context.measureText(line).width <= 200));
  assert.ok(lines[0].endsWith('…'));
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
