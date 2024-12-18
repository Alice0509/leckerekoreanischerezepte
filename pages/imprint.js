// pages/imprint.js

import Head from 'next/head';
import styles from '../styles/Impressum.module.css';

const Imprint = () => (
  <>
    <Head>
      <title>
        Imprint - Leckere Koreanische Rezepte &amp; HansikYoungRecipes
      </title>
      <meta
        name="description"
        content="Imprint of Leckere Koreanische Rezepte and HansikYoungRecipes."
      />
    </Head>
    <div className={styles.container}>
      <h1 className={styles.heading1}>Imprint</h1>

      <h2 className={styles.heading2}>Information pursuant to § 5 TMG:</h2>
      <p className={styles.paragraph}>
        <strong>[Soojin Lee]</strong>
        <br />
        [Pentenrieder Str.30]
        <br />
        [82152 Krailling]
        <br />
      </p>

      <h2 className={styles.heading2}>Contact:</h2>
      <p className={styles.paragraph}>
        Email:{' '}
        <a href="mailto:[Your Email Address]" className={styles.link}>
          [joan.korean.rezepte@gmail.com]
        </a>
      </p>

      <h2 className={styles.heading2}>
        Responsible for content pursuant to § 55 Abs. 2 RStV:
      </h2>
      <p className={styles.paragraph}>
        <strong>[Soojin Lee]</strong>
        <br />
        [Pentenrieder Str.30]
        <br />
        [82152 Krailling]
      </p>

      <h2 className={styles.heading2}>Disclaimer:</h2>
      <h3 className={styles.heading3}>Liability for Content</h3>
      <p className={styles.paragraph}>
        As a service provider, we are responsible for our own content on these
        pages according to § 7 Abs.1 TMG. However, according to §§ 8 to 10 TMG,
        we are not obliged to monitor transmitted or stored third-party
        information or investigate circumstances that indicate illegal activity.
      </p>
      <p className={styles.paragraph}>
        Obligations to remove or block the use of information pursuant to
        general laws remain unaffected. However, liability in this regard is
        only possible from the moment of knowledge of a specific infringement.
        Upon becoming aware of corresponding legal violations, we will remove
        such content immediately.
      </p>

      <h3 className={styles.heading3}>Liability for Links</h3>
      <p className={styles.paragraph}>
        Our offer contains links to external websites of third parties, on whose
        content we have no influence. Therefore, we cannot assume any liability
        for these external contents. The respective provider or operator of the
        pages is always responsible for the contents of the linked pages.
      </p>
      <p className={styles.paragraph}>
        The linked pages were checked for possible legal violations at the time
        of linking. Illegal content was not recognizable at the time of linking.
      </p>
      <p className={styles.paragraph}>
        However, a permanent in-depth control of the content of the linked pages
        is not reasonable without concrete evidence of a legal violation. Upon
        becoming aware of legal violations, we will remove such links
        immediately.
      </p>

      <h3 className={styles.heading3}>Copyright</h3>
      <p className={styles.paragraph}>
        The content and works created by the site operators on these pages are
        subject to German copyright law. The duplication, processing,
        distribution, and any kind of exploitation outside the limits of
        copyright law require the written consent of the respective author or
        creator.
      </p>
      <p className={styles.paragraph}>
        Downloads and copies of this site are only permitted for private,
        non-commercial use.
      </p>
      <p className={styles.paragraph}>
        Soweit the content on this site was not created by the operator, the
        copyrights of third parties are respected. In particular, third-party
        content is marked as such. However, if you become aware of a copyright
        infringement, please inform us accordingly. Upon becoming aware of legal
        violations, we will remove such content immediately.
      </p>
    </div>
  </>
);

export default Imprint;
