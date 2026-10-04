// Curated cooking connections; IDs keep the links valid across translated slugs.
const companions = {
  'chat-recipe-bibim-noodle-sauce': '1EflHHVSRKo4tSzbUD7aBX',
  '1EflHHVSRKo4tSzbUD7aBX': 'chat-recipe-bibim-noodle-sauce',
};

function companionId(recipeId) {
  return companions[recipeId] || null;
}

function prioritizeCompanions(items, recipeId) {
  const preferred = companionId(recipeId);
  return [
    ...items.filter((item) => item.sys.id === preferred),
    ...items.filter((item) => item.sys.id !== preferred),
  ];
}

module.exports = { companionId, prioritizeCompanions };
