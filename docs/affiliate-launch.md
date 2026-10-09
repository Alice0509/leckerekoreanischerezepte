# Affiliate purchase links

Status: the first approved link is registered for REWE DE (advertiser 11652),
using publisher 3113363's issued link for REWE Beste Wahl Weizenmehl Type 550,
1 kg, product 9959918. The owner supplied the link and a Joined programme screen
on October 9, 2026. Publication still requires `AFFILIATE_LINKS_ENABLED` to be
exactly `true` at build time. Only the matching German product URL becomes an
affiliate link. Other shopping URLs remain ordinary links.

See [the Korean launch instructions](rewe-affiliate-launch.ko.md) for Vercel
activation, preview checks and the GA4 filter update. No tracking scripts or
advertising widgets are added.

## Before activation

1. Complete the pending Awin tax details and network onboarding.
2. Obtain each advertiser's approval and an issued link to the relevant product.
   Network membership alone does not approve an advertiser partnership.
3. Confirm commercial hosting for the project and both production domains.
   Vercel Hobby permits non-commercial personal use only; check the project's
   owning team under Settings → Billing. If staying on Vercel, review its Pro
   price, current usage and Spend Management settings before purchasing.
4. Review the site's DE/EN legal notice, privacy policy and disclosure against
   the actual affiliate integration. This code prepares disclosures; it does
   not certify legal compliance or automatically update those pages.

Official hosting references:

- https://vercel.com/docs/limits/fair-use-guidelines
- https://vercel.com/docs/plans/pro-plan
- https://vercel.com/docs/spend-management

## Add approved links

Keep the regular product URL in Sanity. Add its approved affiliate replacement
to `lib/affiliate-links.json`, with one entry per source URL and language:

```json
[
  {
    "sourceUrl": "https://shop.example/product",
    "affiliateUrl": "https://tracking.example/issued-link",
    "locale": "de",
    "advertiserName": "Example Shop",
    "approved": true
  }
]
```

The example addresses are documentation placeholders. Use issued URLs only;
never invent tracking parameters. Do not store tax numbers, credentials or API
keys in this file. `approved` records a manually verified advertiser approval;
the application does not query Awin approval status.

Replacement requires all three: the build flag, `approved: true`, and a matching
source URL/language. There is no automatic DE/EN substitution. Invalid entries
or duplicate source/language pairs fail the build. Affiliate destinations must
use HTTPS without embedded credentials.

Gallery and ingredient shopping sections share the same resolver. Marked links
show the advertiser name, a DE/EN affiliate label, `rel="sponsored noopener"`,
and a section disclosure explaining potential commission. Ordinary links keep
their existing label. Gallery does not automatically fetch shopping URLs, so
opening the page itself does not follow an affiliate URL. The integration adds
no impression pixel, prefetch or client-side click request.

## Verification and deployment

```sh
npm run test:purchase-links
npm run check:affiliate-links
AFFILIATE_LINKS_ENABLED=false npm run build:checked
```

First review the inactive preview: all existing shopping links should remain
ordinary, with no affiliate notice. Once hosting, approval and legal pages are
ready, enable `AFFILIATE_LINKS_ENABLED=true` in the intended deployment
environment and rebuild. Review both languages and ingredient shopping sections
before promoting that deployment. Do not use automated link crawlers on tracking
URLs; they can create unwanted click activity.

For rollback, set the flag to `false` and rebuild/redeploy, or revert to the last
inactive deployment. Changing the variable alone cannot change already generated
static pages. Contentful archives and Sanity content are untouched by this work.
