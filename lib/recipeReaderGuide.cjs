// Use the published identity, not a title or URL that can change by language.
const SSAMJANG_RECIPE_ID = '5pMvcuRp2a78VcYvfhXN8X';

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

function getRecipeReaderGuide(recipeId, locale) {
  if (recipeId !== SSAMJANG_RECIPE_ID) return null;
  // Return a copy so one caller cannot change another page's copy.
  return structuredClone(ssamjang[locale === 'de' ? 'de' : 'en']);
}

module.exports = { SSAMJANG_RECIPE_ID, getRecipeReaderGuide };
