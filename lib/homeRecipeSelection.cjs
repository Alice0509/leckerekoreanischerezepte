const { latestRecipes } = require('./recipeFreshness.cjs');
// An editor-selected rotation of real home-cooking recipes. Keep IDs across locales.
const WEEKLY_RECIPE_IDS = [
  '43IX0IUiWFisuLoBEs8vow', // Kimchi fried rice
  '3dfdSrm5oVqxp7CAr3QDG3', // Steamed eggs
  '1olbq8OuMCibB2Lf1cvmK9', // Braised tofu
  '1W0b1krf5jtJbUhd2oyqK', // Stir-fried zucchini
  '1Eg5zTAVFjQTcpfKNanrRj', // Kimchi udon
  '4r9tj6BaLEJEweYmt6hlIL', // Street toast
  '38Ox8shT32YDdOYfxBamOO', // Kimchi pancake
  'MTVJJZTDiOrFtOjZxK4La', // Tteokbokki
];

function berlinWeek(now) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Berlin',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date(now));
  const value = (key) => Number(parts.find((part) => part.type === key).value);
  const day = Date.UTC(value('year'), value('month') - 1, value('day'));
  // 1970-01-05 is a Monday. Weeks change at Monday midnight in Berlin, including DST.
  return Math.floor((day - Date.UTC(1970, 0, 5)) / (7 * 86400000));
}

function selectHomeRecipes(recipes, now) {
  const current = typeof now === 'number' ? now : Date.parse(now);
  if (!Number.isFinite(current)) return [];
  const seen = new Set();
  const eligible = recipes.filter((recipe) => {
    if (!recipe.id || !recipe.slug || !recipe.titel || seen.has(recipe.id))
      return false;
    seen.add(recipe.id);
    const published = Date.parse(recipe.firstPublishedAt);
    return !Number.isFinite(published) || published <= current;
  });
  const latest = latestRecipes(eligible, current, 2);
  const other = eligible.filter(
    (recipe) => !latest.some((item) => item.id === recipe.id)
  );
  const curated = WEEKLY_RECIPE_IDS.map((id) =>
    other.find((recipe) => recipe.id === id)
  ).filter(Boolean);
  const pool = curated.length
    ? curated
    : [...other].sort((a, b) => String(a.id).localeCompare(String(b.id)));
  const weekly = pool.length
    ? pool[((berlinWeek(current) % pool.length) + pool.length) % pool.length]
    : null;
  // Reserve the weekly pick before filling undated archive slots, so those slots
  // cannot change the weekly rotation as the first dated recipes are published.
  const remaining = eligible.filter(
    (recipe) =>
      recipe.id !== weekly?.id && !latest.some((item) => item.id === recipe.id)
  );
  while (latest.length < Math.min(2, eligible.length) && remaining.length)
    latest.push(remaining.shift());
  return [
    ...latest.map((recipe) => ({
      recipe,
      role: recipe.firstPublishedAt ? 'latest' : 'archive',
    })),
    ...(weekly ? [{ recipe: weekly, role: 'weekly' }] : []),
  ];
}

module.exports = { WEEKLY_RECIPE_IDS, berlinWeek, selectHomeRecipes };
