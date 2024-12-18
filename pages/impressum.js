// pages/impressum.js

import Head from 'next/head';
import styles from '../styles/Impressum.module.css';

const Impressum = () => (
  <>
    <Head>
      <title>
        Impressum - Leckere Koreanische Rezepte &amp; HansikYoungRecipes
      </title>
      <meta
        name="description"
        content="Impressum von Leckere Koreanische Rezepte und HansikYoungRecipes."
      />
    </Head>
    <div className={styles.container}>
      <h1 className={styles.heading1}>Impressum</h1>

      <h2 className={styles.heading2}>Angaben gemäß § 5 TMG:</h2>
      <p className={styles.paragraph}>
        <strong>[Soojin Lee]</strong>
        <br />
        [Pentenrieder Str.30]
        <br />
        [82152 Krailling]
        <br />
      </p>

      <h2 className={styles.heading2}>Kontakt:</h2>
      <p className={styles.paragraph}>
        E-Mail:{' '}
        <a href="mailto:[Ihre E-Mail-Adresse]" className={styles.link}>
          [joan.korean.rezepte@gmail.com]
        </a>
      </p>

      <h2 className={styles.heading2}>
        Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV:
      </h2>
      <p className={styles.paragraph}>
        <strong>[Soojin Lee]</strong>
        <br />
        [Pentenrieder Str.30]
        <br />
        [82152 Krailling]
      </p>

      <h2 className={styles.heading2}>Haftungsausschluss (Disclaimer):</h2>
      <h3 className={styles.heading3}>Haftung für Inhalte</h3>
      <p className={styles.paragraph}>
        Als Diensteanbieter sind wir gemäß § 7 Abs.1 TMG für eigene Inhalte auf
        diesen Seiten nach den allgemeinen Gesetzen verantwortlich. Nach §§ 8
        bis 10 TMG sind wir als Diensteanbieter jedoch nicht verpflichtet,
        übermittelte oder gespeicherte fremde Informationen zu überwachen oder
        nach Umständen zu forschen, die auf eine rechtswidrige Tätigkeit
        hinweisen.
      </p>
      <p className={styles.paragraph}>
        Verpflichtungen zur Entfernung oder Sperrung der Nutzung von
        Informationen nach den allgemeinen Gesetzen bleiben hiervon unberührt.
        Eine diesbezügliche Haftung ist jedoch erst ab dem Zeitpunkt der
        Kenntnis einer konkreten Rechtsverletzung möglich. Bei Bekanntwerden von
        entsprechenden Rechtsverletzungen werden wir diese Inhalte umgehend
        entfernen.
      </p>

      <h3 className={styles.heading3}>Haftung für Links</h3>
      <p className={styles.paragraph}>
        Unser Angebot enthält Links zu externen Websites Dritter, auf deren
        Inhalte wir keinen Einfluss haben. Deshalb können wir für diese fremden
        Inhalte auch keine Gewähr übernehmen. Für die Inhalte der verlinkten
        Seiten ist stets der jeweilige Anbieter oder Betreiber der Seiten
        verantwortlich.
      </p>
      <p className={styles.paragraph}>
        Die verlinkten Seiten wurden zum Zeitpunkt der Verlinkung auf mögliche
        Rechtsverstöße überprüft. Rechtswidrige Inhalte waren zum Zeitpunkt der
        Verlinkung nicht erkennbar.
      </p>
      <p className={styles.paragraph}>
        Eine permanente inhaltliche Kontrolle der verlinkten Seiten ist jedoch
        ohne konkrete Anhaltspunkte einer Rechtsverletzung nicht zumutbar. Bei
        Bekanntwerden von Rechtsverletzungen werden wir derartige Links umgehend
        entfernen.
      </p>

      <h3 className={styles.heading3}>Urheberrecht</h3>
      <p className={styles.paragraph}>
        Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen
        Seiten unterliegen dem deutschen Urheberrecht. Die Vervielfältigung,
        Bearbeitung, Verbreitung und jede Art der Verwertung außerhalb der
        Grenzen des Urheberrechts bedürfen der schriftlichen Zustimmung des
        jeweiligen Autors bzw. Erstellers.
      </p>
      <p className={styles.paragraph}>
        Downloads und Kopien dieser Seite sind nur für den privaten, nicht
        kommerziellen Gebrauch gestattet.
      </p>
      <p className={styles.paragraph}>
        Soweit die Inhalte auf dieser Seite nicht vom Betreiber erstellt wurden,
        werden die Urheberrechte Dritter beachtet. Insbesondere werden Inhalte
        Dritter als solche gekennzeichnet. Sollten Sie trotzdem auf eine
        Urheberrechtsverletzung aufmerksam werden, bitten wir um einen
        entsprechenden Hinweis. Bei Bekanntwerden von Rechtsverletzungen werden
        wir derartige Inhalte umgehend entfernen.
      </p>
    </div>
  </>
);

export default Impressum;
