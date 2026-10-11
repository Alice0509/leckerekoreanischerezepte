// Use the published identity, not a title or URL that can change by language.
const SSAMJANG_RECIPE_ID = '5pMvcuRp2a78VcYvfhXN8X';
const CHOGOCHUJANG_RECIPE_ID = '4scruZVHnEMVsSTYtN5sl9';

const ssamjang = {
  en: {
    title: 'Why I make my own ssamjang',
    intro:
      'I find homemade ssamjang much nuttier and fresher than shop-bought versions, especially when I eat it with a variety of vegetables. Try a little with your vegetables first, then add more to suit your taste.',
    detailsTitle: 'How to serve it and choose the pastes',
    sections: [
      {
        title: 'How much should I use?',
        text: 'Ssamjang is a concentrated dip, not a sauce to pour over the whole plate. Try a small amount with your food first, then add more to suit your taste. The recipe mixes doenjang, gochujang, garlic and sesame with chopped onion and green onion.',
      },
      {
        title: 'Do I need a Korean barbecue?',
        text: 'You can serve the dip with meat you have already cooked in a pan or on a grill. Serving idea: put lettuce and bite-sized meat on the table so everyone can make their own wraps. Prepare these accompaniments separately; they are not part of the dip ingredient list.',
      },
      {
        title: 'Which pastes do I need?',
        text: 'Doenjang is Korean fermented soybean paste; gochujang is Korean chili paste. They are two separate ingredients in this recipe. Ready-made ssamjang is already a mixed dip, so it is not the same starting ingredient. Use the linked guides if the names are new to you.',
      },
    ],
    links: [
      { href: '/ingredients/doenjang', label: 'About doenjang' },
      { href: '/ingredients/gochujang', label: 'About gochujang' },
    ],
    feedback:
      'What did you serve your ssamjang with? A short note about the food you paired it with, or anything you adjusted, can help the next cook. Questions and things that did not work are welcome too. No photo is needed.',
    feedbackButton: 'Share how you served it',
  },
  de: {
    title: 'Warum ich Ssamjang selbst mache',
    intro:
      'Für mich schmeckt selbst gemachtes Ssamjang viel nussiger und frischer als gekauftes – besonders, wenn ich es zu verschiedenen Gemüsesorten esse. Probiere zunächst etwas Dip mit deinem Gemüse und nimm nach Geschmack mehr.',
    detailsTitle: 'Servieren und die richtigen Pasten auswählen',
    sections: [
      {
        title: 'Wie viel Dip nehme ich?',
        text: 'Ssamjang ist ein konzentrierter Dip, keine Sauce zum Übergießen des ganzen Tellers. Probiere zunächst eine kleine Menge zusammen mit deinem Essen und nimm nach Geschmack mehr. Das Rezept verbindet Doenjang, Gochujang, Knoblauch und Sesam mit gehackter Zwiebel und Lauchzwiebel.',
      },
      {
        title: 'Brauche ich dafür ein koreanisches BBQ?',
        text: 'Du kannst den Dip zu Fleisch servieren, das du in der Pfanne oder auf dem Grill fertig gegart hast. Servieridee: Stelle Salatblätter und mundgerechte Fleischstücke auf den Tisch, damit alle ihre eigenen Wraps machen können. Bereite diese Beilagen separat vor; sie gehören nicht zur Zutatenliste des Dips.',
      },
      {
        title: 'Welche Pasten brauche ich?',
        text: 'Doenjang ist koreanische fermentierte Sojabohnenpaste, Gochujang ist koreanische Chilipaste. Im Rezept sind das zwei getrennte Zutaten. Fertig gekauftes Ssamjang ist bereits ein gemischter Dip und deshalb nicht dieselbe Ausgangszutat. Die verlinkten Zutaten-Seiten erklären die Pasten.',
      },
    ],
    links: [
      { href: '/ingredients/doenjang', label: 'Doenjang kennenlernen' },
      { href: '/ingredients/gochujang', label: 'Gochujang kennenlernen' },
    ],
    feedback:
      'Wozu hast du dein Ssamjang gegessen? Eine kurze Notiz zu deiner Kombination oder einer Anpassung hilft anderen beim Nachkochen. Fragen und Hinweise, wenn etwas nicht geklappt hat, sind genauso willkommen. Ein Foto ist nicht nötig.',
    feedbackButton: 'Deine Kombination teilen',
  },
};

const chogochujang = {
  en: {
    title: 'How I like my chogochujang',
    intro:
      'I love a tangy, sweet chogochujang, so I adjust the vinegar to my taste and sometimes add a little more. I especially enjoy it with squid sashimi or steamed cabbage.',
    detailsTitle: 'Adjusting the taste and serving it',
    sections: [
      {
        title: 'How do I adjust the vinegar?',
        text: 'Mix the recipe ingredients first. If you would like a tangier sauce, add a little more vinegar, mix and taste before adding more. The amount in the ingredient list is your starting point; the extra vinegar is an adjustment to suit your taste.',
      },
      {
        title: 'What can I serve it with?',
        text: 'My own favourites are squid sashimi and steamed cabbage. For a vegetable option, try the sauce with steamed cabbage. Prepare whatever you serve it with separately; these foods are not part of the sauce ingredient list.',
      },
      {
        title: 'Which paste and vinegar does this recipe use?',
        text: 'This recipe uses gochujang, the Korean chili paste, and apple cider vinegar. Chogochujang is the finished seasoned sauce, so ready-made chogochujang is not the same starting ingredient as plain gochujang. The ingredient guides below explain both ingredients.',
      },
    ],
    links: [
      { href: '/ingredients/gochujang', label: 'About gochujang' },
      { href: '/ingredients/apfelessig', label: 'About apple cider vinegar' },
    ],
    feedback:
      'Did you adjust the vinegar, and what did you serve your chogochujang with? A short note about your taste preference or pairing can help the next cook. Questions and things that did not work are welcome too. No photo is needed.',
    feedbackButton: 'Share your taste and pairing',
  },
  de: {
    title: 'So mag ich mein Chogochujang',
    intro:
      'Ich liebe Chogochujang süß-säuerlich und passe den Essig deshalb meinem Geschmack an – manchmal mit etwas mehr davon. Besonders gern esse ich die Sauce zu Tintenfisch-Sashimi oder gedämpftem Weißkohl.',
    detailsTitle: 'Abschmecken und servieren',
    sections: [
      {
        title: 'Wie passe ich die Essigmenge an?',
        text: 'Vermische zuerst die Rezeptzutaten. Wenn du die Sauce säuerlicher magst, gib etwas mehr Essig dazu, rühre um und probiere, bevor du weiteren Essig hinzufügst. Die Menge in der Zutatenliste ist der Ausgangspunkt; zusätzlicher Essig ist eine Anpassung an deinen Geschmack.',
      },
      {
        title: 'Wozu kann ich die Sauce essen?',
        text: 'Meine persönlichen Favoriten sind Tintenfisch-Sashimi und gedämpfter Weißkohl. Als Gemüsevariante kannst du die Sauce zu gedämpftem Weißkohl probieren. Bereite die Speisen dazu separat vor; sie gehören nicht zur Zutatenliste der Sauce.',
      },
      {
        title: 'Welche Paste und welchen Essig verwendet das Rezept?',
        text: 'Das Rezept verwendet Gochujang, die koreanische Chilipaste, und Apfelessig. Chogochujang ist die fertig gewürzte Sauce. Fertig gekauftes Chogochujang ist deshalb nicht dieselbe Ausgangszutat wie purer Gochujang. Die verlinkten Zutaten-Seiten erklären beide Zutaten.',
      },
    ],
    links: [
      { href: '/ingredients/gochujang', label: 'Gochujang kennenlernen' },
      { href: '/ingredients/apfelessig', label: 'Apfelessig kennenlernen' },
    ],
    feedback:
      'Hast du die Essigmenge angepasst, und wozu hast du dein Chogochujang gegessen? Eine kurze Notiz zu deinem Geschmack oder deiner Kombination hilft anderen beim Nachkochen. Fragen und Hinweise, wenn etwas nicht geklappt hat, sind genauso willkommen. Ein Foto ist nicht nötig.',
    feedbackButton: 'Geschmack und Kombination teilen',
  },
};

function getRecipeReaderGuide(recipeId, locale) {
  const guide =
    recipeId === SSAMJANG_RECIPE_ID
      ? ssamjang
      : recipeId === CHOGOCHUJANG_RECIPE_ID
        ? chogochujang
        : null;
  if (!guide) return null;
  // Return a copy so one caller cannot change another page's copy.
  return structuredClone(guide[locale === 'de' ? 'de' : 'en']);
}

module.exports = {
  SSAMJANG_RECIPE_ID,
  CHOGOCHUJANG_RECIPE_ID,
  getRecipeReaderGuide,
};
