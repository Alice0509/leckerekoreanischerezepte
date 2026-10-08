import Link from 'next/link';
import styles from '../styles/YukgaejangRecipeGuide.module.css';

// Share the existing compact guide styling; match a published recipe ID.
export default function TonkatsuRecipeGuide({
  recipeId,
  locale,
  companions = [],
}) {
  if (recipeId !== '5I6AjYlpqOuinx5qYBDHLR') return null;
  const isGerman = locale === 'de';
  const sauce = companions.find((item) => item.id === '6ctxIrfIiesRNf8yKAnnns');
  const rice = companions.find((item) => item.id === '3xVgSUpUDFy86XnwHgzEYg');

  return (
    <section className={styles.guide} id="tonkatsu-guide">
      <h2>
        {isGerman
          ? 'Koreanischer Schweineschnitzel-Teller'
          : 'A Korean-style pork cutlet meal'}
      </h2>
      <p>
        {isGerman
          ? 'In diesem Rezept klopfe ich Schweinerücken gleichmäßig dünn und paniere ihn mit Mehl, Ei und Paniermehl. Zum fertigen Tonkatsu passen Reis, fein geschnittener Kohl und Tonkatsu-Sauce. Bereite diese Beilagen zusätzlich zur Zutatenliste für die Schnitzel vor.'
          : 'In this recipe, I pound pork loin evenly thin and coat it in flour, egg and breadcrumbs. Serve the finished tonkatsu with rice, finely shredded cabbage and tonkatsu sauce. Prepare these accompaniments separately from the cutlet ingredient list.'}
      </p>
      <details className={styles.details}>
        <summary>
          {isGerman
            ? 'Fleisch, Panade und Beilagen vorbereiten'
            : 'Choosing meat, breading and accompaniments'}
        </summary>
        <div className={styles.answers}>
          <h3>
            {isGerman
              ? 'Welches Schweinefleisch nehme ich?'
              : 'Which cut of pork do I use?'}
          </h3>
          <p>
            {isGerman
              ? 'Die Zutatenliste verwendet Schweinerücken. In Schritt 1 wird das Fleisch in Portionen geschnitten, mit einem Fleischklopfer gleichmäßig dünn geklopft und mit Salz und Pfeffer gewürzt. So beginnt meine Zubereitung im Schnitzel-Stil.'
              : 'The ingredient list uses pork loin. In step 1, I cut it into portions, pound each piece evenly thin with a meat mallet, and season it with salt and pepper. This is how I prepare the schnitzel-style cutlets in this recipe.'}
          </p>
          <h3>
            {isGerman
              ? 'Welches Paniermehl verwende ich?'
              : 'Which breadcrumbs do I use?'}
          </h3>
          <p>
            {isGerman
              ? 'Auf meiner Paniermehl-Seite findest du ein Foto und meine Beschreibung des Samlip-Produkts, das ich für Tonkatsu verwende. Stelle zum Panieren drei flache Teller bereit: zuerst Mehl, dann verquirltes Ei und zuletzt Paniermehl. Die Mengen stehen in der Rezeptliste.'
              : 'My breadcrumb guide has a photo and notes about the Samlip product I use for tonkatsu. Set out three shallow dishes in this order: flour, beaten egg, then breadcrumbs. Use the amounts in the recipe ingredient list.'}
          </p>
          <Link href="/ingredients/paniermehl">
            {isGerman
              ? 'Paniermehl mit Produktfoto'
              : 'Breadcrumb guide with product photo'}{' '}
            →
          </Link>
          {(sauce || rice) && (
            <>
              <h3>
                {isGerman
                  ? 'Wo finde ich Sauce und Reis als Beilage?'
                  : 'Where are the sauce and rice recipes?'}
              </h3>
              <p>
                {isGerman
                  ? 'Die Schnitzel-Zutatenliste enthält weder die Sauce noch den Beilagenreis. Meine separaten Rezepte zeigen eine Tonkatsu-Sauce mit Worcestersauce und die Zubereitung von Reis. Beachte dort die jeweiligen Mengen und Zeiten.'
                  : 'The cutlet ingredient list does not include the sauce or rice. My separate recipes cover a Worcestershire-based tonkatsu sauce and how to cook rice. Follow each recipe’s own amounts and timings.'}
              </p>
              <div className={styles.links}>
                {sauce && (
                  <Link href={`/recipes/${sauce.slug}`}>
                    {isGerman
                      ? 'Tonkatsu-Sauce zubereiten'
                      : 'Make tonkatsu sauce'}{' '}
                    →
                  </Link>
                )}
                {rice && (
                  <Link href={`/recipes/${rice.slug}`}>
                    {isGerman ? 'Reis kochen' : 'How to cook rice'} →
                  </Link>
                )}
              </div>
            </>
          )}
        </div>
      </details>
    </section>
  );
}
