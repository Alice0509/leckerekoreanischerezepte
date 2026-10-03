const affiliateRegistry = require('./affiliate-links.json');

const parseWebUrl = (value, httpsOnly = false) => {
  if (typeof value !== 'string' || !value.trim()) return null;
  try {
    const url = new URL(value.trim());
    const protocols = httpsOnly ? ['https:'] : ['http:', 'https:'];
    return protocols.includes(url.protocol) && !url.username && !url.password
      ? url
      : null;
  } catch {
    return null;
  }
};

const validateAffiliateLinks = (entries) => {
  if (!Array.isArray(entries)) return ['Affiliate registry must be an array.'];
  const findings = [];
  const keys = new Set();
  entries.forEach((entry, index) => {
    const prefix = `Affiliate entry ${index + 1}`;
    if (!entry || typeof entry !== 'object' || Array.isArray(entry)) {
      findings.push(`${prefix}: must be an object.`);
      return;
    }
    const source = parseWebUrl(entry.sourceUrl);
    if (!source) findings.push(`${prefix}: sourceUrl must be an HTTP(S) URL.`);
    if (!parseWebUrl(entry.affiliateUrl, true)) {
      findings.push(`${prefix}: affiliateUrl must be an HTTPS URL.`);
    }
    if (!['de', 'en'].includes(entry.locale)) {
      findings.push(`${prefix}: locale must be de or en.`);
    }
    if (typeof entry.approved !== 'boolean') {
      findings.push(`${prefix}: approved must explicitly be true or false.`);
    }
    if (
      typeof entry.advertiserName !== 'string' ||
      !entry.advertiserName.trim()
    ) {
      findings.push(`${prefix}: advertiserName is required.`);
    }
    if (source) {
      const key = `${entry.locale}:${source.href}`;
      if (keys.has(key))
        findings.push(`${prefix}: duplicate sourceUrl/locale.`);
      keys.add(key);
    }
  });
  return findings;
};

// Resolve during getStaticProps so disabled tracking URLs never enter page props.
// Changing the environment variable requires a new build/deployment.
const getPurchaseLinks = (
  sourceLinks,
  locale,
  {
    entries = affiliateRegistry,
    enabled = process.env.AFFILIATE_LINKS_ENABLED === 'true',
  } = {}
) => {
  const findings = validateAffiliateLinks(entries);
  if (findings.length) throw new Error(findings.join('\n'));
  const language = locale === 'de' ? 'de' : 'en';

  return (Array.isArray(sourceLinks) ? sourceLinks : []).flatMap((source) => {
    const parsed = parseWebUrl(source);
    if (!parsed) return [];
    const match =
      enabled === true &&
      entries.find(
        (entry) =>
          entry.approved === true &&
          entry.locale === language &&
          parseWebUrl(entry.sourceUrl).href === parsed.href
      );
    return [
      {
        href: match ? match.affiliateUrl.trim() : source.trim(),
        isAffiliate: Boolean(match),
        advertiserName: match ? match.advertiserName.trim() : '',
      },
    ];
  });
};

module.exports = { getPurchaseLinks, validateAffiliateLinks };
