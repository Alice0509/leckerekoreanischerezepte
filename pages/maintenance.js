import Head from 'next/head';
import styles from '../styles/Maintenance.module.css';

const copy = {
  de: {
    title: 'Wir sind gleich wieder da',
    description:
      'Hansik Young wird gerade kurz überprüft. Bitte versuchen Sie es in wenigen Minuten erneut.',
    label: 'Vorübergehend nicht verfügbar',
    note: 'Bereits veröffentlichte Rezepte werden nicht gelöscht.',
    retry: 'Seite erneut laden',
  },
  en: {
    title: 'We will be back shortly',
    description:
      'Hansik Young is undergoing a short check. Please try again in a few minutes.',
    label: 'Temporarily unavailable',
    note: 'Previously published recipes are not being removed.',
    retry: 'Reload this page',
  },
};

export default function MaintenancePage({ locale }) {
  const text = copy[locale] || copy.en;

  return (
    <>
      <Head>
        <title>{text.title} | Hansik Young</title>
        <meta name="description" content={text.description} />
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <main className={styles.page}>
        <section className={styles.card}>
          <p className={styles.eyebrow}>{text.label}</p>

          <div className={styles.mark} aria-hidden="true">
            HY
          </div>

          <h1>{text.title}</h1>
          <p className={styles.description}>{text.description}</p>
          <p className={styles.note}>{text.note}</p>

          <button
            className={styles.button}
            type="button"
            onClick={() => window.location.reload()}
          >
            {text.retry}
          </button>
        </section>
      </main>
    </>
  );
}

MaintenancePage.disableSiteShell = true;

export async function getServerSideProps({ locale, res }) {
  res.statusCode = 503;
  res.setHeader('Retry-After', '3600');
  res.setHeader('Cache-Control', 'no-store, max-age=0');

  return {
    props: {
      locale: locale === 'de' ? 'de' : 'en',
    },
  };
}
