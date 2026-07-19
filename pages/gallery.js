// pages/gallery.js
import { useEffect, useState } from 'react';
import client from '../lib/contentful';
import Image from 'next/image';
import styles from '../styles/Gallery.module.css';
import { useRouter } from 'next/router';
import { NextSeo } from 'next-seo';
import { getSeoUrls } from '../lib/siteUrls';

/* -----------------------------------------------------------
   1) STATIC CONTENTFUL FETCH (Gallery + Favorite Items)
----------------------------------------------------------- */
export async function getStaticProps({ locale }) {
  const lang = locale === 'de' ? 'de' : 'en';

  // ── Gallery items ─────────────────────────────
  const galleryRes = await client.getEntries({
    content_type: 'gallery',
    locale: lang,
    include: 2,
  });

  // ── Favorite items ────────────────────────────
  const favRes = await client.getEntries({
    content_type: 'favoriteItem',
    locale: lang,
    include: 1,
  });

  const galleryItems = galleryRes.items.map((it) => {
    const imgAsset =
      it.fields.bild && Array.isArray(it.fields.bild)
        ? it.fields.bild[0]
        : it.fields.bild;

    return {
      id: it.sys.id,
      title: it.fields.titel || it.fields.title || '',
      business: it.fields.businessName || '',
      address: typeof it.fields.location === 'string' ? it.fields.location : '',
      img: imgAsset ? `https:${imgAsset.fields.file.url}` : null,
    };
  });

  const favorites = favRes.items.map((it) => {
    const base = it.fields;

    const rawLinks = Array.isArray(base.links)
      ? base.links
      : base.link
        ? [base.link]
        : [];

    const links = rawLinks
      .filter((x) => typeof x === 'string' && x.trim() !== '')
      .map((x) => x.trim());

    return {
      id: it.sys.id,
      title: base.title || '',
      memo: base.memo || '',
      links,
      image: base.image?.fields?.file?.url
        ? `https:${base.image.fields.file.url}`
        : null,
    };
  });

  return {
    props: { galleryItems, favorites },
    revalidate: 60 * 60 * 12,
  };
}

/* -----------------------------------------------------------
   2) PAGE COMPONENT
----------------------------------------------------------- */
export default function Gallery({ galleryItems, favorites }) {
  const router = useRouter();
  const isDE = router.locale === 'de';
  const lang = isDE ? 'de' : 'en';
  const seoUrls = getSeoUrls({ locale: lang, path: '/gallery' });
  const canonicalUrl = seoUrls.canonicalUrl;

  const seo = isDE
    ? {
        title: 'Favoriten & Einkaufsliste | Hansik Young',
        description:
          'Meine persönliche Einkaufsliste für koreanische Zutaten, Produkte und Küchenbasics in Deutschland – plus kleine Fotos aus meiner Küche.',
      }
    : {
        title: 'Favorites & Shopping List | Hansik Young',
        description:
          'My personal shopping list for Korean ingredients, products, and kitchen basics in Germany — plus small photos from my everyday kitchen.',
      };

  /* -----------------------------------------------------------
     Favorite Links Checker
  ----------------------------------------------------------- */
  const [validLinks, setValidLinks] = useState({});

  useEffect(() => {
    const controller = new AbortController();

    favorites.forEach((favorite) => {
      (favorite.links || []).forEach((url, index) => {
        fetch(url, {
          method: 'HEAD',
          signal: controller.signal,
        })
          .then((response) => {
            const isAvailable =
              response.status !== 404 && response.status !== 410;

            setValidLinks((previous) => ({
              ...previous,
              [favorite.id]: {
                ...(previous[favorite.id] || {}),
                [index]: isAvailable,
              },
            }));
          })
          .catch((error) => {
            if (error.name === 'AbortError') return;

            setValidLinks((previous) => ({
              ...previous,
              [favorite.id]: {
                ...(previous[favorite.id] || {}),
                [index]: true,
              },
            }));
          });
      });
    });

    return () => controller.abort();
  }, [favorites]);

  /* -----------------------------------------------------------
     3) RENDER
  ----------------------------------------------------------- */
  return (
    <>
      <NextSeo
        title={seo.title}
        description={seo.description}
        canonical={canonicalUrl}
        languageAlternates={[
          {
            hrefLang: 'de',
            href: seoUrls.alternateUrls.de,
          },
          {
            hrefLang: 'en',
            href: seoUrls.alternateUrls.en,
          },
        ]}
        openGraph={{
          url: canonicalUrl,
          title: seo.title,
          description: seo.description,
        }}
      />

      <main className={styles.container}>
        <header className={styles.pageHero}>
          <p className={styles.heroEyebrow}>
            {isDE ? 'Persönliche Notizen' : 'Personal notes'}
          </p>
          <h1 className={styles.title}>{isDE ? 'Favoriten' : 'Favorites'}</h1>
          <p className={styles.heroText}>
            {isDE
              ? 'Meine persönliche Einkaufsliste und kleine Küchennotizen — Produkte, Zutaten und Fotos, die ich im Alltag wirklich benutze oder festhalten möchte.'
              : 'My personal shopping list and small kitchen notes — products, ingredients, and photos I actually use or want to remember.'}
          </p>
        </header>

        {/* A. FAVORITES */}
        <section className={styles.section}>
          <h2 className={styles.subtitle}>
            {isDE ? 'Meine Einkaufsliste' : 'My Shopping List'}
          </h2>

          <p className={styles.notice}>
            {isDE
              ? '※ Hinweis: Diese Links sind keine Werbung oder Affiliate-Links. Das ist meine persönliche Einkaufsliste mit Produkten, die ich im Alltag oft verwende.'
              : '※ Note: These links are not ads or affiliate links — this is my personal shopping list with products I often use in daily life.'}
          </p>

          <div className={styles.memoGrid}>
            {favorites.map((f, idx) => {
              const colorClass =
                idx % 3 === 0
                  ? styles.memoYellow
                  : idx % 3 === 1
                    ? styles.memoPink
                    : styles.memoBlue;

              const liveLinks = (f.links || []).filter((_, linkIdx) => {
                const status = validLinks[f.id]?.[linkIdx];
                return status !== false;
              });

              return (
                <article
                  key={f.id}
                  className={`${styles.memoCard} ${colorClass}`}
                >
                  {f.image && (
                    <div className={styles.memoImageWrap}>
                      <Image
                        src={f.image}
                        alt={f.title}
                        fill
                        className={styles.memoImage}
                      />
                    </div>
                  )}

                  <div className={styles.memoContent}>
                    <h3>{f.title}</h3>
                    {f.memo && <p className={styles.memoText}>{f.memo}</p>}

                    {liveLinks.length > 0 && (
                      <ul className={styles.memoLinksList}>
                        {liveLinks.map((url, linkIdx) => (
                          <li key={url}>
                            <a
                              href={url}
                              target="_blank"
                              rel="noreferrer"
                              className={styles.memoLink}
                            >
                              {isDE
                                ? `Link ${linkIdx + 1}`
                                : `Link ${linkIdx + 1}`}
                            </a>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        {/* B. GALLERY (Polaroid style) */}
        <section className={styles.section}>
          <h2 className={styles.subtitle}>
            {isDE ? 'Aus meiner Küche' : 'From My Kitchen'}
          </h2>

          <p className={styles.notice}>
            {isDE
              ? 'Kleine Fotos und Notizen aus meinem Alltag — selbst gekocht, ausprobiert oder für später festgehalten.'
              : 'Small photos and notes from my everyday kitchen — cooked, tested, or saved for later.'}
          </p>

          <div className={styles.grid}>
            {galleryItems.map((g) => (
              <article key={g.id} className={styles.polaroidCard}>
                {g.img && (
                  <div className={styles.polaroidImgWrap}>
                    <Image
                      src={g.img}
                      alt={g.title}
                      fill
                      className={styles.polaroidImg}
                    />
                  </div>
                )}

                <div className={styles.polaroidCaption}>
                  <h3>{g.title}</h3>
                  {g.business && <p>{g.business}</p>}
                  {g.address && <p>{g.address}</p>}
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
