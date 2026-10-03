const INGREDIENT_IDS = [
  '4xHLnk2plaHbaxJGKmijJA',
  '1Z9oHNVxVc7AhslG98QByK',
  '31qLwPpZYSKIi7ZpC41EZp',
  '45AmuOcPL5dEMn8AXNlRGD',
];
const RECIPE_IDS = [
  '703psgakZCWDg6urn4TDBK',
  '18KyYbvwgaI52zC0pp1u5x',
  'MTVJJZTDiOrFtOjZxK4La',
];

const COPY = {
  en: {
    title: 'Korean Pantry Essentials for Beginners | Hansik Young',
    description:
      'Start your Korean pantry with practical tips for soy sauce, sesame oil, gochujang and gochugaru. Choose a recipe, check your cupboard and buy what you need.',
    eyebrow: 'Start cooking Korean food',
    heading: 'Your first Korean pantry',
    intro:
      'Choose a dish you want to cook, then check what you already have. These four seasonings are useful across Korean recipes, but you do not need every one for your first meal.',
    jump: 'Choose a first recipe',
    basics: 'Four seasonings to get to know',
    choosing: 'What to look for',
    substitution: 'If you do not have it',
    storage: 'Keeping it fresh',
    details: 'Ingredient guide and product details',
    productOptions: 'Product options by country',
    recipes: 'Pick a dish before you shop',
    recipesIntro:
      'These are existing recipes with complete ingredient lists. Check the full recipe for vegetables, rice, meat and any extra seasonings before buying.',
    shoppingHeading: 'Make one useful shopping list',
    shoppingSteps: [
      'Open a recipe and check its complete ingredient list.',
      'Check your cupboard before buying a new bottle or tub. Start with a pack you can use regularly.',
      'Save recipes to your Cooking Plan to see a combined shopping list. Ingredient pages explain product differences and show reviewed product options where available.',
    ],
    plan: 'Open my Cooking Plan',
    finder: 'Find recipes with what I have',
    countryHeading: 'Buying ingredients where you live',
    countryText:
      'Look for Korean ingredients at a local Asian supermarket or an online shop that delivers to your country. Product links labeled United States are for US shopping; they do not imply worldwide delivery. Check ingredients, heat level, pack size and delivery availability on the seller’s page.',
    allIngredients: 'Browse all ingredient guides',
    cards: [
      {
        name: 'Soy sauce · Jin-ganjang',
        use: 'A salty, savory base for marinades and sauces, including the bulgogi recipe below.',
        choosing:
          'Check the soy sauce type called for in the recipe. Jin-ganjang and soup soy sauce (guk-ganjang) are different products.',
        substitution:
          'A regular soy sauce can work in some marinades, but saltiness and flavor vary. Add gradually and taste.',
        storage: 'Follow the bottle’s instructions for storage after opening.',
      },
      {
        name: 'Toasted sesame oil',
        use: 'A nutty finishing seasoning for vegetable side dishes such as spinach namul.',
        choosing:
          'Look for toasted sesame oil when the recipe calls for its roasted aroma. Neutral cooking oil has a different role.',
        substitution:
          'A neutral oil does not replace its flavor. Check whether your chosen recipe allows you to leave it out.',
        storage:
          'Keep the bottle tightly closed and follow its storage instructions.',
      },
      {
        name: 'Gochujang · Korean chili paste',
        use: 'A fermented paste that brings heat and savory sweetness to sauces, such as the tteokbokki sauce below.',
        choosing:
          'Choose gochujang paste rather than a ready-made dipping sauce. Check the heat level and ingredients on the tub.',
        substitution:
          'Gochugaru and hot sauce are not equal replacements for this paste. Use a recipe written for the substitute you have.',
        storage:
          'Use a clean utensil and follow the label’s instructions after opening.',
      },
      {
        name: 'Gochugaru · Korean chili flakes',
        use: 'Dried red chili used for kimchi, seasoned vegetables and sauces. The tteokbokki recipe below uses it alongside gochujang.',
        choosing:
          'Choose coarse flakes or fine powder according to the recipe. Heat level and grind vary between products.',
        substitution:
          'Generic chili powder may contain other seasonings. A different pure chili changes heat and flavor, so it is not an exact swap.',
        storage:
          'Keep the pack tightly closed and dry, following the manufacturer’s storage instructions.',
      },
    ],
  },
  de: {
    title: 'Koreanische Grundzutaten für Anfänger | Hansik Young',
    description:
      'Koreanisch kochen in Deutschland: Sojasauce, Sesamöl, Gochujang und Gochugaru auswählen und verwenden. Starte mit einem Rezept und kaufe gezielt ein.',
    eyebrow: 'Koreanisch kochen in Deutschland',
    heading: 'Deine ersten koreanischen Grundzutaten',
    intro:
      'Wähle zuerst ein Gericht und prüfe, was du schon zu Hause hast. Diese vier Würzzutaten kommen in vielen koreanischen Rezepten vor. Für dein erstes Essen brauchst du nicht alle auf einmal.',
    jump: 'Ein erstes Rezept auswählen',
    basics: 'Vier Würzzutaten kennenlernen',
    choosing: 'Darauf solltest du achten',
    substitution: 'Wenn du die Zutat nicht hast',
    storage: 'Richtig aufbewahren',
    details: 'Zutaten-Guide und Produktdetails',
    productOptions: 'Produkte nach Land ansehen',
    recipes: 'Erst ein Gericht wählen, dann einkaufen',
    recipesIntro:
      'Diese vorhandenen Rezepte enthalten vollständige Zutatenlisten. Prüfe im jeweiligen Rezept auch Gemüse, Reis, Fleisch und weitere Würzzutaten.',
    shoppingHeading: 'Eine Einkaufsliste, die du wirklich brauchst',
    shoppingSteps: [
      'Öffne ein Rezept und lies die vollständige Zutatenliste.',
      'Prüfe deinen Vorrat, bevor du eine neue Flasche oder Dose kaufst. Starte mit einer Packung, die du regelmäßig verwenden kannst.',
      'Speichere Rezepte im Kochplan, um eine gemeinsame Einkaufsliste zu sehen. Die Zutaten-Guides erklären Unterschiede und zeigen geprüfte Produktlinks, soweit vorhanden.',
    ],
    plan: 'Meinen Kochplan öffnen',
    finder: 'Rezepte mit meinem Vorrat finden',
    countryHeading: 'Koreanische Zutaten in Deutschland finden',
    countryText:
      'Koreanische Würzzutaten findest du oft im Asia-Markt oder bei einem koreanischen Online-Shop. Für Gemüse und gewöhnliche Kochzutaten kommen auch lokale Supermärkte infrage. Prüfe Schärfe, Zutatenliste, Packungsgröße und Lieferbedingungen auf der Verkaufsseite.',
    allIngredients: 'Alle Zutaten-Guides ansehen',
    cards: [
      {
        name: 'Sojasauce · Jin-Ganjang',
        use: 'Eine salzige, würzige Grundlage für Marinaden und Saucen, zum Beispiel im Bulgogi-Rezept unten.',
        choosing:
          'Achte auf die im Rezept genannte Sorte. Jin-Ganjang und die Suppen-Sojasauce Guk-Ganjang sind unterschiedliche Produkte.',
        substitution:
          'Eine gewöhnliche Sojasauce kann in manchen Marinaden funktionieren. Salzgehalt und Geschmack unterscheiden sich: nach und nach zugeben und abschmecken.',
        storage:
          'Beachte die Hinweise auf der Flasche zur Lagerung nach dem Öffnen.',
      },
      {
        name: 'Geröstetes Sesamöl',
        use: 'Eine nussige Würzzutat für Gemüsebeilagen wie Spinat-Namul.',
        choosing:
          'Für das Röstaroma ist geröstetes Sesamöl gemeint. Neutrales Bratöl hat eine andere Aufgabe.',
        substitution:
          'Neutrales Öl ersetzt das Aroma nicht. Prüfe, ob du Sesamöl im gewählten Rezept weglassen kannst.',
        storage:
          'Halte die Flasche gut verschlossen und beachte ihre Lagerungshinweise.',
      },
      {
        name: 'Gochujang · koreanische Chilipaste',
        use: 'Eine fermentierte Paste für Schärfe und würzige Süße, zum Beispiel in der Tteokbokki-Sauce unten.',
        choosing:
          'Wähle Gochujang-Paste statt einer bereits gewürzten Dip-Sauce. Prüfe Schärfe und Zutaten auf der Packung.',
        substitution:
          'Gochugaru und scharfe Sauce sind kein gleichwertiger Ersatz. Nutze ein Rezept, das für deine vorhandene Alternative gedacht ist.',
        storage:
          'Verwende einen sauberen Löffel und beachte die Hinweise nach dem Öffnen.',
      },
      {
        name: 'Gochugaru · koreanisches Chilipulver',
        use: 'Getrocknete rote Chili für Kimchi, Gemüsebeilagen und Saucen. Im Tteokbokki-Rezept unten wird sie zusammen mit Gochujang verwendet.',
        choosing:
          'Wähle grobe Flocken oder feines Pulver passend zum Rezept. Schärfe und Körnung unterscheiden sich je nach Produkt.',
        substitution:
          'Gewöhnliches Chilipulver kann weitere Gewürze enthalten. Auch reine andere Chili verändert Schärfe und Geschmack und ist kein genauer Ersatz.',
        storage:
          'Halte die Packung gut verschlossen und trocken. Beachte die Lagerungshinweise des Herstellers.',
      },
    ],
  },
};

function getPantryStarter({ locale, ingredientEntries, recipesById }) {
  const language = locale === 'de' ? 'de' : 'en';
  const copy = COPY[language];
  const ingredients = INGREDIENT_IDS.map((id, index) => {
    const entry = ingredientEntries.find((item) => item.sys.id === id);
    const slug = entry?.fields?.slug;
    if (typeof slug !== 'string' || !/^[a-z0-9-]+$/.test(slug)) {
      throw new Error(`Missing published ${language} pantry ingredient: ${id}`);
    }
    return { id, slug, ...copy.cards[index] };
  });
  const recipes = RECIPE_IDS.map((id) => {
    const recipe = recipesById[id];
    if (!recipe?.slug || !recipe?.titel || !recipe?.image) {
      throw new Error(`Missing published ${language} starter recipe: ${id}`);
    }
    return { id, slug: recipe.slug, titel: recipe.titel, image: recipe.image };
  });
  return { locale: language, copy, ingredients, recipes };
}

module.exports = { INGREDIENT_IDS, RECIPE_IDS, getPantryStarter };
