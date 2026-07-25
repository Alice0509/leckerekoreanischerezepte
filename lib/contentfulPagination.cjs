const DEFAULT_LIMIT = 1000;

const getEntryKey = (entry) => {
  const id = entry?.sys?.id;
  const locale = entry?.sys?.locale || '';

  return id ? `${id}:${locale}` : null;
};

const mergeUniqueEntries = (targetMap, entries = []) => {
  for (const entry of entries) {
    const key = getEntryKey(entry);

    if (key && !targetMap.has(key)) {
      targetMap.set(key, entry);
    }
  }
};

async function fetchAllEntriesResponse(
  client,
  query = {},
  { limit = DEFAULT_LIMIT } = {}
) {
  const items = [];
  const includedEntries = new Map();
  const includedAssets = new Map();

  let skip = 0;
  let total = null;

  while (total === null || items.length < total) {
    const response = await client.getEntries({
      ...query,
      skip,
      limit,
    });

    const pageItems = Array.isArray(response.items) ? response.items : [];

    items.push(...pageItems);

    mergeUniqueEntries(includedEntries, response.includes?.Entry);

    mergeUniqueEntries(includedAssets, response.includes?.Asset);

    total = Number.isFinite(response.total) ? response.total : items.length;

    if (pageItems.length === 0) {
      break;
    }

    skip += pageItems.length;
  }

  const includes = {};

  if (includedEntries.size > 0) {
    includes.Entry = [...includedEntries.values()];
  }

  if (includedAssets.size > 0) {
    includes.Asset = [...includedAssets.values()];
  }

  return {
    items,
    total: total ?? items.length,
    skip: 0,
    limit,
    includes,
  };
}

async function fetchAllEntries(client, query = {}, options = {}) {
  const response = await fetchAllEntriesResponse(client, query, options);

  return response.items;
}

module.exports = {
  DEFAULT_LIMIT,
  fetchAllEntries,
  fetchAllEntriesResponse,
};
