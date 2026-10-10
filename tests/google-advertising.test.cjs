const test = require('node:test');
const assert = require('node:assert/strict');
const {
  getAdvertisingClient,
  isPrivacyPage,
  loadAdvertisingScript,
  subscribeAdvertisingPrivacy,
  reopenAdvertisingPrivacy,
} = require('../lib/google-advertising.cjs');

const client = 'ca-pub-8336348698974993';

test('advertising stays off unless enabled with a valid public publisher ID', () => {
  for (const flag of [undefined, '', 'false', 'TRUE', true]) {
    assert.equal(getAdvertisingClient(flag, client, '/recipes/test'), '');
  }
  for (const id of [
    undefined,
    '',
    'pub-8336348698974993',
    client + '" onload="x',
    'ca-pub-1',
  ]) {
    assert.equal(getAdvertisingClient('true', id, '/'), '');
  }
  assert.equal(
    getAdvertisingClient('true', ` ${client} `, '/recipes/test'),
    client
  );
});

test('both privacy pages are excluded, including locale prefixes and query strings', () => {
  for (const path of [
    '/privacy-policy',
    '/de/datenschutzerklaerung/',
    '/en/privacy-policy?fc=alwaysshow',
    '/datenschutzerklaerung#cookies',
  ]) {
    assert.equal(isPrivacyPage(path), true);
    assert.equal(getAdvertisingClient('true', client, path), '');
  }
  for (const path of [
    '/',
    '/ingredients/flour',
    '/recipes/privacy-policy-sauce',
  ]) {
    assert.equal(isPrivacyPage(path), false);
  }
});

test('the loader adds one async head tag across repeat calls and rejects injected IDs', () => {
  const nodes = new Map();
  const doc = {
    getElementById: (id) => nodes.get(id),
    createElement: () => ({}),
    head: { appendChild: (node) => nodes.set(node.id, node) },
  };
  loadAdvertisingScript(doc, client);
  loadAdvertisingScript(doc, client);
  loadAdvertisingScript(doc, 'invalid');
  assert.equal(nodes.size, 1);
  const script = [...nodes.values()][0];
  assert.equal(
    script.src,
    `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${client}`
  );
  assert.equal(script.async, true);
  assert.equal(script.crossOrigin, 'anonymous');
});

test('settings stay hidden until the consent API is ready and GDPR applies', () => {
  let listener;
  const statuses = [];
  const win = {
    googlefc: { showRevocationMessage() {} },
    __tcfapi: (command, version, callback) => {
      assert.equal(command, 'addEventListener');
      listener = callback;
    },
  };
  subscribeAdvertisingPrivacy(win, (ready) => statuses.push(ready));
  assert.deepEqual(statuses, []);
  win.googlefc.callbackQueue[0].CONSENT_API_READY();
  listener(undefined, false);
  listener({ gdprApplies: undefined }, true);
  listener({ gdprApplies: false }, true);
  listener({ gdprApplies: true }, true);
  assert.deepEqual(statuses, [false, false, false, true]);
});

test('unmounted settings do not respond to late callbacks and remove TCF listeners', () => {
  let listener;
  const removed = [];
  const win = {
    __tcfapi: (command, version, callback, id) => {
      if (command === 'addEventListener') listener = callback;
      if (command === 'removeEventListener') removed.push(id);
    },
  };
  const cleanup = subscribeAdvertisingPrivacy(win, () =>
    assert.fail('late callback')
  );
  win.googlefc.callbackQueue[0].CONSENT_API_READY();
  cleanup();
  listener({ gdprApplies: true, listenerId: 42 }, true);
  assert.deepEqual(removed, [42]);
  const blocked = {};
  const cancel = subscribeAdvertisingPrivacy(blocked, () =>
    assert.fail('blocked script')
  );
  cancel();
  blocked.googlefc.callbackQueue[0].CONSENT_API_READY();
});

test('reopening the message uses the supported queue and does not grant analytics', () => {
  let reopened = 0;
  const win = {
    googlefc: { callbackQueue: [], showRevocationMessage: () => reopened++ },
  };
  reopenAdvertisingPrivacy(win);
  assert.equal(reopened, 0);
  win.googlefc.callbackQueue[0].CONSENT_API_READY();
  assert.equal(reopened, 1);
  assert.deepEqual(Object.keys(win), ['googlefc']);
  assert.doesNotThrow(() => reopenAdvertisingPrivacy({}));
});
