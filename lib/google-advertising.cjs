const SCRIPT_ID = 'hansik-google-advertising';
const PUBLISHER_PATTERN = /^ca-pub-[0-9]{16}$/;

function isPrivacyPage(pathname = '') {
  const path = pathname.split(/[?#]/)[0].replace(/^\/(en|de)(?=\/)/, '');
  return /^\/(privacy-policy|datenschutzerklaerung)\/?$/.test(path);
}

function getAdvertisingClient(enabled, publisherId, pathname) {
  const client = typeof publisherId === 'string' ? publisherId.trim() : '';
  return enabled === 'true' &&
    PUBLISHER_PATTERN.test(client) &&
    !isPrivacyPage(pathname)
    ? client
    : '';
}

// A single head tag lets AdSense deploy the messages published for this domain.
// Consent and ad eligibility are decided by Google, never by the analytics cookie.
function loadAdvertisingScript(doc, client) {
  if (!PUBLISHER_PATTERN.test(client || '') || doc.getElementById(SCRIPT_ID))
    return;
  const script = doc.createElement('script');
  script.id = SCRIPT_ID;
  script.async = true;
  script.crossOrigin = 'anonymous';
  script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${client}`;
  doc.head.appendChild(script);
}

function subscribeAdvertisingPrivacy(win, onReady) {
  let active = true;
  let listenerId;
  win.googlefc = win.googlefc || {};
  win.googlefc.callbackQueue = win.googlefc.callbackQueue || [];
  win.googlefc.callbackQueue.push({
    CONSENT_API_READY: () => {
      if (!active || typeof win.__tcfapi !== 'function') return;
      win.__tcfapi('addEventListener', 0, (data, success) => {
        if (data) listenerId = data.listenerId;
        if (!active) {
          if (listenerId != null)
            win.__tcfapi('removeEventListener', 0, () => {}, listenerId);
          return;
        }
        onReady(
          Boolean(
            success &&
              data?.gdprApplies === true &&
              typeof win.googlefc.showRevocationMessage === 'function'
          )
        );
      });
    },
  });
  return () => {
    active = false;
    if (listenerId != null && typeof win.__tcfapi === 'function') {
      win.__tcfapi('removeEventListener', 0, () => {}, listenerId);
    }
  };
}

function reopenAdvertisingPrivacy(win) {
  if (typeof win.googlefc?.showRevocationMessage !== 'function') return;
  win.googlefc.callbackQueue = win.googlefc.callbackQueue || [];
  win.googlefc.callbackQueue.push({
    CONSENT_API_READY: () => win.googlefc.showRevocationMessage(),
  });
}

module.exports = {
  isPrivacyPage,
  getAdvertisingClient,
  loadAdvertisingScript,
  subscribeAdvertisingPrivacy,
  reopenAdvertisingPrivacy,
};
