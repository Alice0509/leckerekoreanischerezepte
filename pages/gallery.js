// pages/gallery.js
import React from 'react';
import client from '../lib/contentful';
import Image from 'next/image';
import styles from '../styles/Gallery.module.css';
import { useRouter } from 'next/router';
import { reverseGeocode } from '../lib/geocode'; // 올바르게 내보낸 함수 가져오기

// 로케일별 갤러리 데이터를 저장할 메모리 캐시 객체
const galleryCache = {};

export async function getStaticProps({ locale }) {
  try {
    const mappedLocale = locale === 'de' ? 'de' : 'en';

    // 캐시에 데이터가 있으면 API 호출 없이 반환
    if (galleryCache[mappedLocale]) {
      return {
        props: {
          galleryItems: galleryCache[mappedLocale],
        },
        revalidate: 60,
      };
    }

    const res = await client.getEntries({
      content_type: 'gallery',
      locale: mappedLocale,
      include: 5,
    });

    const assetsMap = {};
    res.includes.Asset?.forEach((asset) => {
      assetsMap[asset.sys.id] = asset;
    });

    const galleryItems = await Promise.all(
      res.items.map(async (item) => {
        let images = [];
        if (Array.isArray(item.fields.bild)) {
          images = item.fields.bild.map((img) => assetsMap[img.sys.id]);
        } else if (item.fields.bild) {
          images = [assetsMap[item.fields.bild.sys.id]];
        }

        let address = null;
        if (item.fields.location && typeof item.fields.location === 'object') {
          const { lat, lon } = item.fields.location;
          if (lat && lon) {
            try {
              address = await reverseGeocode(lat, lon);
            } catch (geoError) {
              console.error(
                `Reverse geocoding failed for item ID ${item.sys.id}:`,
                geoError
              );
              address = 'Unable to determine address';
            }
          }
        } else if (typeof item.fields.location === 'string') {
          address = item.fields.location;
        }

        return {
          id: item.sys.id,
          titel:
            item.fields.titel ||
            (mappedLocale === 'de' ? 'Galerie Titel' : 'Gallery Title'),
          businessName: item.fields.businessName || null,
          location: address,
          bild: images.length > 0 ? `https:${images[0].fields.file.url}` : null,
        };
      })
    );

    // 가져온 갤러리 데이터를 캐시에 저장
    galleryCache[mappedLocale] = galleryItems;

    return {
      props: {
        galleryItems,
      },
      revalidate: 60,
    };
  } catch (error) {
    console.error('Error fetching gallery items:', error);
    return {
      props: {
        galleryItems: [],
        error: 'Failed to fetch gallery items.',
      },
      revalidate: 60,
    };
  }
}

const Gallery = ({ galleryItems, error }) => {
  const router = useRouter();
  const { locale } = router;
  const mappedLocale = locale === 'de' ? 'de' : 'en';

  if (error) {
    return <div className={styles.error}>{error}</div>;
  }

  if (!galleryItems || galleryItems.length === 0) {
    return (
      <div className={styles.noGallery}>
        {mappedLocale === 'de'
          ? 'Keine Galerie verfügbar.'
          : 'No gallery available.'}
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h1>{mappedLocale === 'de' ? 'Galerie' : 'Gallery'}</h1>
      <div className={styles.galleryGrid}>
        {galleryItems.map((item) => (
          <div key={item.id} className={styles.galleryItem}>
            {item.bild ? (
              <div className={styles.imageWrapper}>
                <Image
                  src={item.bild}
                  alt={`${item.titel} - ${item.businessName ? item.businessName : 'Gallery Image'}`}
                  fill
                  style={{ objectFit: 'cover' }}
                  className={styles.image}
                />
              </div>
            ) : (
              <div className={styles.placeholder}>
                {mappedLocale === 'de' ? 'Kein Bild' : 'No Image'}
              </div>
            )}
            <h3>{item.titel}</h3>
            <p>
              {item.location &&
                item.location !== 'N/A' &&
                item.location !== 'Unable to determine address' && (
                  <span>
                    {mappedLocale === 'de' ? 'Standort: ' : 'Location: '}
                    {item.location}
                  </span>
                )}
              {item.businessName && (
                <span>
                  {item.location ? <br /> : null}
                  {mappedLocale === 'de' ? 'Unternehmen: ' : 'Business: '}
                  {item.businessName}
                </span>
              )}
              {!item.location && !item.businessName && 'N/A'}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Gallery;
