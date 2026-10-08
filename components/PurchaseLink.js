import styles from '../styles/PurchaseLink.module.css';

export default function PurchaseLink({
  link,
  locale,
  className,
  children,
  compact = false,
  ariaLabel,
}) {
  const isGerman = locale === 'de';
  return (
    <>
      <a
        href={link.href}
        target="_blank"
        rel={link.isAffiliate ? 'sponsored noopener' : 'noopener noreferrer'}
        className={className}
        aria-label={ariaLabel}
      >
        {link.isAffiliate && !compact
          ? isGerman
            ? `Bei ${link.advertiserName} ansehen`
            : `View at ${link.advertiserName}`
          : children}
        {link.isAffiliate && !compact && (
          <span className={styles.label}>
            {' '}
            ({isGerman ? 'Werbung · Affiliate-Link' : 'Ad · Affiliate link'})
          </span>
        )}
      </a>
      {link.isAffiliate && compact && (
        <span className={`${styles.label} ${styles.compactDisclosure}`}>
          {isGerman ? 'Werbung · Affiliate-Link' : 'Ad · Affiliate link'}
        </span>
      )}
    </>
  );
}
