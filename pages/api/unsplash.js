// pages/api/unsplash.js
export default async function handler(req, res) {
  const { query, count = 12, page = 1 } = req.query;

  const accessKey = process.env.UNSPLASH_ACCESS_KEY;
  if (!accessKey) {
    return res.status(500).json({ error: 'Missing Unsplash API key' });
  }

  try {
    const url = `https://api.unsplash.com/search/photos?query=${query}&per_page=${count}&page=${page}&client_id=${accessKey}`;

    const response = await fetch(url);
    if (!response.ok) {
      return res.status(500).json({ error: 'Failed to fetch Unsplash' });
    }

    const data = await response.json();
    const results = data.results || [];

    return res.status(200).json(results);
  } catch (err) {
    return res.status(500).json({ error: 'Server error' });
  }
}
