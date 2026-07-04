// pages/support.js

import Head from 'next/head';
import styles from '../styles/Support.module.css';
import Link from 'next/link';
import { useRouter } from 'next/router';
import ContactForm from '../components/ContactForm';

const Support = () => {
  const router = useRouter();
  const { locale } = router;
  const lang = locale === 'de' ? 'de' : 'en';

  const content = {
    en: {
      title: 'Support - Hansik Young',
      description:
        'Contact Hansik Young for questions, feedback, recipe corrections or website support.',
      h1: 'Support',
      subtitle:
        'Questions, corrections or feedback about Hansik Young? You can reach me here.',
      emailTitle: '📩 Contact',
      emailText:
        'If you notice a mistake in a recipe, have a question about an ingredient, or want to send feedback, you can contact me by email.',
      faqTitle: '💬 Frequently Asked Questions',
      faqs: [
        {
          question: 'How often are new recipes added?',
          answer:
            'New recipes are added slowly and personally. I add dishes when I have cooked, tested and written them down properly.',
        },
        {
          question: 'Can I suggest a correction?',
          answer:
            'Yes. If you find a typo, a broken link, or something unclear in a recipe, please send me a short message.',
        },
        {
          question: 'Do favorites and shopping lists need an account?',
          answer:
            'No. They are stored locally in your browser on your own device. Hansik Young does not offer user accounts.',
        },
        {
          question: 'Why is there music on the website?',
          answer:
            'The music is optional and only plays when you click the music button. It was made for Hansik Young as a small kitchen theme.',
        },
      ],
      responseTitle: '🕒 Response time',
      responseText:
        'This is a personal website, so replies may take a little time. I usually answer when I can.',
      linksTitle: '🔗 Useful links',
      privacyLabel: 'Privacy Policy',
      legalLabel: 'Impressum',
      aboutLabel: 'About Hansik Young',
      socialTitle: '📱 Social media',
      instagramLabel: 'Visit the Hansik Young Instagram page',
    },
    de: {
      title: 'Support - Hansik Young',
      description:
        'Kontakt zu Hansik Young für Fragen, Hinweise, Rezept-Korrekturen oder Feedback zur Website.',
      h1: 'Support',
      subtitle:
        'Fragen, Korrekturen oder Feedback zu Hansik Young? Hier kannst du mich erreichen.',
      emailTitle: '📩 Kontakt',
      emailText:
        'Wenn du einen Fehler in einem Rezept findest, eine Frage zu einer Zutat hast oder Feedback schicken möchtest, kannst du mir eine E-Mail schreiben.',
      faqTitle: '💬 Häufige Fragen',
      faqs: [
        {
          question: 'Wie oft kommen neue Rezepte dazu?',
          answer:
            'Neue Rezepte kommen langsam und persönlich dazu. Ich veröffentliche Gerichte, wenn ich sie wirklich gekocht, getestet und ordentlich aufgeschrieben habe.',
        },
        {
          question: 'Kann ich eine Korrektur vorschlagen?',
          answer:
            'Ja. Wenn du einen Tippfehler, einen kaputten Link oder eine unklare Stelle in einem Rezept findest, schreib mir gern kurz.',
        },
        {
          question:
            'Brauche ich ein Konto für Favoriten oder die Einkaufsliste?',
          answer:
            'Nein. Favoriten und Einkaufslisten werden lokal in deinem Browser auf deinem eigenen Gerät gespeichert. Hansik Young bietet keine Benutzerkonten an.',
        },
        {
          question: 'Warum gibt es Musik auf der Website?',
          answer:
            'Die Musik ist optional und startet nur, wenn du den Musik-Button anklickst. Ich habe sie als kleine Küchenmusik für Hansik Young gemacht.',
        },
      ],
      responseTitle: '🕒 Antwortzeit',
      responseText:
        'Hansik Young ist eine persönliche Website. Eine Antwort kann deshalb manchmal etwas dauern. Ich antworte, sobald ich kann.',
      linksTitle: '🔗 Nützliche Links',
      privacyLabel: 'Datenschutzerklärung',
      legalLabel: 'Impressum',
      aboutLabel: 'Über Hansik Young',
      socialTitle: '📱 Social Media',
      instagramLabel: 'Hansik Young auf Instagram besuchen',
    },
  };

  const t = content[lang];

  const privacyHref =
    lang === 'de' ? '/datenschutzerklaerung' : '/privacy-policy';

  const aboutHref = '/about-us';
  const impressumHref = '/impressum';

  return (
    <>
      <Head>
        <title>{t.title}</title>
        <meta name="description" content={t.description} />
      </Head>

      <div className={styles.container}>
        <h1 className={styles.title}>{t.h1}</h1>

        <p className={styles.subtitle}>{t.subtitle}</p>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>{t.emailTitle}</h2>
          <p className={styles.text}>{t.emailText}</p>

          <a
            href="mailto:joan.korean.rezepte@gmail.com"
            className={styles.email}
          >
            joan.korean.rezepte@gmail.com
          </a>

          <ContactForm />
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>{t.faqTitle}</h2>

          <div className={styles.faq}>
            {t.faqs.map((item) => (
              <div className={styles.faqItem} key={item.question}>
                <p className={styles.question}>{item.question}</p>
                <p className={styles.answer}>→ {item.answer}</p>
              </div>
            ))}
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>{t.responseTitle}</h2>
          <p className={styles.text}>{t.responseText}</p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>{t.linksTitle}</h2>

          <ul className={styles.links}>
            <li>
              <Link href={privacyHref} className={styles.link}>
                {t.privacyLabel}
              </Link>
            </li>
            <li>
              <Link href={impressumHref} className={styles.link}>
                {t.legalLabel}
              </Link>
            </li>
            <li>
              <Link href={aboutHref} className={styles.link}>
                {t.aboutLabel}
              </Link>
            </li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>{t.socialTitle}</h2>

          <div className={styles.socialMedia}>
            <a
              href="https://www.instagram.com/germanhansik"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.socialLink}
              aria-label={t.instagramLabel}
              title={t.instagramLabel}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                fill="currentColor"
                className={styles.icon}
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.366.062 2.633.334 3.608 1.31.975.975 1.248 2.242 1.31 3.608.058 1.266.07 1.646.07 4.85s-.012 3.584-.07 4.85c-.062 1.366-.335 2.633-1.31 3.608-.975.975-2.242 1.248-3.608 1.31-1.266.058-1.646.07-4.85.07s-3.584-.012-4.85-.07c-1.366-.062-2.633-.335-3.608-1.31-.975-.975-1.248-2.242-1.31-3.608C2.175 15.747 2.163 15.367 2.163 12s.012-3.584.07-4.85c.062-1.366.335-2.633 1.31-3.608C4.53 2.497 5.797 2.224 7.163 2.163 8.429 2.105 8.809 2.093 12 2.093m0-2.163C8.741 0 8.332.014 7.052.072 5.772.129 4.672.383 3.734 1.321 2.796 2.26 2.542 3.36 2.485 4.64 2.427 5.92 2.413 6.329 2.413 12s.014 6.08.072 7.36c.057 1.28.311 2.38 1.249 3.318.938.938 2.038 1.192 3.318 1.249 1.28.058 1.689.072 7.36.072s6.08-.014 7.36-.072c1.28-.057 2.38-.311 3.318-1.249.938-.938 1.192-2.038 1.249-3.318.058-1.28.072-1.689.072-7.36s-.014-6.08-.072-7.36c-.057-1.28-.311-2.38-1.249-3.318C19.38.383 18.28.129 17 .072 15.72.014 15.31 0 12 0z" />
                <path d="M12 5.838a6.162 6.162 0 1 0 0 12.324A6.162 6.162 0 0 0 12 5.838zm0 10.162a4 4 0 1 1 0-8 4 4 0 0 1 0 8z" />
                <circle cx="18.406" cy="5.594" r="1.44" />
              </svg>
            </a>
          </div>
        </section>
      </div>
    </>
  );
};

export default Support;
