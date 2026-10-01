const portraits = new Map();

// Ignore tracking parameters when deciding whether an image has already failed.
export function portraitKey(source) {
  try {
    const url = new URL(source);
    return `${url.origin}${url.pathname}`;
  } catch {
    return source;
  }
}

export function fetchWikipediaPortraits(name) {
  const title = name?.trim();
  if (!title) return Promise.resolve([]);
  if (!portraits.has(title)) {
    const request = (async () => {
      try {
        const params = new URLSearchParams({
          action: 'query', format: 'json', formatversion: '2', origin: '*',
          titles: title, redirects: '1', prop: 'pageimages|pageprops',
          piprop: 'thumbnail|original', pithumbsize: '500', ppprop: 'disambiguation',
        });
        const response = await fetch(`https://en.wikipedia.org/w/api.php?${params}`, {
          signal: AbortSignal.timeout(8000),
        });
        if (!response.ok) return [];
        const data = await response.json();
        const page = data.query?.pages?.[0];
        // Never use an image from an ambiguous name's disambiguation page.
        if (!page || page.missing || page.pageprops?.disambiguation !== undefined) return [];
        return [...new Set([page.thumbnail?.source, page.original?.source])].filter((source) => {
          try {
            const url = new URL(source);
            return url.protocol === 'https:' && ['upload.wikimedia.org', 'thumb.wikimedia.org'].includes(url.hostname);
          } catch {
            return false;
          }
        });
      } catch {
        return [];
      }
    })();
    // Share in-flight lookups between cards and profiles; do not fetch for healthy images.
    portraits.set(title, request);
  }
  return portraits.get(title);
}
