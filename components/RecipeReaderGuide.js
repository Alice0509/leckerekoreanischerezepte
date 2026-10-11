import Link from 'next/link';
import recipeReaderGuide from '../lib/recipeReaderGuide.cjs';
import styles from '../styles/YukgaejangRecipeGuide.module.css';

const { getRecipeReaderGuide } = recipeReaderGuide;

export default function RecipeReaderGuide({ recipeId, locale }) {
  const guide = getRecipeReaderGuide(recipeId, locale);
  if (!guide) return null;

  return (
    <section className={styles.guide} aria-labelledby="recipe-serving-title">
      <h2 id="recipe-serving-title">{guide.title}</h2>
      <p>{guide.intro}</p>
      <details className={styles.details}>
        <summary>{guide.detailsTitle}</summary>
        <div className={styles.answers}>
          {guide.sections.map((section) => (
            <div key={section.title}>
              <h3>{section.title}</h3>
              <p>{section.text}</p>
            </div>
          ))}
          <div className={styles.links}>
            {guide.links.map((link) => (
              <Link href={link.href} key={link.href}>
                {link.label} →
              </Link>
            ))}
          </div>
        </div>
      </details>
    </section>
  );
}
