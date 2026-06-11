const API_BASE =
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_SEARCH_API_URL ||
  'http://localhost:8000';

export async function semanticSearch(query, limit = 12) {
  const res = await fetch(
    `${API_BASE}/search?q=${encodeURIComponent(query)}&limit=${limit}`
  );
  if (!res.ok) throw new Error('Search request failed');
  return res.json();
}

export async function fetchSurveyCatalog() {
  const res = await fetch(`${API_BASE}/survey-catalog`);
  if (!res.ok) throw new Error('Catalog unavailable');
  return res.json();
}

export async function submitOnboarding(ratings) {
  const res = await fetch(`${API_BASE}/onboard`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ratings }),
  });
  if (!res.ok) throw new Error('Recommendation request failed');
  return res.json();
}

export { API_BASE };
