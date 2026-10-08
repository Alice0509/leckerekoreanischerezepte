// Published recipe IDs keep cooking connections valid across translated slugs.
const companions = new Map([
  [
    '5I6AjYlpqOuinx5qYBDHLR',
    [
      {
        id: '6ctxIrfIiesRNf8yKAnnns',
        en: 'Make the Worcestershire-based sauce to serve with the pork cutlets.',
        de: 'Bereite die Sauce mit Worcestersauce zu deinen Schweineschnitzeln zu.',
      },
      {
        id: '3xVgSUpUDFy86XnwHgzEYg',
        en: 'Cook rice as a side for your tonkatsu meal.',
        de: 'Koche Reis als Beilage zu deinem Tonkatsu.',
      },
    ],
  ],
  [
    '6ctxIrfIiesRNf8yKAnnns',
    [
      {
        id: '5I6AjYlpqOuinx5qYBDHLR',
        en: 'Prepare the Korean-style pork cutlets to serve with this sauce.',
        de: 'Bereite koreanische Schweineschnitzel zu dieser Sauce zu.',
      },
    ],
  ],
  [
    'chat-recipe-bibim-noodle-sauce',
    [
      {
        id: '1EflHHVSRKo4tSzbUD7aBX',
        en: 'Cook the noodles before mixing them with the sauce.',
        de: 'Koche die Nudeln, bevor du sie mit der Sauce vermischst.',
      },
      {
        id: '4scruZVHnEMVsSTYtN5sl9',
        en: 'Try another simple gochujang sauce, this time for dipping.',
        de: 'Probiere eine weitere einfache Gochujang-Sauce zum Dippen.',
      },
    ],
  ],
  [
    '1EflHHVSRKo4tSzbUD7aBX',
    [
      {
        id: 'chat-recipe-bibim-noodle-sauce',
        en: 'Mix a sweet and spicy sauce for your cooked noodles.',
        de: 'Mische eine süß-scharfe Sauce für deine gekochten Nudeln.',
      },
    ],
  ],
  [
    '1WsefXmdbl6zzAkwV7RRPC',
    [
      {
        id: '3xVgSUpUDFy86XnwHgzEYg',
        en: 'Cook a bowl of rice to serve alongside the soup.',
        de: 'Koche Reis als Begleitung zur Suppe.',
      },
      {
        id: '3dfdSrm5oVqxp7CAr3QDG3',
        en: 'Add a steamed egg side dish to your soup and rice meal.',
        de: 'Ergänze Suppe und Reis mit einer Beilage aus gedämpften Eiern.',
      },
    ],
  ],
  [
    '4scruZVHnEMVsSTYtN5sl9',
    [
      {
        id: '38Ox8shT32YDdOYfxBamOO',
        en: 'Serve the dipping sauce with a savory kimchi pancake.',
        de: 'Serviere den Dip zu einem herzhaften Kimchi-Pfannkuchen.',
      },
      {
        id: 'chat-recipe-bibim-noodle-sauce',
        en: 'Use gochujang in a sauce for mixing with noodles, too.',
        de: 'Verwende Gochujang auch in einer Sauce zum Vermischen mit Nudeln.',
      },
    ],
  ],
  [
    '38Ox8shT32YDdOYfxBamOO',
    [
      {
        id: '4scruZVHnEMVsSTYtN5sl9',
        en: 'Mix a sweet, sour and spicy dip to serve with the pancake.',
        de: 'Mische einen süß-sauren, scharfen Dip zum Pfannkuchen.',
      },
    ],
  ],
  [
    'chat-recipe-japanese-golden-curry',
    [
      {
        id: '3xVgSUpUDFy86XnwHgzEYg',
        en: 'Prepare the rice to serve with your Japanese curry.',
        de: 'Bereite Reis als Beilage zu deinem japanischen Curry zu.',
      },
    ],
  ],
]);

function companionIds(recipeId) {
  return (companions.get(recipeId) || []).map((item) => item.id);
}

function companionId(recipeId) {
  return companionIds(recipeId)[0] || null;
}

function companionReason(recipeId, targetId, locale) {
  const item = (companions.get(recipeId) || []).find(
    (candidate) => candidate.id === targetId
  );
  return item?.[locale === 'de' ? 'de' : 'en'] || '';
}

function prioritizeCompanions(items, recipeId) {
  const order = companionIds(recipeId);
  const seen = new Set();
  const uniqueItems = items.filter((item) => {
    const id = item?.sys?.id;
    if (!id || id.startsWith('drafts.') || seen.has(id)) return false;
    seen.add(id);
    return true;
  });
  // Only promote entries actually present in the current published catalog.
  return [
    ...order.flatMap((id) => uniqueItems.filter((item) => item.sys.id === id)),
    ...uniqueItems.filter((item) => !order.includes(item.sys.id)),
  ];
}

module.exports = {
  companionId,
  companionIds,
  companionReason,
  prioritizeCompanions,
};
