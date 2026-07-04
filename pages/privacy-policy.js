// pages/privacy-policy.js

import Head from 'next/head';
import styles from '../styles/PrivacyPolicy.module.css';

const PrivacyPolicy = () => (
  <>
    <Head>
      <title>Privacy Policy - Hansik Young</title>
      <meta
        name="description"
        content="Privacy Policy for Hansik Young, a Korean home cooking website with recipes, ingredient notes and kitchen basics for people in Germany."
      />
    </Head>

    <div className={styles.container}>
      <h1 className={styles.heading1}>Privacy Policy</h1>

      <p className={styles.paragraph}>Last updated: June 27, 2026</p>

      <p className={styles.paragraph}>
        This Privacy Policy explains how Hansik Young collects and uses
        information when you visit this website.
      </p>

      <p className={styles.paragraph}>
        Hansik Young is a personal Korean home cooking website with recipes,
        ingredient notes and kitchen basics for people cooking Korean food in
        Germany.
      </p>

      <h2 className={styles.heading2}>Responsible person</h2>

      <p className={styles.paragraph}>Responsible for this website:</p>

      <p className={styles.paragraph}>
        Joan von Hansik Young
        <br />
        Email:{' '}
        <a href="mailto:joan.korean.rezepte@gmail.com" className={styles.link}>
          joan.korean.rezepte@gmail.com
        </a>
      </p>

      <h2 className={styles.heading2}>General use of this website</h2>

      <p className={styles.paragraph}>
        You can use this website without creating an account. Hansik Young does
        not offer user accounts, social login, user profiles or location-based
        features.
      </p>

      <p className={styles.paragraph}>
        We do not intentionally collect sensitive personal data through this
        website.
      </p>

      <h2 className={styles.heading2}>Access data and server logs</h2>

      <p className={styles.paragraph}>
        When you visit this website, technical data may be processed
        automatically so that the website can be delivered securely and
        correctly. This may include:
      </p>

      <ul className={styles.list}>
        <li>IP address</li>
        <li>Date and time of access</li>
        <li>Requested page or file</li>
        <li>Browser type and version</li>
        <li>Operating system</li>
        <li>Referrer URL</li>
        <li>Status codes and technical error information</li>
      </ul>

      <p className={styles.paragraph}>
        This processing is necessary to provide the website, maintain security
        and troubleshoot technical problems. The legal basis is our legitimate
        interest in operating a secure and functional website under Art. 6(1)(f)
        GDPR.
      </p>

      <h2 className={styles.heading2}>Hosting</h2>

      <p className={styles.paragraph}>
        This website is hosted by Vercel. Vercel may process technical access
        data and server log data in order to provide hosting, security and
        delivery of the website.
      </p>

      <p className={styles.paragraph}>
        Provider: Vercel Inc., 340 S Lemon Ave #4133, Walnut, CA 91789, USA.
      </p>

      <h2 className={styles.heading2}>Content management and media delivery</h2>

      <p className={styles.paragraph}>
        The recipes, ingredient texts and some media assets on this website are
        managed through Contentful. When pages or media files are loaded,
        Contentful may process technical request data in order to deliver this
        content.
      </p>

      <p className={styles.paragraph}>
        Provider: Contentful GmbH, Max-Urich-Straße 3, 13355 Berlin, Germany.
      </p>

      <h2 className={styles.heading2}>Cookies and consent</h2>

      <p className={styles.paragraph}>
        This website uses a cookie consent banner. The banner stores whether you
        accepted or declined optional cookies.
      </p>

      <p className={styles.paragraph}>
        Essential technical storage may be used to remember your cookie choice
        and to provide basic website functions. Optional analytics cookies are
        only used after you give consent.
      </p>

      <h2 className={styles.heading2}>Google Analytics</h2>

      <p className={styles.paragraph}>
        If you accept cookies, this website uses Google Analytics to understand
        how visitors use the website. This helps us improve recipes, ingredient
        pages and the general structure of the website.
      </p>

      <p className={styles.paragraph}>
        Google Analytics may process information such as page views, approximate
        location, browser information, device information and interaction data.
        Google states that Google Analytics does not log or store individual IP
        addresses from users in the EU, Switzerland or the UK.
      </p>

      <p className={styles.paragraph}>
        Provider: Google Ireland Limited, Gordon House, Barrow Street, Dublin 4,
        Ireland.
      </p>

      <p className={styles.paragraph}>
        Google Analytics is only loaded after your consent. The legal basis is
        Art. 6(1)(a) GDPR. You can prevent analytics tracking by declining
        cookies, deleting cookies in your browser or using browser privacy
        settings and extensions.
      </p>

      <h2 className={styles.heading2}>Favorites and shopping list</h2>

      <p className={styles.paragraph}>
        If you use features such as favorites or a shopping list, the data is
        stored locally in your browser on your own device. This information is
        not connected to a user account and is not intentionally sent to Hansik
        Young.
      </p>

      <p className={styles.paragraph}>
        You can remove this data by clearing your browser storage or website
        data for this domain.
      </p>

      <h2 className={styles.heading2}>Music player</h2>

      <p className={styles.paragraph}>
        This website includes an optional music player. The music does not start
        automatically. It only plays when you click the music button.
      </p>

      <p className={styles.paragraph}>
        The music player itself does not create a user account and is not used
        to identify you.
      </p>

      <h2 className={styles.heading2}>Contact by email</h2>

      <p className={styles.paragraph}>
        If you contact us by email, we process the information you send, such as
        your email address, your message and any information you voluntarily
        include.
      </p>

      <p className={styles.paragraph}>
        We use this data only to respond to your message, handle feedback,
        correct possible errors or answer questions. The legal basis is Art.
        6(1)(f) GDPR and, where applicable, Art. 6(1)(b) GDPR.
      </p>

      <h2 className={styles.heading2}>External links</h2>

      <p className={styles.paragraph}>
        This website may contain links to external websites, for example other
        projects by Joan or social media pages. If you click an external link,
        the privacy policy of the external website applies.
      </p>

      <h2 className={styles.heading2}>Data retention</h2>

      <p className={styles.paragraph}>
        We keep personal data only as long as necessary for the purposes
        described in this Privacy Policy or as required by law.
      </p>

      <p className={styles.paragraph}>
        Email messages may be kept as long as needed to handle the request and
        for reasonable documentation. Technical logs are generally kept only for
        a limited period by the hosting and service providers.
      </p>

      <h2 className={styles.heading2}>Your rights</h2>

      <p className={styles.paragraph}>
        Under the GDPR, you may have the following rights regarding your
        personal data:
      </p>

      <ul className={styles.list}>
        <li>Right of access</li>
        <li>Right to rectification</li>
        <li>Right to erasure</li>
        <li>Right to restriction of processing</li>
        <li>Right to data portability</li>
        <li>Right to object to processing</li>
        <li>Right to withdraw consent at any time</li>
        <li>Right to lodge a complaint with a data protection authority</li>
      </ul>

      <p className={styles.paragraph}>
        To exercise your rights, you can contact us by email:
      </p>

      <p className={styles.paragraph}>
        <a href="mailto:joan.korean.rezepte@gmail.com" className={styles.link}>
          joan.korean.rezepte@gmail.com
        </a>
      </p>

      <h2 className={styles.heading2}>Children</h2>

      <p className={styles.paragraph}>
        This website is not directed at children and does not knowingly collect
        personal data from children.
      </p>

      <h2 className={styles.heading2}>Changes to this Privacy Policy</h2>

      <p className={styles.paragraph}>
        We may update this Privacy Policy from time to time, for example when
        the website changes or when legal requirements change. The latest
        version is always available on this page.
      </p>

      <h2 className={styles.heading2}>Contact</h2>

      <p className={styles.paragraph}>
        If you have questions about this Privacy Policy, you can contact:
      </p>

      <p className={styles.paragraph}>
        <a href="mailto:joan.korean.rezepte@gmail.com" className={styles.link}>
          joan.korean.rezepte@gmail.com
        </a>
      </p>
    </div>
  </>
);

export default PrivacyPolicy;
