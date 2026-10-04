const SHARE_WIDTH = 1080;
const SHARE_HEIGHT = 1350;

function shareTitle(title = '') {
  return title.split('(')[0].trim() || title.trim();
}

function buildShareCaption({
  title,
  description = '',
  canonicalUrl,
  locale = 'en',
}) {
  const clean = description.replace(/\s+/g, ' ').trim();
  const sentence = clean.match(/^.*?[.!?](?:\s|$)/)?.[0]?.trim() || clean;
  const excerpt =
    sentence.length > 220 ? sentence.slice(0, 217).trim() + '…' : sentence;
  return [
    shareTitle(title),
    excerpt,
    `${locale === 'de' ? 'Das ganze Rezept' : 'Full recipe'}: ${canonicalUrl}`,
  ]
    .filter(Boolean)
    .join('\n\n');
}

function wrapCanvasText(ctx, text, width, maxLines) {
  const words = text.trim().split(/\s+/);
  const lines = [];
  let line = '';
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (ctx.measureText(next).width <= width || !line) line = next;
    else {
      lines.push(line);
      line = word;
    }
  }
  if (line) lines.push(line);
  const result = lines.slice(0, maxLines);
  if (
    lines.length > maxLines ||
    ctx.measureText(result.at(-1) || '').width > width
  ) {
    let last = result.at(-1) || '';
    while (last && ctx.measureText(last + '…').width > width)
      last = last.slice(0, -1);
    result[result.length - 1] = last + '…';
  }
  return result;
}

function drawShareCard(ctx, image, { title, canonicalUrl, locale = 'en' }) {
  const width = image.naturalWidth || image.width;
  const height = image.naturalHeight || image.height;
  if (!(width > 0 && height > 0))
    throw new Error('The recipe photo could not be loaded.');
  const url = new URL(canonicalUrl);
  if (url.protocol !== 'https:')
    throw new Error('A secure recipe link is required.');
  ctx.fillStyle = '#f8f6ef';
  ctx.fillRect(0, 0, SHARE_WIDTH, SHARE_HEIGHT);
  ctx.fillStyle = '#31543e';
  ctx.font = 'bold 42px sans-serif';
  ctx.fillText('Hansik Young', 56, 76);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(40, 110, 1000, 800);
  // Fit the complete existing photo; do not invent or remove food in the picture.
  const scale = Math.min(1000 / width, 800 / height);
  const fittedWidth = width * scale;
  const fittedHeight = height * scale;
  ctx.drawImage(
    image,
    40 + (1000 - fittedWidth) / 2,
    110 + (800 - fittedHeight) / 2,
    fittedWidth,
    fittedHeight
  );
  ctx.fillStyle = '#31543e';
  ctx.font = 'bold 22px sans-serif';
  ctx.fillText(
    locale === 'de' ? 'AUS MEINER KÜCHE' : 'FROM MY KITCHEN',
    56,
    956
  );
  ctx.fillStyle = '#262626';
  ctx.font = 'bold 48px sans-serif';
  const lines = wrapCanvasText(ctx, shareTitle(title), 968, 3);
  lines.forEach((line, index) => ctx.fillText(line, 56, 1022 + index * 62));
  ctx.fillStyle = '#31543e';
  ctx.font = '24px sans-serif';
  ctx.fillText(
    locale === 'de'
      ? 'Zutaten, Schritte und Küchentipps'
      : 'Ingredients, steps and kitchen tips',
    56,
    1240
  );
  ctx.font = '20px sans-serif';
  const links = wrapCanvasText(ctx, url.host + url.pathname, 968, 2);
  links.forEach((line, index) => ctx.fillText(line, 56, 1285 + index * 26));
}

module.exports = {
  SHARE_WIDTH,
  SHARE_HEIGHT,
  shareTitle,
  buildShareCaption,
  wrapCanvasText,
  drawShareCard,
};
