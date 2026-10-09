import { useId, useState } from 'react';
import reweProductHelp from '../lib/reweProductHelp.cjs';
import styles from '../styles/ReweProductHelp.module.css';

const { getReweProductHelp } = reweProductHelp;

export default function ReweProductHelp({ store, locale }) {
  const id = useId();
  const [message, setMessage] = useState('');
  const help = getReweProductHelp(store, locale);
  if (!help) return null;

  async function copy(text, success) {
    try {
      await navigator.clipboard.writeText(text);
      setMessage(success);
    } catch {
      setMessage(
        'Kopieren nicht möglich. Markiere und kopiere den Text unten.'
      );
    }
  }

  return (
    <details className={styles.help}>
      <summary>Probleme mit der REWE-App?</summary>
      <div className={styles.body}>
        <p>
          Wenn die App das Produkt nicht öffnet: Kopiere die Webadresse und füge
          sie direkt in die Adresszeile von Safari oder deinem Browser ein.
          Alternativ kannst du in der REWE-App nach dem Produktnamen suchen.
        </p>
        <div className={styles.actions}>
          <button
            type="button"
            onClick={() =>
              copy(
                help.webUrl,
                'Webadresse kopiert. In die Browser-Adresszeile einfügen.'
              )
            }
            aria-label={`Webadresse für ${help.productTitle} kopieren`}
          >
            Webadresse kopieren
          </button>
          <button
            type="button"
            onClick={() => copy(help.productTitle, 'Produktname kopiert.')}
            aria-label={`Produktname ${help.productTitle} kopieren`}
          >
            Produktname kopieren
          </button>
        </div>
        <p role="status" className={styles.status}>
          {message}
        </p>
        <p className={styles.productName}>{help.productTitle}</p>
        <label htmlFor={id}>Direkte Produktadresse (kein Affiliate-Link)</label>
        <input
          id={id}
          type="text"
          value={help.webUrl}
          readOnly
          onFocus={(event) => event.target.select()}
        />
        <p className={styles.note}>
          Sortiment und Verfügbarkeit hängen vom gewählten Markt und deiner
          Adresse ab.
        </p>
      </div>
    </details>
  );
}
