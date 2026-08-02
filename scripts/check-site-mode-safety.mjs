import fs from 'node:fs';

const files = {
  middleware: fs.readFileSync('middleware.js', 'utf8'),
  maintenance: fs.readFileSync('pages/maintenance.js', 'utf8'),
  app: fs.readFileSync('pages/_app.js', 'utf8'),
  banner: fs.readFileSync('components/SiteModeBanner.js', 'utf8'),
  package: fs.readFileSync('package.json', 'utf8'),
};

const checks = [
  ['Edge Config package', files.package, '@vercel/edge-config'],

  ['normal mode', files.middleware, "'normal'"],
  ['updates-paused mode', files.middleware, "'updates-paused'"],
  ['maintenance mode', files.middleware, "'maintenance'"],
  [
    'Global Config or Edge Config connection',
    files.middleware,
    'process.env.GLOBAL_CONFIG || process.env.EDGE_CONFIG',
  ],
  [
    'missing config connection fallback',
    files.middleware,
    'if (!connectionString)',
  ],
  ['normal fallback', files.middleware, "return 'normal'"],
  ['maintenance rewrite', files.middleware, 'NextResponse.rewrite'],
  ['maintenance bypass', files.middleware, "normalized === '/maintenance'"],
  ['robots bypass', files.middleware, "normalized === '/robots.txt'"],
  ['sitemap bypass', files.middleware, "normalized === '/sitemap.xml'"],
  ['API bypass', files.middleware, "normalized.startsWith('/api/')"],
  ['Next assets bypass', files.middleware, "normalized.startsWith('/_next/')"],
  ['site mode cookie', files.middleware, "'hy-site-mode'"],

  ['HTTP 503 status', files.maintenance, 'res.statusCode = 503'],
  ['Retry-After header', files.maintenance, "'Retry-After'"],
  ['no-store header', files.maintenance, "'Cache-Control'"],
  ['search exclusion', files.maintenance, 'noindex, nofollow'],
  ['site shell disabled', files.maintenance, 'disableSiteShell = true'],

  ['app shell condition', files.app, 'Component.disableSiteShell === true'],
  ['banner import', files.app, 'import SiteModeBanner from'],
  ['banner rendering', files.app, '<SiteModeBanner />'],

  ['banner cookie read', files.banner, 'hy-site-mode='],
  ['banner mode check', files.banner, "=== 'updates-paused'"],
  ['German notice', files.banner, 'Neue Rezepte und Aktualisierungen'],
  ['English notice', files.banner, 'New recipes and updates'],
];

let failed = false;

for (const [label, source, expected] of checks) {
  if (!source.includes(expected)) {
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
console.log('All site mode safety checks passed.');
