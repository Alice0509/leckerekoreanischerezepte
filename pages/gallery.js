// pages/gallery.js
import { useEffect, useState, useRef } from 'react';
import client from '../lib/contentful';
import Image from 'next/image';
import styles from '../styles/Gallery.module.css';
import { useRouter } from 'next/router';

/* -----------------------------------------------------------
   1) STATIC CONTENTFUL FETCH (Gallery + Favorite Items)
----------------------------------------------------------- */
export async function getStaticProps({ locale }) {
  const lang = locale === 'de' ? 'de' : 'en';

  // ── 기존 사진 갤러리 ─────────────────────────────
  const galleryRes = await client.getEntries({
    content_type: 'gallery',
    locale: lang,
    include: 2,
  });

  // ── 즐겨찾기 메모 아이템 ─────────────────────────
  const favRes = await client.getEntries({
    content_type: 'favoriteItem',
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

  /* --------------------------------------------------------
     FAVORITES (Localization OFF → 항상 전역 값만 가져오면 됨)
  -------------------------------------------------------- */
  const favorites = favRes.items.map((it) => {
    const base = it.fields;

    // ⚡ 여기서 100% 정확히 links 배열을 가져온다
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
    revalidate: 60,
  };
}

/* -----------------------------------------------------------
   2) PAGE COMPONENT
----------------------------------------------------------- */
export default function Gallery({ galleryItems, favorites }) {
  const router = useRouter();
  const isDE = router.locale === 'de';

  /* -----------------------------------------------------------
     Unsplash 자동 로딩 + 무한 스크롤
  ----------------------------------------------------------- */
  const [unsplash, setUnsplash] = useState([]);
  const [page, setPage] = useState(1);
  const loadMoreRef = useRef(null);

  // ---- Unsplash Fetch 수정 ----
  const fetchUnsplash = async (pageNum) => {
    try {
      const res = await fetch(
        `/api/unsplash?query=korean%20food&count=12&page=${pageNum}`
      );

      if (!res.ok) return;

      const data = await res.json();
      setUnsplash((prev) => [...prev, ...data]);
    } catch (e) {
      console.log('Unsplash fetch failed:', e);
    }
  };

  useEffect(() => {
    fetchUnsplash(page);
  }, [page]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setPage((prev) => prev + 1);
        }
      },
      { threshold: 1 }
    );

    if (loadMoreRef.current) observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, []);

  /* -----------------------------------------------------------
     Dead Link Checker (여러 구매처 중 죽은 링크 숨기기)
  ----------------------------------------------------------- */
  const [validLinks, setValidLinks] = useState({});

  useEffect(() => {
    favorites.forEach((f) => {
      (f.links || []).forEach((url, idx) => {
        if (validLinks[f.id] && validLinks[f.id][idx] !== undefined) return;

        fetch(url, { method: 'HEAD' })
          .then((r) => {
            // 400~499 중에서 "404,410" 등만 실제 죽은 링크로 처리
            const dead = r.status === 404 || r.status === 410;

            setValidLinks((prev) => ({
              ...prev,
              [f.id]: { ...(prev[f.id] || {}), [idx]: !dead },
            }));
          })
          .catch(() => {
            // 네트워크 오류일 때는 죽은 링크로 처리하지 않음(=살아있다고 처리)
            setValidLinks((prev) => ({
              ...prev,
              [f.id]: { ...(prev[f.id] || {}), [idx]: true },
            }));
          });
      });
    });
  }, [favorites]);

  /* -----------------------------------------------------------
     3) RENDER
  ----------------------------------------------------------- */
  return (
    <main className={styles.container}>
      {/* A. FAVORITES — Post-it */}
      <section className={styles.section}>
        <h2 className={styles.subtitle}>{isDE ? 'Favoriten' : 'Favorites'}</h2>

        <p className={styles.notice}>
          {isDE
            ? '※ Hinweis: Diese Links sind keine Werbung oder Affiliate-Links. Es sind einfach Produkte, die ich im Alltag oft verwende.'
            : '※ Note: These links are not ads or affiliate links – just products I personally use in daily life.'}
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
                              ? `Kaufoption ${linkIdx + 1}`
                              : `Buy option ${linkIdx + 1}`}
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

      {/* B. GALLERY — Polaroid style */}
      <section className={styles.section}>
        <h2 className={styles.subtitle}>{isDE ? 'Fotos' : 'Photos'}</h2>

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

      {/* C. UNSPLASH — Infinite scroll */}
      <section className={styles.section}>
        <h2 className={styles.subtitle}>Unsplash</h2>

        <div className={styles.grid}>
          {unsplash.map((p) => (
            <div key={p.id} className={styles.unsplashCard}>
              <img
                src={p.urls.small}
                alt={p.alt_description || ''}
                className={styles.unsplashImg}
                loading="lazy"
              />
            </div>
          ))}
        </div>

        <div ref={loadMoreRef} style={{ height: 40 }} />
      </section>
    </main>
  );
}
