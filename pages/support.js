// pages/support.js

import Head from 'next/head';
import styles from '../styles/Support.module.css';
import Link from 'next/link';
import ContactForm from '../components/ContactForm';

const Support = () => {
  return (
    <>
      <Head>
        <title>Support - Delicious Korean Recipes</title>
        <meta
          name="description"
          content="Get assistance with Delicious Korean Recipes app."
        />
      </Head>
      <div className={styles.container}>
        <h1 className={styles.title}>Support</h1>
        <p className={styles.subtitle}>
          We’re here to help you with any questions or issues related to the
          Delicious Korean Recipes app!
        </p>

        {/* 📩 Email Support */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>📩 Email Support</h2>
          <p className={styles.text}>
            Have any issues? Reach out to us via email:
          </p>
          <a
            href="mailto:joan.korean.rezepte@gmail.com"
            className={styles.email}
          >
            joan.korean.rezepte@gmail.com
          </a>
          {/* 문의 폼 추가 */}
          <ContactForm />
        </section>

        {/* 💬 Frequently Asked Questions */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>💬 Frequently Asked Questions</h2>
          <div className={styles.faq}>
            <div className={styles.faqItem}>
              <p className={styles.question}>
                How often are new recipes added?
              </p>
              <p className={styles.answer}>→ New recipes are added weekly!</p>
            </div>
            <div className={styles.faqItem}>
              <p className={styles.question}>Which devices are supported?</p>
              <p className={styles.answer}>
                → The app is available on both iOS and Android devices.
              </p>
            </div>
            {/* 추가 FAQ 항목을 여기에 추가할 수 있습니다 */}
          </div>
          {/*  <Link href="/faq" className={styles.viewAll}>
            View All FAQs
          </Link>*/}
        </section>

        {/* 🕒 Support Hours */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>🕒 Support Hours</h2>
          <p className={styles.text}>
            We respond to inquiries from Monday to Friday, 9 AM to 6 PM (CET).
          </p>
        </section>

        {/* 🔗 Useful Links */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>🔗 Useful Links</h2>
          <ul className={styles.links}>
            <li>
              <Link href="/privacy-policy" className={styles.link}>
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link href="/imprint" className={styles.link}>
                Imprint
              </Link>
            </li>
            {/* 추가 리소스 링크를 여기에 추가할 수 있습니다 */}
          </ul>
        </section>

        {/* 💡 Report an Issue */}
        {/*  <section className={styles.section}>
          <h2 className={styles.sectionTitle}>💡 Report an Issue</h2>
          <p className={styles.text}>
            If you encounter any errors while using the app, please report them
            using the link below.
          </p>
          <Link href="/report-issue" className={styles.reportLink}>
            Report an Issue
          </Link>
        </section> */}

        {/* 📱 Social Media */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>📱 Social Media</h2>
          <div className={styles.socialMedia}>
            <a
              href="https://www.instagram.com/germanhansik"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.socialLink}
              aria-label="Visit our Instagram page"
            >
              {/* Instagram 아이콘 사용 */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                fill="currentColor"
                className={styles.icon}
                viewBox="0 0 24 24"
              >
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.366.062 2.633.334 3.608 1.31.975.975 1.248 2.242 1.31 3.608.058 1.266.07 1.646.07 4.85s-.012 3.584-.07 4.85c-.062 1.366-.335 2.633-1.31 3.608-.975.975-2.242 1.248-3.608 1.31-1.266.058-1.646.07-4.85.07s-3.584-.012-4.85-.07c-1.366-.062-2.633-.335-3.608-1.31-.975-.975-1.248-2.242-1.31-3.608C2.175 15.747 2.163 15.367 2.163 12s.012-3.584.07-4.85c.062-1.366.335-2.633 1.31-3.608C4.53 2.497 5.797 2.224 7.163 2.163 8.429 2.105 8.809 2.093 12 2.093m0-2.163C8.741 0 8.332.014 7.052.072 5.772.129 4.672.383 3.734 1.321 2.796 2.26 2.542 3.36 2.485 4.64 2.427 5.92 2.413 6.329 2.413 12s.014 6.08.072 7.36c.057 1.28.311 2.38 1.249 3.318.938.938 2.038 1.192 3.318 1.249 1.28.058 1.689.072 7.36.072s6.08-.014 7.36-.072c1.28-.057 2.38-.311 3.318-1.249.938-.938 1.192-2.038 1.249-3.318.058-1.28.072-1.689.072-7.36s-.014-6.08-.072-7.36c-.057-1.28-.311-2.38-1.249-3.318C19.38.383 18.28.129 17 .072 15.72.014 15.31 0 12 0z" />
                <path d="M12 5.838a6.162 6.162 0 1 0 0 12.324A6.162 6.162 0 0 0 12 5.838zm0 10.162a4 4 0 1 1 0-8 4 4 0 0 1 0 8z" />
                <circle cx="18.406" cy="5.594" r="1.44" />
              </svg>
            </a>
            {/* 다른 소셜 미디어 아이콘도 여기에 추가할 수 있습니다 */}
          </div>
        </section>
      </div>
    </>
  );
};

export default Support;
