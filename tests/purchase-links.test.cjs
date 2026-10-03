const test = require('node:test');
const assert = require('node:assert/strict');
const {
  getPurchaseLinks,
  validateAffiliateLinks,
} = require('../lib/purchaseLinks.cjs');

const source = 'https://shop.example/ingredient';
const affiliate = 'https://tracking.example/approved-link';
const entry = {
  sourceUrl: source,
  affiliateUrl: affiliate,
  locale: 'de',
  advertiserName: 'Example Shop',
  approved: true,
};

test('disabled publication preserves the ordinary link without tracking data', () => {
  const links = getPurchaseLinks([source], 'de', {
    entries: [entry],
    enabled: false,
  });
  assert.deepEqual(links, [
    { href: source, isAffiliate: false, advertiserName: '' },
  ]);
  assert.equal(JSON.stringify(links).includes(affiliate), false);
});

test('publication is off by default when the environment flag is absent', () => {
  const previous = process.env.AFFILIATE_LINKS_ENABLED;
  delete process.env.AFFILIATE_LINKS_ENABLED;
  try {
    assert.equal(
      getPurchaseLinks([source], 'de', { entries: [entry] })[0].isAffiliate,
      false
    );
  } finally {
    if (previous === undefined) delete process.env.AFFILIATE_LINKS_ENABLED;
    else process.env.AFFILIATE_LINKS_ENABLED = previous;
  }
});

test('only approved entries for the current language become affiliate links', () => {
  assert.deepEqual(
    getPurchaseLinks([source], 'de', { entries: [entry], enabled: true }),
    [{ href: affiliate, isAffiliate: true, advertiserName: 'Example Shop' }]
  );
  assert.equal(
    getPurchaseLinks([source], 'en', { entries: [entry], enabled: true })[0]
      .isAffiliate,
    false
  );
  assert.equal(
    getPurchaseLinks([source], 'de', {
      entries: [{ ...entry, approved: false }],
      enabled: true,
    })[0].isAffiliate,
    false
  );
});

test('unmatched ordinary links remain ordinary even when publication is enabled', () => {
  const other = 'https://shop.example/other-product';
  assert.deepEqual(
    getPurchaseLinks([other], 'de', { entries: [entry], enabled: true }),
    [{ href: other, isAffiliate: false, advertiserName: '' }]
  );
});

test('unsafe CMS link schemes and embedded credentials are not rendered', () => {
  const links = getPurchaseLinks(
    [
      'javascript:alert(1)',
      'data:text/html,test',
      '//shop.example/',
      'https://user:password@shop.example/',
      '',
      null,
      ` ${source} `,
    ],
    'de',
    { entries: [], enabled: false }
  );
  assert.deepEqual(links, [
    { href: source, isAffiliate: false, advertiserName: '' },
  ]);
});

test('invalid configuration cannot silently publish unsafe or ambiguous links', () => {
  for (const changed of [
    { affiliateUrl: 'http://tracking.example/' },
    { affiliateUrl: 'javascript:alert(1)' },
    { affiliateUrl: 'https://user:password@tracking.example/' },
    { approved: undefined },
    { locale: '*' },
    { advertiserName: '' },
  ]) {
    const entries = [{ ...entry, ...changed }];
    assert.ok(validateAffiliateLinks(entries).length > 0);
    assert.throws(() =>
      getPurchaseLinks([source], 'de', { entries, enabled: true })
    );
  }
  assert.ok(validateAffiliateLinks([entry, entry]).length > 0);
  assert.ok(validateAffiliateLinks({}).length > 0);
});
