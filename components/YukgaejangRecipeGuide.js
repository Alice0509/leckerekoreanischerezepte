import Link from 'next/link';
import styles from '../styles/YukgaejangRecipeGuide.module.css';

// Match the published recipe, rather than ingredients or translated titles.
export default function YukgaejangRecipeGuide({ recipeId, locale }) {
  if (recipeId !== 'nQQ7cpv31ZBSQD4YthuGZ') return null;
  const isGerman = locale === 'de';
  return (
    <section className={styles.guide} id="yukgaejang-guide">
      <h2>
        {isGerman
          ? 'Yukgaejang aus meiner Küche'
          : 'Yukgaejang from my kitchen'}
      </h2>
      <p>
        {isGerman
          ? 'Diese scharfe koreanische Rindfleischsuppe koche ich mit sehr dünn geschnittenem Fleisch, Lauchzwiebeln, Pilzen und Mungobohnensprossen. Gochugaru, Knoblauch und zwei Sorten Sojasauce würzen die Brühe; Ei und Glasnudeln kommen zum Schluss dazu.'
          : 'I make this spicy Korean beef soup with very thinly sliced beef, green onions, mushrooms and mung bean sprouts. Gochugaru, garlic and two soy sauces season the broth, with eggs and glass noodles added near the end.'}
      </p>
      <p className={styles.prep}>
        <strong>{isGerman ? 'Vorher einplanen: ' : 'Plan ahead: '}</strong>
        {isGerman
          ? 'Die Glasnudeln nach meinen Notizen etwa 1 Stunde in kaltem Wasser einweichen und anschließend separat etwa 4 Minuten kochen. Beginne mit dem Einweichen vor dem Kochen der Suppe; plane dafür zusätzliche Zeit zur angegebenen Rezeptzeit von 50 Minuten ein.'
          : 'As described in my notes, soak the glass noodles in cold water for about 1 hour, then boil them separately for about 4 minutes. Start soaking before cooking the soup; allow extra time for this beyond the listed 50-minute recipe time.'}
      </p>
      <details className={styles.details}>
        <summary>
          {isGerman
            ? 'Fragen zu Zutaten und Vorbereitung'
            : 'Ingredient and preparation questions'}
        </summary>
        <div className={styles.answers}>
          <h3>
            {isGerman
              ? 'Welche Glasnudeln verwende ich?'
              : 'Which glass noodles do I use?'}
          </h3>
          <p>
            {isGerman
              ? 'Dieses Rezept verwendet Dangmyeon, koreanische Glasnudeln. Die separat vorgekochten Nudeln gebe ich kurz vor dem Servieren in den Topf oder direkt in die Schüssel und gieße die heiße Suppe darüber.'
              : 'This recipe uses dangmyeon, Korean glass noodles. I add the separately cooked noodles to the pot just before serving, or put them in a bowl and pour the hot soup over them.'}
          </p>
          <Link href="/ingredients/dangmyeon">
            {isGerman ? 'Dangmyeon kennenlernen' : 'About dangmyeon'} →
          </Link>
          <h3>
            {isGerman
              ? 'Warum stehen zwei Sojasaucen in der Liste?'
              : 'Why are there two soy sauces in the list?'}
          </h3>
          <p>
            {isGerman
              ? 'Ich verwende hier je 1 EL Jin-Ganjang und Guk-Ganjang. Die Zutaten-Seiten erklären beide Sorten. Nutze die Mengen aus diesem Rezept; die Produktnamen bezeichnen unterschiedliche Sojasaucen.'
              : 'I use 1 tbsp each of jin-ganjang and guk-ganjang here. The ingredient guides explain both types. Follow the amounts in this recipe; these names refer to different soy sauces.'}
          </p>
          <div className={styles.links}>
            <Link href="/ingredients/jinganjang">Jin-Ganjang →</Link>
            <Link href="/ingredients/gukganjang">Guk-Ganjang →</Link>
          </div>
          <h3>
            {isGerman
              ? 'Was gibt der Suppe ihre Schärfe?'
              : 'What makes the soup spicy?'}
          </h3>
          <p>
            {isGerman
              ? 'In meiner Zutatenliste stehen 3–3,5 EL Gochugaru. Das koreanische Chilipulver wird in Schritt 4 mit Knoblauch kurz angebraten, bevor das Wasser dazukommt. Lies den Zutaten-Guide, wenn dir Gochugaru noch unbekannt ist.'
              : 'My ingredient list calls for 3–3.5 tbsp gochugaru. In step 4, I briefly fry this Korean chili powder with garlic before adding the water. Open the ingredient guide if gochugaru is new to you.'}
          </p>
          <Link href="/ingredients/gochugaru">
            {isGerman ? 'Gochugaru kennenlernen' : 'About gochugaru'} →
          </Link>
        </div>
      </details>
    </section>
  );
}
