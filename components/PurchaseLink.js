import styles from '../styles/PurchaseLink.module.css';

export default function PurchaseLink({ link, locale, className, children }) {
  const isGerman = locale === 'de';
  return (
    <a
      href={link.href}
      target="_blank"
      rel={link.isAffiliate ? 'sponsored noopener' : 'noopener noreferrer'}
      className={className}
    >
      {link.isAffiliate
        ? isGerman
          ? `Bei ${link.advertiserName} ansehen`
          : `View at ${link.advertiserName}`
        : children}
      {link.isAffiliate && (
        <span className={styles.label}>
          {' '}
          ({isGerman ? 'Werbung · Affiliate-Link' : 'Ad · Affiliate link'})
        </span>
      )}
    </a>
  );
}
