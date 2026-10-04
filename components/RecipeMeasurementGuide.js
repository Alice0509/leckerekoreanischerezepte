import React from 'react';
import styles from '../styles/RecipeMeasurementGuide.module.css';

const copy = {
  en: {
    title: 'Spoons, ratios & measurements',
    intro:
      'Follow the measurement note in this recipe. A spoon amount may refer to a measuring spoon, an everyday spoon or a ratio.',
    sections: [
      [
        'Measuring spoons',
        'A metric tablespoon (tbsp) is 15 ml and a metric teaspoon (tsp) is 5 ml. Check the volume marked on your spoon: sets can differ. Level dry ingredients unless the recipe says otherwise.',
      ],
      [
        'Everyday spoons',
        'Korean rice spoons (밥숟가락) and ordinary cutlery spoons vary in size. Do not assume a household spoon equals a 15 ml measuring tablespoon. Check the recipe’s own note before substituting.',
      ],
      [
        'Ratios: “parts”',
        '2 parts to 1 part means twice as much by volume. Choose one spoon as your measure and use it throughout; fill dry ingredients consistently, level rather than heaped. A larger measure makes a larger batch. Ratios apply only where the recipe explicitly uses parts.',
      ],
      [
        'Grams, millilitres & baking',
        'Follow the listed g and ml amounts. Baking quantities need particular care. A volume in ml is not automatically the same weight in g; do not replace precise amounts with an everyday spoon.',
      ],
    ],
  },
  de: {
    title: 'Löffel, Verhältnisse & Mengenangaben',
    intro:
      'Beachte den Mengenhinweis in diesem Rezept. Eine Löffelangabe kann einen Messlöffel, einen Bestecklöffel oder ein Mengenverhältnis meinen.',
    sections: [
      [
        'Messlöffel',
        'Ein metrischer Esslöffel (EL) fasst 15 ml, ein metrischer Teelöffel (TL) 5 ml. Prüfe die Volumenangabe auf deinem Messlöffel: Sets können sich unterscheiden. Trockene Zutaten gestrichen abmessen, sofern das Rezept nichts anderes angibt.',
      ],
      [
        'Bestecklöffel',
        'Koreanische Reislöffel (밥숟가락) und gewöhnliche Bestecklöffel sind unterschiedlich groß. Ein Haushaltslöffel entspricht nicht automatisch einem 15-ml-Messlöffel. Beachte vor dem Ersetzen den Hinweis im Rezept.',
      ],
      [
        'Verhältnisse: „Teile“',
        '2 Teile zu 1 Teil bedeutet die doppelte Menge nach Volumen. Wähle einen Löffel als Maß und verwende ihn durchgehend; trockene Zutaten gleichmäßig gestrichen statt gehäuft abmessen. Ein größeres Maß ergibt mehr Sauce. Verhältnisse gelten nur, wenn das Rezept ausdrücklich Teile angibt.',
      ],
      [
        'Gramm, Milliliter & Backen',
        'Halte dich an die angegebenen Mengen in g und ml. Beim Backen ist genaues Abmessen besonders wichtig. Ein Volumen in ml entspricht nicht automatisch demselben Gewicht in g; genaue Angaben nicht durch Bestecklöffel ersetzen.',
      ],
    ],
  },
};

export default function RecipeMeasurementGuide({ locale }) {
  const text = copy[locale] || copy.en;
  return (
    <details className={styles.guide}>
      <summary>{text.title}</summary>
      <p>{text.intro}</p>
      <dl>
        {text.sections.map(([title, explanation]) => (
          <React.Fragment key={title}>
            <dt>{title}</dt>
            <dd>{explanation}</dd>
          </React.Fragment>
        ))}
      </dl>
    </details>
  );
}
