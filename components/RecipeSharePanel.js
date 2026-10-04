import React, { useState } from 'react';
import recipeShare from '../lib/recipeShare.cjs';
import styles from '../styles/RecipeSharePanel.module.css';

const { SHARE_WIDTH, SHARE_HEIGHT, buildShareCaption, drawShareCard } =
  recipeShare;

export default function RecipeSharePanel({
  title,
  description,
  canonicalUrl,
  imageUrl,
  slug,
  locale,
}) {
  const german = locale === 'de';
  const caption = buildShareCaption({
    title,
    description,
    canonicalUrl,
    locale,
  });
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
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

  async function download() {
    setBusy(true);
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
      canvas.width = SHARE_WIDTH;
      canvas.height = SHARE_HEIGHT;
      const context = canvas.getContext('2d');
      if (!context) throw new Error('Canvas unavailable');
      drawShareCard(context, image, { title, canonicalUrl, locale });
      const blob = await new Promise((resolve) =>
        canvas.toBlob(resolve, 'image/png')
      );
      if (!blob) throw new Error('Image export failed');
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `hansik-${slug}-${locale}.png`;
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
      setBusy(false);
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
          <button type="button" onClick={download} disabled={busy}>
            {busy
              ? german
                ? 'Bild wird erstellt…'
                : 'Preparing image…'
              : german
                ? 'Rezeptbild herunterladen'
                : 'Download recipe image'}
          </button>
        )}
      </div>
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
