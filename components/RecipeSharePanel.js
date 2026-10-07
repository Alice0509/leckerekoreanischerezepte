import React, { useId, useState } from 'react';
import recipeShare from '../lib/recipeShare.cjs';
import styles from '../styles/RecipeSharePanel.module.css';

const {
  getShareSize,
  buildShareCaption,
  buildPinterestDetails,
  drawShareCard,
} = recipeShare;

export default function RecipeSharePanel({
  title,
  description,
  canonicalUrl,
  imageUrl,
  slug,
  locale,
}) {
  const german = locale === 'de';
  const pinId = useId();
  const pin = buildPinterestDetails({
    title,
    description,
    canonicalUrl,
    locale,
  });
  const caption = buildShareCaption({
    title,
    description,
    canonicalUrl,
    locale,
  });
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(null);
  const [manualText, setManualText] = useState('');

  async function copy(text) {
    try {
      await navigator.clipboard.writeText(text);
      setManualText('');
      setMessage(german ? 'Kopiert.' : 'Copied.');
    } catch {
      setManualText(text);
      setMessage(
        german
          ? 'Markiere den Text unten und kopiere ihn.'
          : 'Select and copy the text below.'
      );
    }
  }

  async function download(format = 'instagram') {
    setBusy(format);
    setMessage('');
    try {
      const image = new window.Image();
      image.crossOrigin = 'anonymous';
      await new Promise((resolve, reject) => {
        image.onload = resolve;
        image.onerror = reject;
        image.src = imageUrl.startsWith('https://')
          ? `/_next/image?url=${encodeURIComponent(imageUrl)}&w=1080&q=75`
          : imageUrl;
      });
      const canvas = document.createElement('canvas');
      const size = getShareSize(format);
      canvas.width = size.width;
      canvas.height = size.height;
      const context = canvas.getContext('2d');
      if (!context) throw new Error('Canvas unavailable');
      drawShareCard(context, image, { title, canonicalUrl, locale, format });
      const blob = await new Promise((resolve) =>
        canvas.toBlob(resolve, 'image/png')
      );
      if (!blob) throw new Error('Image export failed');
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download =
        format === 'pinterest'
          ? `hansik-pinterest-${slug}-${locale}.png`
          : `hansik-${slug}-${locale}.png`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      setMessage(
        german
          ? 'Dein Rezeptbild wurde vorbereitet.'
          : 'Your recipe image is ready.'
      );
    } catch {
      setMessage(
        german
          ? 'Das Bild konnte nicht geladen werden. Du kannst den Rezepttext und Link weiterhin kopieren.'
          : 'The photo could not be loaded. You can still copy the recipe text and link.'
      );
    } finally {
      setBusy(null);
    }
  }

  return (
    <details className={styles.panel}>
      <summary>{german ? 'Dieses Rezept teilen' : 'Share this recipe'}</summary>
      <p>
        {german
          ? 'Teile den Link, einen kurzen Rezepttext oder ein Bild mit dem vorhandenen Rezeptfoto.'
          : 'Share the link, a short introduction or an image made with the existing recipe photo.'}
      </p>
      <div className={styles.actions}>
        <button type="button" onClick={() => copy(canonicalUrl)}>
          {german ? 'Link kopieren' : 'Copy link'}
        </button>
        <button type="button" onClick={() => copy(caption)}>
          {german ? 'Rezepttext kopieren' : 'Copy introduction'}
        </button>
        {imageUrl && (
          <button
            type="button"
            onClick={() => download('instagram')}
            disabled={Boolean(busy)}
          >
            {busy === 'instagram'
              ? german
                ? 'Bild wird erstellt…'
                : 'Preparing image…'
              : german
                ? 'Rezeptbild herunterladen'
                : 'Download recipe image'}
          </button>
        )}
      </div>
      <section
        className={styles.pinterest}
        aria-labelledby={`${pinId}-heading`}
      >
        <h3 id={`${pinId}-heading`}>
          {german ? 'Für Pinterest vorbereiten' : 'Prepare a Pinterest Pin'}
        </h3>
        <p>
          {german
            ? 'Lade das Bild herunter und füge Titel, Beschreibung und Link in die passenden Felder eines neuen Pins ein.'
            : 'Download the image, then paste the title, description and link into the matching fields of a new Pin.'}
        </p>
        {imageUrl && (
          <div className={styles.actions}>
            <button
              type="button"
              onClick={() => download('pinterest')}
              disabled={Boolean(busy)}
            >
              {busy === 'pinterest'
                ? german
                  ? 'Bild wird erstellt…'
                  : 'Preparing image…'
                : german
                  ? 'Pinterest-Bild herunterladen (1000 × 1500)'
                  : 'Download Pinterest image (1000 × 1500)'}
            </button>
          </div>
        )}
        {[
          {
            key: 'title',
            label: german ? 'Titel' : 'Title',
            button: german ? 'Titel kopieren' : 'Copy title',
            value: pin.title,
            rows: 2,
          },
          {
            key: 'description',
            label: german ? 'Beschreibung' : 'Description',
            button: german ? 'Beschreibung kopieren' : 'Copy description',
            value: pin.description,
            rows: 4,
          },
          {
            key: 'link',
            label: german ? 'Link zum Rezept' : 'Recipe link',
            button: german ? 'Pinterest-Link kopieren' : 'Copy Pinterest link',
            value: pin.link,
            rows: 3,
          },
        ].map((field) => (
          <div className={styles.pinField} key={field.key}>
            <label htmlFor={`${pinId}-${field.key}`}>{field.label}</label>
            <textarea
              id={`${pinId}-${field.key}`}
              className={styles.pinText}
              readOnly
              value={field.value}
              rows={field.rows}
              onFocus={(event) => event.target.select()}
            />
            <div className={styles.actions}>
              <button type="button" onClick={() => copy(field.value)}>
                {field.button}
              </button>
            </div>
          </div>
        ))}
        <p className={styles.pinNote}>
          {german
            ? 'Prüfe den Text und wähle eine passende Pinnwand. Kennzeichne ein mit KI erstelltes oder bearbeitetes Originalfoto beim Veröffentlichen als KI-modifiziert.'
            : 'Review the text and choose a suitable board. If the original photo was made or edited with AI, mark it as AI-modified when publishing.'}
        </p>
      </section>
      {manualText && (
        <textarea
          className={styles.manualText}
          readOnly
          value={manualText}
          aria-label={german ? 'Text zum Kopieren' : 'Text to copy'}
          onFocus={(event) => event.target.select()}
        />
      )}
      <p className={styles.status} role="status">
        {message}
      </p>
    </details>
  );
}
