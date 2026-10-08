import Link from 'next/link';
import { NextSeo } from 'next-seo';
import RecipeMeasurementGuide from '../components/RecipeMeasurementGuide';
import { getSeoUrls } from '../lib/siteUrls';
import styles from '../styles/KitchenTools.module.css';

const COPY = {
  en: {
    title: 'Korean Cooking Tools for Beginners | Hansik Young',
    description:
      'Start Korean home cooking with the kitchen tools you already have. Learn what to use for rice, sauces and pancakes, and which extras can wait.',
    eyebrow: 'A practical start',
    heading: 'Korean cooking, with the tools you have',
    intro:
      'Pick one recipe first. A pot, a frying pan and everyday prep tools can take you a long way; you do not need a new set of equipment to begin.',
    author: 'A kitchen guide by Joan',
    jump: 'Check the basics',
    basics: 'Check your kitchen before you shop',
    basicsIntro: 'These are useful jobs to cover, rather than a shopping list.',
    essentials: [
      {
        title: 'Cook: a pot and frying pan',
        text: 'Use a pot with a lid for rice or soup and a frying pan for pancakes and stir-fries. Choose a size that suits the recipe and your household.',
        choosing:
          'If buying: check hob compatibility, capacity and a handle you can grip comfortably. A wok is optional.',
      },
      {
        title: 'Prepare: a knife, board and bowl',
        text: 'A knife and cutting board handle vegetables; a mixing bowl works for sauces and pancake batter. A sieve or colander is useful for draining noodles.',
        choosing:
          'If buying: start with a comfortable knife and a stable board. Small sauce bowls and a special Korean knife are optional.',
      },
      {
        title: 'Measure: follow the recipe',
        text: 'Use a kitchen scale for grams and a jug with volume markings for millilitres. Measuring spoons help when a recipe gives tbsp or tsp amounts.',
        choosing:
          'For a sauce explicitly written in parts, use the same spoon throughout. A household rice spoon is not automatically a 15 ml tablespoon.',
      },
    ],
    later: 'Extras that can wait',
    laterIntro:
      'Add equipment when it solves a problem in dishes you cook regularly.',
    optional: [
      {
        title: 'Rice cooker',
        text: 'Worth considering if you cook rice often and want a repeatable routine. A pot with a well-fitting lid is another way to start.',
        choosing:
          'Compare capacity using the manufacturer’s rice cup, cleaning instructions and available space. An uncooked-rice cup count is not the same as servings.',
      },
      {
        title: 'Gimbap rolling mat',
        text: 'Useful when you start making rolled gimbap. It is not needed for rice bowls, noodle sauces or pancakes.',
        choosing:
          'Choose a mat you can clean and dry according to its instructions. Buy it for a planned recipe, rather than for every Korean dish.',
      },
      {
        title: 'Immersion blender',
        text: 'Useful for a smoother curry sauce if you prefer that texture. The curry can also be made without blending.',
        choosing:
          'Check whether the appliance is suitable for hot liquids and follow its instructions. It is an optional texture choice, not a requirement for starting.',
      },
      {
        title: 'Food storage containers',
        text: 'Useful for organizing ingredients or preparing several dishes. Existing food-safe containers may already do the job.',
        choosing:
          'Choose sizes you will use and check the instructions for freezer, microwave and dishwasher use.',
      },
    ],
    try: 'Put the basics to use',
    tryIntro:
      'Open a complete recipe to check ingredients, amounts and cooking steps.',
    recipeLabels: [
      'Rice · pot with a lid',
      'Bibim sauce · bowl and spoon',
      'Kimchi pancake · bowl and frying pan',
    ],
    next: 'Choose a dish, then buy what is missing',
    nextText:
      'Check your seasonings as well as your tools. Start with one meal and use the full recipe to make a useful shopping list.',
    pantry: 'Pantry basics',
    ingredients: 'Ingredient guides',
    plan: 'My Cooking Plan',
  },
  de: {
    title: 'Küchenhelfer für koreanisches Kochen | Hansik Young',
    description:
      'Koreanisch kochen mit vorhandenen Küchenhelfern: Was du für Reis, Saucen und Pfannkuchen brauchst und welche Extras warten können.',
    eyebrow: 'Ein praktischer Einstieg',
    heading: 'Koreanisch kochen mit deiner Küche',
    intro:
      'Wähle zuerst ein Rezept. Mit Topf, Pfanne und gewöhnlichen Küchenhelfern kannst du vieles zubereiten. Für den Einstieg brauchst du keine neue Komplettausstattung.',
    author: 'Ein Küchen-Guide von Joan',
    jump: 'Grundausstattung prüfen',
    basics: 'Erst die Küche prüfen, dann einkaufen',
    basicsIntro:
      'Hier geht es um nützliche Aufgaben, nicht um eine Einkaufsliste.',
    essentials: [
      {
        title: 'Kochen: Topf und Pfanne',
        text: 'Ein Topf mit Deckel eignet sich für Reis oder Suppen, eine Pfanne für Pfannkuchen und gebratene Gerichte. Wähle die Größe passend zum Rezept und deinem Haushalt.',
        choosing:
          'Beim Kauf: Herdart, Fassungsvermögen und einen gut greifbaren Griff prüfen. Ein Wok ist optional.',
      },
      {
        title: 'Vorbereiten: Messer, Brett und Schüssel',
        text: 'Messer und Schneidebrett helfen beim Gemüse, eine Schüssel bei Saucen und Pfannkuchenteig. Zum Abgießen von Nudeln ist ein Sieb praktisch.',
        choosing:
          'Beim Kauf: mit einem angenehm zu führenden Messer und einem stabilen Brett starten. Extra Saucenschälchen oder ein spezielles koreanisches Messer sind optional.',
      },
      {
        title: 'Abmessen: die Rezeptangaben beachten',
        text: 'Für Grammangaben eine Küchenwaage, für Milliliter einen Messbecher verwenden. Bei EL- oder TL-Angaben helfen Messlöffel.',
        choosing:
          'Bei einer Sauce mit ausdrücklich angegebenen Teilen immer denselben Löffel verwenden. Ein Besteck- oder Reislöffel entspricht nicht automatisch einem 15-ml-Esslöffel.',
      },
    ],
    later: 'Extras, die warten können',
    laterIntro:
      'Ergänze Geräte, wenn sie dir bei regelmäßig gekochten Gerichten helfen.',
    optional: [
      {
        title: 'Reiskocher',
        text: 'Eine Überlegung wert, wenn du oft Reis kochst und eine gleichmäßige Routine möchtest. Für den Einstieg geht auch ein Topf mit gut schließendem Deckel.',
        choosing:
          'Fassungsvermögen anhand des Hersteller-Reisbechers, Reinigung und Platzbedarf vergleichen. Die Anzahl der Becher für ungekochten Reis entspricht nicht der Anzahl der Portionen.',
      },
      {
        title: 'Gimbap-Rollmatte',
        text: 'Hilfreich, wenn du gerolltes Gimbap zubereiten möchtest. Für Reisschüsseln, Nudelsaucen und Pfannkuchen brauchst du sie nicht.',
        choosing:
          'Eine Matte wählen, die du nach Herstellerangaben reinigen und trocknen kannst. Kaufe sie für ein geplantes Rezept, nicht für jedes koreanische Gericht.',
      },
      {
        title: 'Stabmixer',
        text: 'Praktisch für eine glattere Currysauce, wenn du diese Konsistenz magst. Das Curry lässt sich auch ohne Pürieren zubereiten.',
        choosing:
          'Prüfe, ob das Gerät für heiße Flüssigkeiten geeignet ist, und beachte seine Anleitung. Es ist eine optionale Wahl für die Konsistenz.',
      },
      {
        title: 'Vorratsbehälter',
        text: 'Praktisch zum Ordnen von Zutaten oder Vorbereiten mehrerer Gerichte. Vorhandene lebensmittelechte Behälter können bereits ausreichen.',
        choosing:
          'Passende Größen wählen und die Angaben zu Gefrierschrank, Mikrowelle und Spülmaschine prüfen.',
      },
    ],
    try: 'Die Grundausstattung ausprobieren',
    tryIntro:
      'Öffne ein vollständiges Rezept für Zutaten, Mengen und Zubereitung.',
    recipeLabels: [
      'Reis · Topf mit Deckel',
      'Bibim-Sauce · Schüssel und Löffel',
      'Kimchi-Pfannkuchen · Schüssel und Pfanne',
    ],
    next: 'Ein Gericht wählen, gezielt ergänzen',
    nextText:
      'Prüfe neben den Küchenhelfern auch deine Würzzutaten. Starte mit einer Mahlzeit und erstelle anhand des vollständigen Rezepts eine passende Einkaufsliste.',
    pantry: 'Grundzutaten',
    ingredients: 'Zutaten-Guides',
    plan: 'Mein Kochplan',
  },
};

export function getStaticProps({ locale }) {
  const language = locale === 'de' ? 'de' : 'en';
  const data = require('../lib/generated-cooking-plan-data.json');
  const recipeIds = [
    '3xVgSUpUDFy86XnwHgzEYg',
    'chat-recipe-bibim-noodle-sauce',
    '38Ox8shT32YDdOYfxBamOO',
  ];
  const recipes = recipeIds.map((id) => {
    const recipe = data[language]?.recipesById?.[id];
    if (!recipe?.slug || !recipe?.titel) {
      throw new Error(
        `Missing published kitchen guide recipe: ${language}/${id}`
      );
    }
    return { id, slug: recipe.slug, title: recipe.titel };
  });
  return { props: { locale: language, copy: COPY[language], recipes } };
}

export default function KitchenTools({ locale, copy, recipes }) {
  const urls = getSeoUrls({ locale, path: '/korean-kitchen-tools' });
  return (
    <>
      <NextSeo
        title={copy.title}
        description={copy.description}
        canonical={urls.canonicalUrl}
        languageAlternates={Object.entries(urls.alternateUrls).map(
          ([language, href]) => ({
            hrefLang: language === 'xDefault' ? 'x-default' : language,
            href,
          })
        )}
        openGraph={{
          title: copy.title,
          description: copy.description,
          url: urls.canonicalUrl,
        }}
      />
      <main className={styles.container}>
        <header className={styles.hero}>
          <p className={styles.eyebrow}>{copy.eyebrow}</p>
          <h1>{copy.heading}</h1>
          <p>{copy.intro}</p>
          <Link className={styles.textLink} href="/about-us">
            {copy.author}
          </Link>
          <a className={styles.action} href="#kitchen-basics">
            {copy.jump}
          </a>
        </header>
        <section aria-labelledby="kitchen-basics">
          <h2 id="kitchen-basics">{copy.basics}</h2>
          <p>{copy.basicsIntro}</p>
          <div className={styles.basics}>
            {copy.essentials.map((tool, index) => (
              <article key={tool.title} className={styles.card}>
                <span className={styles.number} aria-hidden="true">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <h3>{tool.title}</h3>
                <p>{tool.text}</p>
                <p className={styles.tip}>{tool.choosing}</p>
              </article>
            ))}
          </div>
          <RecipeMeasurementGuide locale={locale} />
        </section>
        <section className={styles.section} aria-labelledby="kitchen-extras">
          <h2 id="kitchen-extras">{copy.later}</h2>
          <p>{copy.laterIntro}</p>
          <div className={styles.extras}>
            {copy.optional.map((tool) => (
              <details key={tool.title} className={styles.extra}>
                <summary>{tool.title}</summary>
                <p>{tool.text}</p>
                <p>{tool.choosing}</p>
              </details>
            ))}
          </div>
        </section>
        <section className={styles.section} aria-labelledby="kitchen-recipes">
          <h2 id="kitchen-recipes">{copy.try}</h2>
          <p>{copy.tryIntro}</p>
          <ul className={styles.recipeLinks}>
            {recipes.map((recipe, index) => (
              <li key={recipe.id}>
                <Link href={`/recipes/${recipe.slug}`}>
                  <span>{copy.recipeLabels[index]}</span>
                  <span aria-hidden="true">→</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
        <section className={styles.next} aria-labelledby="kitchen-next">
          <h2 id="kitchen-next">{copy.next}</h2>
          <p>{copy.nextText}</p>
          <div className={styles.actions}>
            <Link className={styles.action} href="/korean-pantry">
              {copy.pantry}
            </Link>
            <Link className={styles.textLink} href="/ingredients">
              {copy.ingredients}
            </Link>
            <Link className={styles.textLink} href="/cooking-plan">
              {copy.plan}
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}
