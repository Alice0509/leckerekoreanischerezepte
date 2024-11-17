// pages/gallery.js
import React from 'react';
import client from '../lib/contentful';
import Image from 'next/image';
import styles from '../styles/Gallery.module.css';
import { useRouter } from 'next/router';
import { reverseGeocode } from '../lib/geocode'; // 올바르게 내보낸 함수 가져오기

export async function getStaticProps({ locale }) {
  try {
    const mappedLocale = locale === 'de' ? 'de' : 'en';

    const res = await client.getEntries({
      content_type: 'gallery',
      locale: mappedLocale,
      include: 5, // 관련 Asset 포함
    });

    const assetsMap = {};
    res.includes.Asset?.forEach((asset) => {
      assetsMap[asset.sys.id] = asset;
    });

    const galleryItems = await Promise.all(
      res.items.map(async (item) => {
        // 'bild' 필드가 배열인지 단일 객체인지 확인
        let images = [];
        if (Array.isArray(item.fields.bild)) {
          images = item.fields.bild.map((img) => assetsMap[img.sys.id]);
        } else if (item.fields.bild) {
          images = [assetsMap[item.fields.bild.sys.id]];
        }

        // 'location' 필드 처리
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
          businessName: item.fields.businessName || null, // 상호 필드 추가
          location: address, // 주소 문자열로 설정
          bild: images.length > 0 ? `https:${images[0].fields.file.url}` : null, // 이미지 URL 설정
        };
      })
    );

    console.log('Fetched gallery items:', galleryItems);

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
                  // placeholder="blur" // 올바른 Base64 문자열로 설정 필요 시 주석 해제
                  // blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..." // Base64 인코딩된 이미지로 변경
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
