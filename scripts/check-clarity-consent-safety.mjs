import fs from 'node:fs';

const read = (path) => fs.readFileSync(path, 'utf8');

const app = read('pages/_app.js');
const clarity = read('components/ClarityAnalytics.js');
const privacyEn = read('pages/privacy-policy.js');
const privacyDe = read('pages/datenschutzerklaerung.js');

const source = `${app}\n${clarity}`;

const matches = (text, pattern) => pattern.test(text);

const checks = [
  [
    'English Clarity environment variable',
    clarity.includes('NEXT_PUBLIC_CLARITY_ID_EN'),
  ],
  [
    'German Clarity environment variable',
    clarity.includes('NEXT_PUBLIC_CLARITY_ID_DE'),
  ],
  [
    'Clarity project IDs are not hardcoded',
    !source.includes('xw3w3qvhxa') && !source.includes('xw3xfbd44i'),
  ],
  [
    'Clarity requires cookie consent',
    app.includes('enabled={!disableSiteShell && cookiesAccepted}'),
  ],
  [
    'Clarity disabled on maintenance shell',
    app.includes('!disableSiteShell && cookiesAccepted'),
  ],
  [
    'Clarity script uses afterInteractive',
    clarity.includes('strategy="afterInteractive"'),
  ],
  ['Consent V2 API used', clarity.includes('consentv2')],
  [
    'Analytics storage granted after consent',
    matches(clarity, /analytics_Storage:\s*["']granted["']/),
  ],
  [
    'Advertising storage denied',
    matches(clarity, /ad_Storage:\s*["']denied["']/),
  ],
  [
    'Decline handler revokes Clarity consent',
    app.includes('denyClarityConsent();'),
  ],
  [
    'Denied analytics storage implemented',
    matches(clarity, /analytics_Storage:\s*["']denied["']/),
  ],
  [
    'English privacy notice includes Clarity',
    privacyEn.includes('Microsoft Clarity'),
  ],
  [
    'German privacy notice includes Clarity',
    privacyDe.includes('Microsoft Clarity'),
  ],
  [
    'Microsoft Ireland provider disclosed in English',
    privacyEn.includes('Microsoft Ireland Operations Limited'),
  ],
  [
    'Microsoft Ireland provider disclosed in German',
    privacyDe
      .replace(/\s+/g, ' ')
      .includes('Microsoft Ireland Operations Limited'),
  ],
];

let failed = false;

for (const [label, passed] of checks) {
  if (passed) {
    console.log(`PASS: ${label}`);
  } else {
    failed = true;
    console.error(`FAIL: ${label}`);
  }
}

if (failed) {
  process.exit(1);
}

console.log();
console.log('All Clarity consent safety checks passed.');
