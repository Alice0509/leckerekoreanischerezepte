// pages/impressum.js

import Head from 'next/head';
import styles from '../styles/Impressum.module.css';

const Impressum = () => (
  <>
    <Head>
      <title>Impressum - Hansik Young</title>
      <meta
        name="description"
        content="Impressum von Hansik Young, einer Website für koreanische Hausmannskost, Rezepte und Zutaten-Notizen in Deutschland."
      />
    </Head>

    <div className={styles.container}>
      <h1 className={styles.heading1}>Impressum</h1>

      <h2 className={styles.heading2}>Angaben gemäß § 5 DDG</h2>

      <p className={styles.paragraph}>
        <strong>Soojin Lee</strong>
        <br />
        Pentenrieder Str. 30
        <br />
        82152 Krailling
        <br />
        Deutschland
      </p>

      <h2 className={styles.heading2}>Kontakt</h2>

      <p className={styles.paragraph}>
        E-Mail:{' '}
        <a href="mailto:joan.korean.rezepte@gmail.com" className={styles.link}>
          joan.korean.rezepte@gmail.com
        </a>
      </p>

      <h2 className={styles.heading2}>
        Verantwortlich für den Inhalt gemäß § 18 Abs. 2 MStV
      </h2>

      <p className={styles.paragraph}>
        <strong>Soojin Lee</strong>
        <br />
        Pentenrieder Str. 30
        <br />
        82152 Krailling
        <br />
        Deutschland
      </p>

      <h2 className={styles.heading2}>Haftung für Inhalte</h2>

      <p className={styles.paragraph}>
        Die Inhalte dieser Website wurden mit Sorgfalt erstellt. Für die
        Richtigkeit, Vollständigkeit und Aktualität der Inhalte können wir
        jedoch keine Gewähr übernehmen.
      </p>

      <p className={styles.paragraph}>
        Als Diensteanbieter sind wir für eigene Inhalte auf diesen Seiten nach
        den allgemeinen Gesetzen verantwortlich. Verpflichtungen zur Entfernung
        oder Sperrung der Nutzung von Informationen nach den allgemeinen
        Gesetzen bleiben hiervon unberührt. Eine diesbezügliche Haftung ist erst
        ab dem Zeitpunkt der Kenntnis einer konkreten Rechtsverletzung möglich.
        Bei Bekanntwerden von entsprechenden Rechtsverletzungen werden wir diese
        Inhalte umgehend entfernen.
      </p>

      <h2 className={styles.heading2}>Haftung für Links</h2>

      <p className={styles.paragraph}>
        Diese Website enthält Links zu externen Websites Dritter, auf deren
        Inhalte wir keinen Einfluss haben. Deshalb können wir für diese fremden
        Inhalte auch keine Gewähr übernehmen. Für die Inhalte der verlinkten
        Seiten ist stets der jeweilige Anbieter oder Betreiber der Seiten
        verantwortlich.
      </p>

      <p className={styles.paragraph}>
        Die verlinkten Seiten wurden zum Zeitpunkt der Verlinkung auf mögliche
        Rechtsverstöße überprüft. Rechtswidrige Inhalte waren zum Zeitpunkt der
        Verlinkung nicht erkennbar. Eine dauerhafte inhaltliche Kontrolle der
        verlinkten Seiten ist ohne konkrete Anhaltspunkte einer Rechtsverletzung
        nicht zumutbar. Bei Bekanntwerden von Rechtsverletzungen werden wir
        derartige Links umgehend entfernen.
      </p>

      <h2 className={styles.heading2}>Urheberrecht</h2>

      <p className={styles.paragraph}>
        Die durch die Seitenbetreiberin erstellten Inhalte, Texte, Bilder,
        Rezepte und Musik auf dieser Website unterliegen dem deutschen
        Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und jede
        Art der Verwertung außerhalb der Grenzen des Urheberrechts bedürfen der
        schriftlichen Zustimmung der jeweiligen Autorin bzw. Erstellerin.
      </p>

      <p className={styles.paragraph}>
        Downloads und Kopien dieser Website sind nur für den privaten, nicht
        kommerziellen Gebrauch gestattet.
      </p>

      <p className={styles.paragraph}>
        Soweit Inhalte auf dieser Website nicht von der Betreiberin erstellt
        wurden, werden die Urheberrechte Dritter beachtet. Sollten Sie trotzdem
        auf eine Urheberrechtsverletzung aufmerksam werden, bitten wir um einen
        entsprechenden Hinweis. Bei Bekanntwerden von Rechtsverletzungen werden
        wir derartige Inhalte umgehend entfernen.
      </p>
    </div>
  </>
);

export default Impressum;
