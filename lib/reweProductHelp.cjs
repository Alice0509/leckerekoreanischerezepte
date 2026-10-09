// The fallback uses the ordinary product URL, never an affiliate redirect.
function getReweProductHelp(store, locale) {
  if (locale !== 'de' || !store?.productTitle?.trim()) return null;
  try {
    const url = new URL(store.sourceUrl);
    if (
      url.origin !== 'https://www.rewe.de' ||
      url.username ||
      url.password ||
      url.search ||
      url.hash ||
      !/^\/shop\/p\/[^/]+\/\d+\/?$/.test(url.pathname)
    )
      return null;
    return { productTitle: store.productTitle, webUrl: url.href };
  } catch {
    return null;
  }
}

module.exports = { getReweProductHelp };
