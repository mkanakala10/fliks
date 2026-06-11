/** TMDB allows up to 500 pages; we only need enough to fill the horizontal scroller. */
export const TMDB_DEFAULT_MAX_PAGES = 5;

export async function fetchTmdbPages(buildUrl, { maxPages = TMDB_DEFAULT_MAX_PAGES } = {}) {
  const firstRes = await fetch(buildUrl(1));
  const first = await firstRes.json();
  if (!firstRes.ok) {
    throw new Error(first.status_message || 'TMDB request failed');
  }

  const totalPages = first.total_pages || 1;
  const pagesToFetch = Math.min(totalPages, maxPages);
  const pages = [first];

  if (pagesToFetch > 1) {
    const rest = await Promise.all(
      Array.from({ length: pagesToFetch - 1 }, (_, i) =>
        fetch(buildUrl(i + 2)).then((r) => r.json())
      )
    );
    pages.push(...rest);
  }

  return pages;
}
