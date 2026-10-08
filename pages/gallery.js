// pages/gallery.js
import contentfulBuildSnapshot from '../lib/contentfulBuildSnapshot.cjs';
import kitchenPicks from '../lib/kitchenPicks.cjs';
import Link from 'next/link';
import PurchaseLink from '../components/PurchaseLink';
import AffiliateDisclosure from '../components/AffiliateDisclosure';

const {
  getKitchenPickContext,
  getKitchenPickLinks,
  getApprovedKitchenOptions,
} = kitchenPicks;

const { getFavoriteDatasetFromSnapshot, getGalleryDatasetFromSnapshot } =
  contentfulBuildSnapshot;
import Image from 'next/image';
import styles from '../styles/Gallery.module.css';
import { NextSeo } from 'next-seo';
import { getSeoUrls } from '../lib/siteUrls';

/* -----------------------------------------------------------
   1) STATIC SANITY SNAPSHOT (Gallery + Favorite Items)
----------------------------------------------------------- */
export async function getStaticProps({ locale }) {
  const lang = locale === 'de' ? 'de' : 'en';
  const cookingData = require('../lib/generated-cooking-plan-data.json');

  // ── Gallery items ─────────────────────────────
  const galleryRes = getGalleryDatasetFromSnapshot(lang);
  const favRes = getFavoriteDatasetFromSnapshot(lang);

  if (!galleryRes?.items || !favRes?.items) {
    throw new Error(`Missing ${lang.toUpperCase()} gallery snapshot.`);
  }

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

    const links = getKitchenPickLinks(rawLinks, lang);

    return {
      id: it.sys.id,
      title: base.title || '',
      memo: base.memo || '',
      links,
      context: getKitchenPickContext(
        it.sys.id,
        lang,
        cookingData[lang]?.recipesById || {}
      ),
      image: base.image?.fields?.file?.url
        ? `https:${base.image.fields.file.url}`
        : null,
    };
  });

  return {
    props: {
      galleryItems,
      favorites,
      locale: lang,
      productOptions: getApprovedKitchenOptions(lang),
    },
  };
}

/* -----------------------------------------------------------
   2) PAGE COMPONENT
----------------------------------------------------------- */
export default function Gallery({
  galleryItems,
  favorites,
  locale,
  productOptions = [],
}) {
  const isDE = locale === 'de';
  const lang = isDE ? 'de' : 'en';
  const seoUrls = getSeoUrls({ locale: lang, path: '/gallery' });
  const canonicalUrl = seoUrls.canonicalUrl;

  const seo = isDE
    ? {
        title: 'Zutaten & Küchenhelfer | Hansik Young',
        description:
          'Koreanische Zutaten und Küchenhelfer auswählen: Grundzutaten, praktische Guides, persönliche Produktnotizen und passende Rezepte.',
      }
    : {
        title: 'Kitchen Picks: Korean Ingredients & Tools | Hansik Young',
        description:
          'Choose ingredients and tools for Korean home cooking, with pantry guides, personal product notes and recipes to put them to use.',
      };

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
          {
            hrefLang: 'x-default',
            href: seoUrls.alternateUrls.xDefault,
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
            {isDE ? 'Gezielt auswählen' : 'Choose for what you cook'}
          </p>
          <h1 className={styles.title}>
            {isDE ? 'Zutaten & Küchenhelfer' : 'Kitchen Picks'}
          </h1>
          <p className={styles.heroText}>
            {isDE
              ? 'Starte mit einem Gericht. Die Guides helfen beim Auswählen; darunter findest du meine vorhandenen Produktnotizen und passende Rezepte.'
              : 'Start with a dish. Use the guides to choose what you need, then explore my existing product notes and recipes that put ingredients to use.'}
          </p>
        </header>

        <nav
          className={styles.guideGrid}
          aria-label={isDE ? 'Einkaufs-Guides' : 'Shopping guides'}
        >
          <Link href="/korean-pantry" className={styles.guideCard}>
            <strong>{isDE ? 'Grundzutaten' : 'Pantry basics'}</strong>
            <span>
              {isDE
                ? 'Sojasauce, Sesamöl und Chili passend zum Rezept auswählen.'
                : 'Choose soy sauce, sesame oil and chili for your recipe.'}
            </span>
            <span className={styles.guideAction}>
              {isDE ? 'Zutaten-Guide' : 'Pantry guide'} →
            </span>
          </Link>
          <Link href="/korean-kitchen-tools" className={styles.guideCard}>
            <strong>{isDE ? 'Küchenhelfer' : 'Kitchen tools'}</strong>
            <span>
              {isDE
                ? 'Vorhandene Ausstattung prüfen und gezielt ergänzen.'
                : 'Check what you have and choose any extras you need.'}
            </span>
            <span className={styles.guideAction}>
              {isDE ? 'Küchen-Guide' : 'Tools guide'} →
            </span>
          </Link>
        </nav>
        <p className={styles.countryNote}>
          {isDE
            ? 'Kaufmöglichkeiten: Sortiment, Produktvariante und Lieferung an deine Adresse im jeweiligen Shop prüfen.'
            : 'Find ingredient options in your country through the guides. Existing links to German retailers below are labeled Germany; they do not imply worldwide delivery.'}
        </p>

        {/* A. FAVORITES */}
        {productOptions.length > 0 && (
          <section
            className={styles.section}
            aria-labelledby="kitchen-product-options"
          >
            <h2 id="kitchen-product-options" className={styles.subtitle}>
              {isDE
                ? 'Kaufmöglichkeiten zu den Zutaten-Guides'
                : 'Shopping options from the ingredient guides'}
            </h2>
            <p className={styles.notice}>
              {isDE
                ? 'Produktbeispiele aus den Zutaten-Guides. Sie sind von meinen persönlichen Nutzungsnotizen getrennt; Schärfegrad und Variante vor dem Kauf prüfen.'
                : 'Product examples from the ingredient guides, separate from my personal use notes. Check the heat level and exact variant before buying.'}
            </p>
            <AffiliateDisclosure locale={lang} className={styles.notice} />
            <div className={styles.memoGrid}>
              {productOptions.map((product) => (
                <article
                  key={`${product.ingredient}:${product.link.href}`}
                  className={styles.memoCard}
                >
                  <h3>{product.productTitle}</h3>
                  <p className={styles.shopName}>
                    {product.name} · {product.region}
                  </p>
                  <Link
                    className={styles.contextLink}
                    href={`/ingredients/${product.ingredient}`}
                  >
                    {isDE ? 'Zutat verstehen' : 'Ingredient guide'} →
                  </Link>
                  <PurchaseLink
                    link={product.link}
                    locale={lang}
                    compact
                    className={styles.memoLink}
                    ariaLabel={`${isDE ? 'Produkt bei' : 'View product at'} ${product.name} (${isDE ? 'öffnet neuen Tab' : 'opens in a new tab'})`}
                  >
                    {isDE ? 'Produkt ansehen' : 'View product'} ↗
                  </PurchaseLink>
                </article>
              ))}
            </div>
          </section>
        )}
        <section className={styles.section}>
          <h2 className={styles.subtitle}>
            {isDE ? 'Joans Produktnotizen' : 'Joan’s product notes'}
          </h2>

          {favorites.some((favorite) =>
            favorite.links.some((link) => link.isAffiliate)
          ) ? (
            <AffiliateDisclosure locale={lang} className={styles.notice} />
          ) : (
            <p className={styles.notice}>
              {isDE
                ? 'Vorhandene persönliche Notizen. Nicht als Werbung gekennzeichnete Links sind gewöhnliche Produktlinks.'
                : 'Existing personal notes. Links without an advertising label are ordinary product links.'}
            </p>
          )}

          <div className={styles.memoGrid}>
            {favorites.map((f) => {
              return (
                <article key={f.id} className={styles.memoCard}>
                  {f.image && (
                    <div className={styles.memoImageWrap}>
                      <Image
                        src={f.image}
                        alt={f.title}
                        fill
                        className={styles.memoImage}
                        sizes="(max-width: 700px) 85vw, 480px"
                      />
                    </div>
                  )}

                  <div className={styles.memoContent}>
                    <h3>{f.title}</h3>
                    {f.context && (
                      <p className={styles.variantNote}>{f.context.note}</p>
                    )}
                    <div className={styles.contextLinks}>
                      {f.context?.ingredient && (
                        <Link href={`/ingredients/${f.context.ingredient}`}>
                          {isDE ? 'Zutat verstehen' : 'Ingredient guide'} →
                        </Link>
                      )}
                      {f.context?.recipe && (
                        <Link href={`/recipes/${f.context.recipe.slug}`}>
                          {f.context.recipe.title} →
                        </Link>
                      )}
                    </div>
                    {f.memo && (
                      <details className={styles.notes}>
                        <summary>
                          {isDE ? 'So verwende ich es' : 'How I use it'}
                        </summary>
                        <p className={styles.memoText}>{f.memo}</p>
                      </details>
                    )}
                    {[
                      ['DE', isDE ? 'Deutschland' : 'Germany'],
                      [
                        'other',
                        isDE
                          ? 'Weitere Shops · Lieferung prüfen'
                          : 'Other shops · check delivery',
                      ],
                    ].map(([region, label]) => {
                      const links = f.links.filter(
                        (link) => link.region === region
                      );
                      if (!links.length) return null;
                      return (
                        <details key={region} className={styles.notes}>
                          <summary>
                            {isDE
                              ? `Produktlinks: ${label}`
                              : `Product links: ${label}`}
                          </summary>
                          <p className={styles.deliveryNote}>
                            {isDE
                              ? 'Produktvariante, Preis, Versand und Liefergebiet im Shop prüfen.'
                              : 'Check the variant, price, shipping and delivery area at the shop.'}
                          </p>
                          <ul className={styles.memoLinksList}>
                            {links.map((link) => (
                              <li key={link.href}>
                                <span className={styles.shopName}>
                                  {link.shopName}
                                </span>
                                <PurchaseLink
                                  link={link}
                                  locale={lang}
                                  className={styles.memoLink}
                                  compact
                                  ariaLabel={`${isDE ? 'Produkt bei' : 'View product at'} ${link.shopName} (${isDE ? 'öffnet neuen Tab' : 'opens in a new tab'})`}
                                >
                                  {isDE ? 'Produkt ansehen' : 'View product'} ↗
                                </PurchaseLink>
                              </li>
                            ))}
                          </ul>
                        </details>
                      );
                    })}
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        {/* B. GALLERY (Polaroid style) */}
        <details className={`${styles.section} ${styles.kitchenPhotos}`}>
          <summary>
            {isDE ? 'Fotos aus meiner Küche' : 'Photos from my kitchen'}
          </summary>

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
                      sizes="(max-width: 700px) 85vw, 320px"
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
        </details>
        <section className={styles.nextStep}>
          <h2>
            {isDE
              ? 'Ein Gericht planen, gezielt einkaufen'
              : 'Plan a dish, then shop'}
          </h2>
          <p>
            {isDE
              ? 'Speichere passende Rezepte im Kochplan, prüfe die vollständige Zutatenliste und vergleiche sie mit deinen Vorräten.'
              : 'Save recipes to your Cooking Plan, check their full ingredient lists and compare them with what you already have.'}
          </p>
          <Link className={styles.action} href="/cooking-plan">
            {isDE ? 'Mein Kochplan' : 'My Cooking Plan'} →
          </Link>
        </section>
      </main>
    </>
  );
}
