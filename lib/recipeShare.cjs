const SHARE_WIDTH = 1080;
const SHARE_HEIGHT = 1350;
const PIN_WIDTH = 1000;
const PIN_HEIGHT = 1500;

function getShareSize(format = 'instagram') {
  if (format === 'instagram')
    return { width: SHARE_WIDTH, height: SHARE_HEIGHT };
  if (format === 'pinterest') return { width: PIN_WIDTH, height: PIN_HEIGHT };
  throw new Error('Unknown recipe image format.');
}

function shortenText(text, limit) {
  const points = Array.from(text);
  return points.length > limit
    ? points
        .slice(0, limit - 1)
        .join('')
        .trimEnd() + '…'
    : text;
}

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

function buildPinterestDetails({
  title = '',
  description = '',
  canonicalUrl,
  locale = 'en',
}) {
  const url = new URL(canonicalUrl);
  if (url.protocol !== 'https:' || url.username || url.password)
    throw new Error('A secure recipe link is required.');
  const language = locale === 'de' ? 'de' : 'en';
  // Only the public recipe path and language identify this Pin, never a reader.
  url.search = '';
  url.hash = '';
  url.searchParams.set('utm_source', 'pinterest');
  url.searchParams.set('utm_medium', 'social');
  url.searchParams.set('utm_campaign', 'recipe_discovery');
  url.searchParams.set(
    'utm_content',
    `${url.pathname.split('/').filter(Boolean).at(-1)}_${language}`
  );
  const cleanDescription = description.replace(/\s+/g, ' ').trim();
  return {
    title: shortenText(shareTitle(title), 100),
    description: shortenText(
      cleanDescription ||
        (language === 'de'
          ? 'Zutaten und Schritt-für-Schritt-Anleitung für dieses Rezept bei Hansik Young.'
          : 'Find the ingredients and step-by-step instructions for this recipe at Hansik Young.'),
      800
    ),
    link: url.href,
  };
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
  return result.map((text, index) => {
    if (
      ctx.measureText(text).width <= width &&
      !(index === result.length - 1 && lines.length > maxLines)
    )
      return text;
    const points = Array.from(text);
    while (
      points.length &&
      ctx.measureText(points.join('') + '…').width > width
    )
      points.pop();
    return points.join('') + '…';
  });
}

function drawShareCard(
  ctx,
  image,
  { title, canonicalUrl, locale = 'en', format = 'instagram' }
) {
  const size = getShareSize(format);
  const pin = format === 'pinterest';
  const inset = 56;
  const textWidth = size.width - inset * 2;
  const photo = pin
    ? { x: 50, y: 390, width: 900, height: 820 }
    : { x: 40, y: 110, width: 1000, height: 800 };
  const width = image.naturalWidth || image.width;
  const height = image.naturalHeight || image.height;
  if (!(width > 0 && height > 0))
    throw new Error('The recipe photo could not be loaded.');
  const url = new URL(canonicalUrl);
  if (url.protocol !== 'https:')
    throw new Error('A secure recipe link is required.');
  ctx.fillStyle = '#f8f6ef';
  ctx.fillRect(0, 0, size.width, size.height);
  ctx.fillStyle = '#31543e';
  ctx.font = 'bold 42px sans-serif';
  ctx.fillText('Hansik Young', 56, 76);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(photo.x, photo.y, photo.width, photo.height);
  // Fit the complete existing photo; do not invent or remove food in the picture.
  const scale = Math.min(photo.width / width, photo.height / height);
  const fittedWidth = width * scale;
  const fittedHeight = height * scale;
  ctx.drawImage(
    image,
    photo.x + (photo.width - fittedWidth) / 2,
    photo.y + (photo.height - fittedHeight) / 2,
    fittedWidth,
    fittedHeight
  );
  ctx.fillStyle = '#31543e';
  ctx.font = 'bold 22px sans-serif';
  ctx.fillText(
    locale === 'de' ? 'AUS MEINER KÜCHE' : 'FROM MY KITCHEN',
    56,
    pin ? 142 : 956
  );
  ctx.fillStyle = '#262626';
  ctx.font = pin ? 'bold 52px sans-serif' : 'bold 48px sans-serif';
  const lines = wrapCanvasText(ctx, shareTitle(title), textWidth, 3);
  lines.forEach((line, index) =>
    ctx.fillText(line, inset, (pin ? 210 : 1022) + index * 62)
  );
  ctx.fillStyle = '#31543e';
  ctx.font = '24px sans-serif';
  ctx.fillText(
    locale === 'de'
      ? 'Zutaten, Schritte und Küchentipps'
      : 'Ingredients, steps and kitchen tips',
    56,
    pin ? 1280 : 1240
  );
  ctx.font = '20px sans-serif';
  const links = wrapCanvasText(
    ctx,
    pin ? url.host : url.host + url.pathname,
    textWidth,
    2
  );
  links.forEach((line, index) =>
    ctx.fillText(line, inset, (pin ? 1340 : 1285) + index * 26)
  );
}

module.exports = {
  SHARE_WIDTH,
  SHARE_HEIGHT,
  PIN_WIDTH,
  PIN_HEIGHT,
  getShareSize,
  shareTitle,
  buildShareCaption,
  buildPinterestDetails,
  wrapCanvasText,
  drawShareCard,
};
