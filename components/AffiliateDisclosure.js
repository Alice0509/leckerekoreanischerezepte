export default function AffiliateDisclosure({ locale, className }) {
  return (
    <p className={className}>
      {locale === 'de'
        ? 'Werbung: Die entsprechend gekennzeichneten Links sind Affiliate-Links. Wenn du darüber einkaufst, erhalte ich möglicherweise eine Provision.'
        : 'Advertisement: The marked links are affiliate links. If you purchase through them, I may receive a commission.'}
    </p>
  );
}
