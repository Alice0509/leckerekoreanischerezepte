// pages/datenschutzerklaerung.js

import Head from 'next/head';
import styles from '../styles/Datenschutzerklaerung.module.css';

const Datenschutzerklaerung = () => (
  <>
    <Head>
      <title>Datenschutzerklärung - Hansik Young</title>
      <meta
        name="description"
        content="Datenschutzerklärung für Hansik Young, eine Website für koreanische Hausmannskost, Rezepte und Zutaten-Notizen in Deutschland."
      />
    </Head>

    <div className={styles.container}>
      <h1 className={styles.heading1}>Datenschutzerklärung</h1>

      <p className={styles.paragraph}>
        Diese Datenschutzerklärung ist aktuell gültig und hat den Stand vom 27.
        Juni 2026.
      </p>

      <p className={styles.paragraph}>
        Diese Datenschutzerklärung erklärt, wie personenbezogene Daten
        verarbeitet werden, wenn Sie diese Website besuchen.
      </p>

      <p className={styles.paragraph}>
        Hansik Young ist eine persönliche Website für koreanische Hausmannskost
        in Deutschland, mit Rezepten, Zutaten-Notizen und kleinen Küchenbasics.
      </p>

      <h2 className={styles.heading2}>1. Verantwortlicher</h2>

      <p className={styles.paragraph}>
        Verantwortlich für die Datenverarbeitung auf dieser Website ist:
      </p>

      <p className={styles.paragraph}>
        Soojin Lee
        <br />
        Angaben siehe Impressum
        <br />
        E-Mail:{' '}
        <a href="mailto:joan.korean.rezepte@gmail.com" className={styles.link}>
          joan.korean.rezepte@gmail.com
        </a>
      </p>

      <p className={styles.paragraph}>
        Bei Fragen zum Datenschutz können Sie sich per E-Mail an die oben
        genannte Adresse wenden.
      </p>

      <h2 className={styles.heading2}>2. Allgemeine Nutzung der Website</h2>

      <p className={styles.paragraph}>
        Sie können diese Website grundsätzlich ohne Benutzerkonto nutzen. Hansik
        Young bietet keine Benutzerkonten, keine sozialen Logins, keine
        Nutzerprofile und keine standortbasierten Funktionen an.
      </p>

      <p className={styles.paragraph}>
        Über diese Website werden nicht absichtlich besondere Kategorien
        personenbezogener Daten erhoben.
      </p>

      <h2 className={styles.heading2}>3. Zugriffsdaten und Server-Logfiles</h2>

      <p className={styles.paragraph}>
        Beim Aufruf dieser Website werden automatisch technische Daten
        verarbeitet, damit die Website sicher und korrekt ausgeliefert werden
        kann. Dazu können insbesondere gehören:
      </p>

      <ul className={styles.list}>
        <li>IP-Adresse</li>
        <li>Datum und Uhrzeit des Zugriffs</li>
        <li>Aufgerufene Seite oder Datei</li>
        <li>Browsertyp und Browserversion</li>
        <li>Verwendetes Betriebssystem</li>
        <li>Referrer-URL</li>
        <li>Statuscodes und technische Fehlerinformationen</li>
      </ul>

      <p className={styles.paragraph}>
        Die Verarbeitung erfolgt, um die Website bereitzustellen, die Sicherheit
        zu gewährleisten und technische Fehler zu beheben. Rechtsgrundlage ist
        unser berechtigtes Interesse am sicheren und funktionsfähigen Betrieb
        der Website gemäß Art. 6 Abs. 1 lit. f DSGVO.
      </p>

      <h2 className={styles.heading2}>4. Hosting</h2>

      <p className={styles.paragraph}>
        Diese Website wird bei Vercel gehostet. Vercel kann technische
        Zugriffsdaten und Server-Logdaten verarbeiten, um Hosting, Sicherheit
        und Auslieferung der Website bereitzustellen.
      </p>

      <p className={styles.paragraph}>
        Anbieter: Vercel Inc., 340 S Lemon Ave #4133, Walnut, CA 91789, USA.
      </p>

      <h2 className={styles.heading2}>
        5. Content-Management und Medienauslieferung
      </h2>

      <p className={styles.paragraph}>
        Rezepte, Zutaten-Texte und einige Medieninhalte dieser Website werden
        über Contentful verwaltet. Beim Laden von Seiten oder Medien können
        technische Anfragedaten verarbeitet werden, um diese Inhalte
        auszuliefern.
      </p>

      <p className={styles.paragraph}>
        Anbieter: Contentful GmbH, Max-Urich-Straße 3, 13355 Berlin,
        Deutschland.
      </p>

      <h2 className={styles.heading2}>6. Cookies und Einwilligung</h2>

      <p className={styles.paragraph}>
        Diese Website verwendet ein Cookie-Banner. Das Banner speichert, ob Sie
        optionale Cookies akzeptiert oder abgelehnt haben.
      </p>

      <p className={styles.paragraph}>
        Technisch notwendige Speicherung kann verwendet werden, um Ihre
        Cookie-Auswahl zu merken und grundlegende Website-Funktionen
        bereitzustellen. Optionale Analyse-Cookies werden nur nach Ihrer
        Einwilligung eingesetzt.
      </p>

      <h2 className={styles.heading2}>7. Google Analytics</h2>

      <p className={styles.paragraph}>
        Wenn Sie Cookies akzeptieren, nutzt diese Website Google Analytics.
        Damit möchten wir besser verstehen, wie Besucherinnen und Besucher die
        Website nutzen. Dies hilft uns, Rezepte, Zutaten-Seiten und die Struktur
        der Website zu verbessern.
      </p>

      <p className={styles.paragraph}>
        Google Analytics kann Informationen wie Seitenaufrufe, ungefähre
        Standortinformationen, Browserinformationen, Geräteinformationen und
        Interaktionsdaten verarbeiten. Google erklärt, dass Google Analytics
        keine einzelnen IP-Adressen von Nutzerinnen und Nutzern aus der EU, der
        Schweiz oder dem Vereinigten Königreich protokolliert oder speichert.
      </p>

      <p className={styles.paragraph}>
        Anbieter: Google Ireland Limited, Gordon House, Barrow Street, Dublin 4,
        Irland.
      </p>

      <p className={styles.paragraph}>
        Google Analytics wird nur nach Ihrer Einwilligung geladen.
        Rechtsgrundlage ist Art. 6 Abs. 1 lit. a DSGVO. Sie können die Analyse
        verhindern, indem Sie Cookies ablehnen, Cookies in Ihrem Browser löschen
        oder entsprechende Datenschutz-Einstellungen und Browser-Erweiterungen
        verwenden.
      </p>

      <p className={styles.paragraph}>
        Weitere Informationen zum Datenschutz bei Google finden Sie unter:{' '}
        <a
          href="https://policies.google.com/privacy"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.link}
        >
          https://policies.google.com/privacy
        </a>
      </p>

      <h2 className={styles.heading2}>8. Favoriten und Einkaufsliste</h2>

      <p className={styles.paragraph}>
        Wenn Sie Funktionen wie Favoriten oder eine Einkaufsliste nutzen, werden
        diese Daten lokal in Ihrem Browser auf Ihrem eigenen Gerät gespeichert.
        Diese Informationen sind nicht mit einem Benutzerkonto verbunden und
        werden nicht absichtlich an Hansik Young übermittelt.
      </p>

      <p className={styles.paragraph}>
        Sie können diese Daten entfernen, indem Sie die Browserdaten oder
        Website-Daten für diese Domain löschen.
      </p>

      <h2 className={styles.heading2}>9. Musik-Player</h2>

      <p className={styles.paragraph}>
        Diese Website enthält einen optionalen Musik-Player. Die Musik startet
        nicht automatisch. Sie wird nur abgespielt, wenn Sie den Musik-Button
        aktiv anklicken.
      </p>

      <p className={styles.paragraph}>
        Der Musik-Player erstellt kein Benutzerkonto und wird nicht verwendet,
        um Sie zu identifizieren.
      </p>

      <h2 className={styles.heading2}>10. Kommentarfunktion mit Disqus</h2>

      <p className={styles.paragraph}>
        Auf einigen Seiten kann eine Kommentarfunktion von Disqus eingebunden
        sein. Die Kommentare werden nicht automatisch für jede Nutzung der
        Website benötigt. Wenn Sie die Kommentarfunktion laden oder aktiv
        verwenden, können Daten an Disqus übertragen werden.
      </p>

      <p className={styles.paragraph}>
        Dabei können je nach Nutzung technische Daten, Browserinformationen,
        IP-Adresse, Cookies sowie die von Ihnen eingegebenen Kommentarinhalte
        verarbeitet werden. Wenn Sie sich bei Disqus anmelden oder über Disqus
        kommentieren, gelten zusätzlich die Datenschutzbestimmungen von Disqus.
      </p>

      <p className={styles.paragraph}>Anbieter: Disqus, Inc., USA.</p>

      <p className={styles.paragraph}>
        Weitere Informationen finden Sie in der Datenschutzerklärung von Disqus:{' '}
        <a
          href="https://help.disqus.com/en/articles/1717103-disqus-privacy-policy"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.link}
        >
          https://help.disqus.com/en/articles/1717103-disqus-privacy-policy
        </a>
      </p>

      <h2 className={styles.heading2}>11. Kontakt per E-Mail</h2>

      <p className={styles.paragraph}>
        Wenn Sie uns per E-Mail kontaktieren, verarbeiten wir die von Ihnen
        übermittelten Informationen, zum Beispiel Ihre E-Mail-Adresse, Ihre
        Nachricht und freiwillig angegebene weitere Informationen.
      </p>

      <p className={styles.paragraph}>
        Diese Daten verwenden wir nur, um Ihre Nachricht zu beantworten,
        Feedback zu bearbeiten, mögliche Fehler zu korrigieren oder Fragen zu
        beantworten. Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO und, soweit
        anwendbar, Art. 6 Abs. 1 lit. b DSGVO.
      </p>

      <h2 className={styles.heading2}>12. Externe Links</h2>

      <p className={styles.paragraph}>
        Diese Website kann Links zu externen Websites enthalten, zum Beispiel zu
        anderen Projekten von Joan oder zu Social-Media-Seiten. Wenn Sie einen
        externen Link anklicken, gilt die Datenschutzerklärung der jeweiligen
        externen Website.
      </p>

      <h2 className={styles.heading2}>13. Speicherdauer</h2>

      <p className={styles.paragraph}>
        Personenbezogene Daten werden nur so lange gespeichert, wie dies für die
        in dieser Datenschutzerklärung genannten Zwecke erforderlich ist oder
        gesetzliche Aufbewahrungspflichten bestehen.
      </p>

      <p className={styles.paragraph}>
        E-Mail-Nachrichten können so lange aufbewahrt werden, wie dies für die
        Bearbeitung der Anfrage und eine angemessene Dokumentation erforderlich
        ist. Technische Protokolldaten werden in der Regel nur für einen
        begrenzten Zeitraum durch Hosting- und Dienstanbieter gespeichert.
      </p>

      <h2 className={styles.heading2}>14. Ihre Rechte</h2>

      <p className={styles.paragraph}>
        Nach der DSGVO können Ihnen insbesondere folgende Rechte zustehen:
      </p>

      <ul className={styles.list}>
        <li>Recht auf Auskunft</li>
        <li>Recht auf Berichtigung</li>
        <li>Recht auf Löschung</li>
        <li>Recht auf Einschränkung der Verarbeitung</li>
        <li>Recht auf Datenübertragbarkeit</li>
        <li>Recht auf Widerspruch gegen die Verarbeitung</li>
        <li>
          Recht auf Widerruf einer Einwilligung mit Wirkung für die Zukunft
        </li>
        <li>Recht auf Beschwerde bei einer Datenschutzaufsichtsbehörde</li>
      </ul>

      <p className={styles.paragraph}>
        Zur Ausübung Ihrer Rechte können Sie uns per E-Mail kontaktieren:
      </p>

      <p className={styles.paragraph}>
        <a href="mailto:joan.korean.rezepte@gmail.com" className={styles.link}>
          joan.korean.rezepte@gmail.com
        </a>
      </p>

      <h2 className={styles.heading2}>15. Kinder</h2>

      <p className={styles.paragraph}>
        Diese Website richtet sich nicht gezielt an Kinder und erhebt nicht
        wissentlich personenbezogene Daten von Kindern.
      </p>

      <h2 className={styles.heading2}>
        16. Aktualität und Änderung dieser Datenschutzerklärung
      </h2>

      <p className={styles.paragraph}>
        Wir können diese Datenschutzerklärung von Zeit zu Zeit aktualisieren,
        zum Beispiel wenn sich die Website oder rechtliche Anforderungen ändern.
        Die jeweils aktuelle Version ist auf dieser Seite verfügbar.
      </p>
    </div>
  </>
);

export default Datenschutzerklaerung;
