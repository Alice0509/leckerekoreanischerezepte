import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const entries = require('../lib/affiliate-links.json');
const { validateAffiliateLinks } = require('../lib/purchaseLinks.cjs');
const findings = validateAffiliateLinks(entries);

if (findings.length) {
  findings.forEach((finding) => console.error(finding));
  process.exit(1);
}

const enabled = process.env.AFFILIATE_LINKS_ENABLED === 'true';
console.log(
  `Affiliate registry: ${entries.length} entries; ` +
    `${entries.filter((entry) => entry.approved).length} approved; ` +
    `publication ${enabled ? 'enabled' : 'disabled'}.`
);
