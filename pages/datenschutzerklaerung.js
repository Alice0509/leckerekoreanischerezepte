// pages/datenschutzerklaerung.js

import Head from 'next/head';
import styles from '../styles/Datenschutzerklaerung.module.css';

const Datenschutzerklaerung = () => (
  <>
    <Head>
      <title>
        Datenschutzerklärung - Leckere Koreanische Rezepte &amp;
        HansikYoungRecipes
      </title>
      <meta
        name="description"
        content="Lesen Sie unsere Datenschutzerklärung, um zu verstehen, wie wir Ihre persönlichen Daten bei Leckere Koreanische Rezepte und HansikYoungRecipes verarbeiten."
      />
    </Head>
    <div className={styles.container}>
      <h1 className={styles.heading1}>Datenschutzerklärung</h1>
      <p className={styles.paragraph}>
        Zuletzt aktualisiert: 16. Dezember 2024
      </p>

      {/* Abschnitt 1: Verantwortlicher */}
      <h2 className={styles.heading2}>1. Verantwortlicher</h2>
      <p className={styles.paragraph}>
        Verantwortlich für die Datenverarbeitung auf dieser Website ist:
      </p>
      <p className={styles.paragraph}>
        [Soojin Lee]
        <br />
        [Pentenrieder Str.30]
        <br />
        [82152 Krailling]
        <br />
        [joan.korean.rezepte@gmail.com]
      </p>
      <p className={styles.paragraph}>
        Bei Fragen zum Datenschutz wenden Sie sich bitte an die oben genannte
        Adresse.
      </p>

      {/* Abschnitt 2: Erhebung und Speicherung personenbezogener Daten sowie Art und Zweck von deren Verwendung */}
      <h2 className={styles.heading2}>
        2. Erhebung und Speicherung personenbezogener Daten sowie Art und Zweck
        von deren Verwendung
      </h2>

      {/* Unterabschnitt a: Server-Logfiles */}
      <h3 className={styles.heading3}>a) Server-Logfiles</h3>
      <p className={styles.paragraph}>
        Bei jedem Zugriff auf diese Website werden automatisch Informationen
        erfasst, die Ihr Browser automatisch übermittelt. Dazu gehören in der
        Regel:
      </p>
      <ul className={styles.list}>
        <li>IP-Adresse (anonymisiert, sofern technisch möglich)</li>
        <li>Datum und Uhrzeit des Zugriffs</li>
        <li>Name und URL der abgerufenen Datei</li>
        <li>Referrer-URL (die zuvor besuchte Seite)</li>
        <li>
          Verwendeter Browser, Betriebssystem sowie der Name Ihres
          Access-Providers
        </li>
      </ul>
      <p className={styles.paragraph}>
        Diese Daten werden ausschließlich zum Zweck der technischen
        Bereitstellung, Sicherheit und Stabilität des Webangebots erhoben (Art.
        6 Abs. 1 lit. f DSGVO).
      </p>

      {/* Unterabschnitt b: Cookies */}
      <h3 className={styles.heading3}>b) Cookies</h3>
      <p className={styles.paragraph}>
        Diese Website verwendet Cookies, um bestimmte Funktionen bereitzustellen
        und die Benutzerfreundlichkeit zu verbessern.
      </p>
      <p className={styles.paragraph}>
        Technisch notwendige Cookies werden aufgrund unseres berechtigten
        Interesses (Art. 6 Abs. 1 lit. f DSGVO) gesetzt.
      </p>
      <p className={styles.paragraph}>
        Soweit wir nicht-technisch notwendige Cookies (z. B. für Analysezwecke)
        nutzen, erfolgt dies nur auf Grundlage Ihrer Einwilligung (Art. 6 Abs. 1
        lit. a DSGVO). Sie können Ihre Einwilligung jederzeit über unsere
        Cookie-Einstellungen widerrufen.
      </p>

      {/* Abschnitt 3: Verwendung von Google Analytics */}
      <h2 className={styles.heading2}>3. Verwendung von Google Analytics</h2>
      <p className={styles.paragraph}>
        Diese Website nutzt Google Analytics, einen Webanalysedienst der Google
        Ireland Limited (&quot;Google&quot;), Gordon House, Barrow Street,
        Dublin 4, Irland.
      </p>
      <p className={styles.paragraph}>
        Google Analytics verwendet Cookies, die eine Analyse Ihrer Benutzung der
        Website ermöglichen. Die durch das Cookie erzeugten Informationen (inkl.
        Ihrer gekürzten IP-Adresse) werden in der Regel an einen Server von
        Google in den USA übertragen und dort gespeichert.
      </p>
      <p className={styles.paragraph}>
        Wir haben die IP-Anonymisierung aktiviert, sodass Ihre IP-Adresse
        innerhalb der EU/EWR gekürzt wird.
      </p>
      <p className={styles.paragraph}>
        Rechtsgrundlage ist Ihre Einwilligung (Art. 6 Abs. 1 lit. a DSGVO). Sie
        können diese jederzeit über die Cookie-Einstellungen widerrufen.
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

      {/* Abschnitt 4: Verwendung von Disqus (Kommentar-Funktion) */}
      <h2 className={styles.heading2}>
        4. Verwendung von Disqus (Kommentar-Funktion)
      </h2>
      <p className={styles.paragraph}>
        Wir verwenden auf dieser Website die Kommentarfunktion des Dienstes
        Disqus, bereitgestellt von Disqus, Inc., 717 Market St, San Francisco,
        CA 94103, USA.
      </p>

      <h3 className={styles.heading3}>Art der erhobenen Daten:</h3>
      <p className={styles.paragraph}>
        Wenn Sie einen Kommentar über Disqus hinterlassen, werden in der Regel
        Ihr eingegebener Name oder Nutzername, Ihre E-Mail-Adresse, Ihre
        IP-Adresse sowie der Inhalt des Kommentars verarbeitet. Disqus kann
        zudem Cookies setzen und weitere technische Informationen über Ihr
        Gerät, Browser etc. erfassen.
      </p>

      <h3 className={styles.heading3}>Zweck der Datenverarbeitung:</h3>
      <p className={styles.paragraph}>
        Die Daten werden erhoben, um die Kommentarfunktion bereitzustellen, Spam
        und Missbrauch zu verhindern sowie die Interaktion mit den Nutzern zu
        ermöglichen.
      </p>

      <h3 className={styles.heading3}>Rechtsgrundlage:</h3>
      <p className={styles.paragraph}>
        Die Verarbeitung erfolgt auf Grundlage Ihrer Einwilligung (Art. 6 Abs. 1
        lit. a DSGVO), die Sie durch die aktive Nutzung der Kommentarfunktion
        erteilen.
      </p>
      <p className={styles.paragraph}>
        Sie können Ihre Einwilligung jederzeit widerrufen, indem Sie keine
        weiteren Kommentare mehr abgeben und bestehende Cookies in Ihrem Browser
        löschen. Die bereits erfolgte Verarbeitung bleibt hiervon unberührt.
      </p>

      <h3 className={styles.heading3}>Datenübermittlung in Drittländer:</h3>
      <p className={styles.paragraph}>
        Die Daten können an Server von Disqus in den USA übertragen werden. Wir
        weisen darauf hin, dass in den USA eventuell kein mit der EU
        vergleichbares Datenschutzniveau besteht. Disqus erklärt, dass es
        angemessene Schutzmaßnahmen (z. B. Standardvertragsklauseln) trifft.
        Weitere Informationen hierzu finden Sie in der Datenschutzerklärung von
        Disqus:{' '}
        <a
          href="https://help.disqus.com/en/articles/1717103-disqus-privacy-policy"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.link}
        >
          https://help.disqus.com/en/articles/1717103-disqus-privacy-policy
        </a>
      </p>

      <h3 className={styles.heading3}>Speicherdauer:</h3>
      <p className={styles.paragraph}>
        Die Daten werden so lange gespeichert, wie dies für den Zweck der
        Bereitstellung der Kommentar-Funktion erforderlich ist oder gesetzliche
        Aufbewahrungsfristen bestehen.
      </p>

      {/* Abschnitt 5: Empfänger von Daten */}
      <h2 className={styles.heading2}>5. Empfänger von Daten</h2>
      <p className={styles.paragraph}>
        Eine Übermittlung Ihrer personenbezogenen Daten an Dritte erfolgt nur,
        wenn
      </p>
      <ul className={styles.list}>
        <li>
          Sie Ihre ausdrückliche Einwilligung erteilt haben (Art. 6 Abs. 1 lit.
          a DSGVO),
        </li>
        <li>
          dies zur Erfüllung eines Vertrags mit Ihnen erforderlich ist (Art. 6
          Abs. 1 lit. b DSGVO),
        </li>
        <li>
          eine rechtliche Verpflichtung besteht (Art. 6 Abs. 1 lit. c DSGVO),
          oder
        </li>
        <li>
          ein berechtigtes Interesse unsererseits besteht und kein überwiegendes
          schutzwürdiges Interesse Ihrerseits entgegensteht (Art. 6 Abs. 1 lit.
          f DSGVO).
        </li>
      </ul>

      {/* Abschnitt 6: Speicherdauer */}
      <h2 className={styles.heading2}>6. Speicherdauer</h2>
      <p className={styles.paragraph}>
        Personenbezogene Daten werden nur so lange gespeichert, wie es für die
        genannten Zwecke erforderlich ist, es sei denn, gesetzliche
        Aufbewahrungsfristen stehen einer Löschung entgegen.
      </p>

      {/* Abschnitt 7: Rechte der betroffenen Personen */}
      <h2 className={styles.heading2}>7. Rechte der betroffenen Personen</h2>
      <p className={styles.paragraph}>Sie haben das Recht:</p>
      <ul className={styles.list}>
        <li>
          gemäß Art. 15 DSGVO Auskunft über Ihre bei uns verarbeiteten
          personenbezogenen Daten zu verlangen,
        </li>
        <li>
          gemäß Art. 16 DSGVO unverzüglich die Berichtigung unrichtiger
          personenbezogener Daten zu verlangen,
        </li>
        <li>
          gemäß Art. 17 DSGVO die Löschung Ihrer bei uns gespeicherten
          personenbezogenen Daten zu verlangen, sofern keine gesetzlichen
          Aufbewahrungsfristen oder andere legitime Gründe dagegen sprechen,
        </li>
        <li>
          gemäß Art. 18 DSGVO die Einschränkung der Verarbeitung Ihrer
          personenbezogenen Daten zu verlangen,
        </li>
        <li>
          gemäß Art. 20 DSGVO Ihre personenbezogenen Daten in einem
          strukturierten, gängigen und maschinenlesbaren Format zu erhalten,
        </li>
        <li>
          gemäß Art. 21 DSGVO Widerspruch gegen die Verarbeitung einzulegen,
          sofern diese auf Art. 6 Abs. 1 lit. f DSGVO beruht,
        </li>
        <li>
          gemäß Art. 7 Abs. 3 DSGVO Ihre einmal erteilte Einwilligung jederzeit
          mit Wirkung für die Zukunft zu widerrufen,
        </li>
        <li>
          gemäß Art. 77 DSGVO bei einer Aufsichtsbehörde Beschwerde
          einzureichen, wenn Sie der Ansicht sind, dass die Verarbeitung Ihrer
          personenbezogenen Daten rechtswidrig erfolgt.
        </li>
      </ul>

      {/* Abschnitt 8: Aktualität und Änderung dieser Datenschutzerklärung */}
      <h2 className={styles.heading2}>
        8. Aktualität und Änderung dieser Datenschutzerklärung
      </h2>
      <p className={styles.paragraph}>
        Diese Datenschutzerklärung ist aktuell gültig und hat den Stand [Datum
        einfügen]. Durch technische Weiterentwicklungen oder gesetzliche
        Änderungen kann es notwendig werden, diese Datenschutzerklärung
        anzupassen. Die jeweils aktuelle Fassung kann jederzeit auf unserer
        Website abgerufen und ausgedruckt werden.
      </p>
    </div>
  </>
);

export default Datenschutzerklaerung;
