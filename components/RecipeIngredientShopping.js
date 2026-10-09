import Link from 'next/link';
import PurchaseLink from './PurchaseLink';
import ReweProductHelp from './ReweProductHelp';
import AffiliateDisclosure from './AffiliateDisclosure';
import styles from '../styles/RecipeIngredientShopping.module.css';

export default function RecipeIngredientShopping({ ingredients = [], locale }) {
  if (ingredients.length === 0) return null;
  const isGerman = locale === 'de';
  const hasAffiliateLinks = ingredients.some((ingredient) =>
    ingredient.groups.some((group) =>
      group.stores.some((store) => store.link.isAffiliate)
    )
  );
  return (
    <details className={styles.panel} id="recipe-ingredient-shopping">
      <summary>
        {isGerman
          ? 'Zutaten für dieses Rezept finden'
          : 'Find ingredients for this recipe'}
      </summary>
      <div className={styles.body}>
        <p className={styles.intro}>
          {isGerman
            ? 'Kaufbeispiele für ausgewählte Zutaten aus der Liste oben. Prüfe zuerst, was du schon hast. Packungsgröße und Produktvariante können abweichen; die Rezeptmengen stehen in der Zutatenliste. Sortiment und Lieferung an deine Adresse im Shop prüfen.'
            : 'Shopping examples for selected ingredients in the list above. Check what you already have first. Pack sizes and product variants can differ; use the amounts in the ingredient list. Start with a local shop in your country; the links below are labeled by shopping region. Check delivery to your address.'}
        </p>
        {hasAffiliateLinks && (
          <AffiliateDisclosure locale={locale} className={styles.intro} />
        )}
        <ul className={styles.ingredients}>
          {ingredients.map((ingredient) => (
            <li key={ingredient.slug} className={styles.ingredient}>
              <h3>{ingredient.name}</h3>
              <Link
                href={`/ingredients/${ingredient.slug}#ingredient-shopping`}
                className={styles.guide}
              >
                {isGerman
                  ? 'Zutat & Produktauswahl'
                  : 'Ingredient & product guide'}{' '}
                →
              </Link>
              {ingredient.groups.map((group) => (
                <div key={group.region} className={styles.region}>
                  <h4>{group.title}</h4>
                  <ul className={styles.products}>
                    {group.stores.map((store) => (
                      <li key={store.link.href} className={styles.product}>
                        {store.variantLabel && (
                          <p className={styles.variantLabel}>
                            {store.variantLabel}
                          </p>
                        )}
                        <p className={styles.productTitle}>
                          {store.productTitle}
                        </p>
                        <div className={styles.actionRow}>
                          <span className={styles.shopName}>{store.name}</span>
                          <div className={styles.action}>
                            <PurchaseLink
                              link={store.link}
                              locale={locale}
                              compact
                              className={styles.button}
                              ariaLabel={
                                isGerman
                                  ? `Produkt bei ${store.name} ansehen (neuer Tab)`
                                  : `View product at ${store.name} (new tab)`
                              }
                            >
                              {isGerman ? 'Produkt ansehen' : 'View product'}{' '}
                              <span aria-hidden="true">↗</span>
                            </PurchaseLink>
                          </div>
                        </div>
                        <ReweProductHelp store={store} locale={locale} />
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </li>
          ))}
        </ul>
      </div>
    </details>
  );
}
