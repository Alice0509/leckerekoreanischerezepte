import fs from 'node:fs';

const readJson = (path) => JSON.parse(fs.readFileSync(path, 'utf8'));

const manifest = readJson('public/manifest.json');
const manifestEn = readJson('public/manifest-en.json');
const manifestDe = readJson('public/manifest-de.json');

const nextConfig = fs.readFileSync('next.config.js', 'utf8');
const documentSource = fs.readFileSync('pages/_document.js', 'utf8');

const checks = [
  ['common manifest id', manifest.id === '/'],
  ['common manifest start_url', manifest.start_url === '/'],
  ['common manifest scope', manifest.scope === '/'],
  ['common manifest brand', manifest.short_name === 'Hansik Young'],
  [
    'legacy Korean short name removed',
    !JSON.stringify(manifest).includes('젊은한식'),
  ],

  ['English manifest language', manifestEn.lang === 'en'],
  ['English manifest id', manifestEn.id === '/'],
  ['English manifest start_url', manifestEn.start_url === '/'],
  ['English manifest scope', manifestEn.scope === '/'],

  ['German manifest language', manifestDe.lang === 'de'],
  ['German manifest id', manifestDe.id === '/'],
  ['German manifest start_url', manifestDe.start_url === '/'],
  ['German manifest scope', manifestDe.scope === '/'],

  [
    'English manifest document link',
    documentSource.includes("'/manifest-en.json'"),
  ],
  [
    'German manifest document link',
    documentSource.includes("'/manifest-de.json'"),
  ],

  ['publicExcludes configured', nextConfig.includes('publicExcludes')],
  [
    'manifest files excluded from precache',
    nextConfig.includes("'!manifest*.json'"),
  ],
  [
    'robots files excluded from precache',
    nextConfig.includes("'!robots*.txt'"),
  ],
  [
    'sitemap files excluded from precache',
    nextConfig.includes("'!sitemap*.xml'"),
  ],
  ['verification key excluded', nextConfig.includes("'!key.txt'")],
];

let failed = false;

for (const [label, passed] of checks) {
  if (!passed) {
    failed = true;
    console.error(`FAIL: ${label}`);
    continue;
  }

  console.log(`PASS: ${label}`);
}

if (failed) {
  process.exit(1);
}

console.log();
console.log('All PWA domain safety checks passed.');
