// pages/imprint.js

import Head from 'next/head';
import styles from '../styles/Impressum.module.css';

const Imprint = () => (
  <>
    <Head>
      <title>Imprint - Hansik Young</title>
      <meta
        name="description"
        content="Imprint for Hansik Young, a Korean home cooking website with recipes and ingredient notes in Germany."
      />
    </Head>

    <div className={styles.container}>
      <h1 className={styles.heading1}>Imprint</h1>

      <h2 className={styles.heading2}>Information pursuant to § 5 DDG</h2>

      <p className={styles.paragraph}>
        <strong>Soojin Lee</strong>
        <br />
        Pentenrieder Str. 30
        <br />
        82152 Krailling
        <br />
        Germany
      </p>

      <h2 className={styles.heading2}>Contact</h2>

      <p className={styles.paragraph}>
        Email:{' '}
        <a href="mailto:joan.korean.rezepte@gmail.com" className={styles.link}>
          joan.korean.rezepte@gmail.com
        </a>
      </p>

      <h2 className={styles.heading2}>
        Responsible for content pursuant to § 18 Abs. 2 MStV
      </h2>

      <p className={styles.paragraph}>
        <strong>Soojin Lee</strong>
        <br />
        Pentenrieder Str. 30
        <br />
        82152 Krailling
        <br />
        Germany
      </p>

      <h2 className={styles.heading2}>Liability for content</h2>

      <p className={styles.paragraph}>
        The contents of this website have been created with care. However, we
        cannot guarantee that all information is complete, accurate or always up
        to date.
      </p>

      <p className={styles.paragraph}>
        As a service provider, we are responsible for our own content on this
        website under general law. Obligations to remove or block the use of
        information under general law remain unaffected. Liability in this
        respect is only possible from the time we become aware of a specific
        legal infringement. If we become aware of such infringements, we will
        remove the relevant content immediately.
      </p>

      <h2 className={styles.heading2}>Liability for links</h2>

      <p className={styles.paragraph}>
        This website contains links to external third-party websites. We have no
        influence over the content of those websites and therefore cannot accept
        any liability for such external content. The respective provider or
        operator of the linked pages is always responsible for their content.
      </p>

      <p className={styles.paragraph}>
        The linked pages were checked for possible legal violations at the time
        of linking. No illegal content was recognizable at that time. Permanent
        monitoring of linked pages is not reasonable without specific evidence
        of a legal infringement. If we become aware of legal violations, we will
        remove such links immediately.
      </p>

      <h2 className={styles.heading2}>Copyright</h2>

      <p className={styles.paragraph}>
        The content, texts, images, recipes and music created by the website
        operator on this website are subject to German copyright law.
        Reproduction, editing, distribution or any kind of use outside the
        limits of copyright law requires the written consent of the respective
        author or creator.
      </p>

      <p className={styles.paragraph}>
        Downloads and copies of this website are permitted only for private,
        non-commercial use.
      </p>

      <p className={styles.paragraph}>
        Where content on this website was not created by the operator, third
        party copyrights are respected. If you nevertheless become aware of a
        copyright infringement, please let us know. If we become aware of legal
        violations, we will remove such content immediately.
      </p>
    </div>
  </>
);

export default Imprint;
