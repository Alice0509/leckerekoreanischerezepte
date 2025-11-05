///pages/api/unsplash.js
export default async function handler(req, res) {
  const { query = 'korean food', count = 9 } = req.query;
  const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(
    query
  )}&per_page=${count}`;

  try {
    const r = await fetch(url, {
      headers: {
        Authorization: `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}`,
      },
    });
    const { results = [] } = await r.json();
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
    res.status(200).json(results);
  } catch (e) {
    res.status(500).json({ error: 'Unsplash fetch failed' });
  }
}
