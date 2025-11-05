// pages/gallery.js
import { useEffect, useState } from 'react';
import client from '../lib/contentful';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import styles from '../styles/Gallery.module.css';
import { useRouter } from 'next/router';
import { reverseGeocode } from '../lib/geocode';

/** ─────────────────────────────────────────
 *  1) Contentful → Static-generation
 *  ───────────────────────────────────────── */
export async function getStaticProps({ locale }) {
  const lang = locale === 'de' ? 'de' : 'en';

  const { items, includes } = await client.getEntries({
    content_type: 'gallery',
    locale: lang,
    include: 2,
  });

  const assets = {};
  includes?.Asset?.forEach((a) => (assets[a.sys.id] = a));

  const galleryItems = await Promise.all(
    items.map(async (it) => {
      const picRef = Array.isArray(it.fields.bild)
        ? it.fields.bild[0]
        : it.fields.bild;
      const img = picRef
        ? `https:${assets[picRef.sys.id].fields.file.url}`
        : null;

      /* 주소는 실패해도 무시 */
      let address = null;
      const loc = it.fields.location;
      if (loc && typeof loc === 'object' && loc.lat && loc.lon) {
        try {
          address = await reverseGeocode(loc.lat, loc.lon);
        } catch {
          address = null;
        }
      } else if (typeof loc === 'string') {
        address = loc;
      }

      return {
        id: it.sys.id,
        title: it.fields.titel || 'Untitled',
        business: it.fields.businessName || null,
        address,
        img,
        /** ★ 퍼머링크만 저장해 두면 됩니다 */
        instagramUrl: it.fields.instagramUrl || null,
      };
    })
  );

  return { props: { galleryItems }, revalidate: 60 };
}

/** 2) Instagram embed 컴포넌트 (CSR 전용) */
const InstagramEmbed = dynamic(
  () => import('../components/InstagramEmbed'), // 앞서 만든 컴포넌트
  { ssr: false }
);

/** 3) 페이지 ─────────────────────────────── */
export default function Gallery({ galleryItems }) {
  const t = useRouter().locale === 'de'; // 간단 다국어 플래그
  const [unsplash, setUnsplash] = useState([]);

  /* Unsplash  – 서버 없이 fetch */
  useEffect(() => {
    fetch('/api/unsplash?query=korean%20food&count=12')
      .then((r) => r.json())
      .then(setUnsplash)
      .catch(() => {});
  }, []);

  return (
    <main className={styles.container}>
      <h1 className={styles.title}>{t ? 'Galerie' : 'Gallery'}</h1>

      {/* ───── ① Instagram 영역 ───── */}
      <section className={styles.section}>
        <div className={styles.grid}>
          {galleryItems
            .filter((g) => g.instagramUrl)
            .map((g) => (
              <InstagramEmbed key={g.id} url={g.instagramUrl} />
            ))}
        </div>
      </section>

      {/* ───── ② Contentful 카드 ───── */}
      <section className={styles.section}>
        <div className={styles.grid}>
          {galleryItems
            .filter((g) => !g.instagramUrl && g.img)
            .map((g) => (
              <article key={g.id} className={styles.card}>
                <div className={styles.imgWrap}>
                  <Image
                    src={g.img}
                    alt={g.title}
                    fill
                    sizes="(max-width:768px) 100vw, 33vw"
                    className={styles.photo}
                  />
                </div>
                <header className={styles.caption}>
                  <h3>{g.title}</h3>
                  {g.business && <p>{g.business}</p>}
                  {g.address && <p>{g.address}</p>}
                </header>
              </article>
            ))}
        </div>
      </section>

      {/* ───── ③ Unsplash Masonry ───── */}
      {unsplash.length > 0 && (
        <section className={styles.section}>
          <div className={styles.grid}>
            {unsplash.map((p) => (
              <img
                key={p.id}
                src={p.urls.small}
                alt={p.alt_description || ''}
                className={styles.photo}
                loading="lazy"
              />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
