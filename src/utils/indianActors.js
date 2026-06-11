import { fetchTmdbPages } from './tmdbPagination';

const INDIAN_LANGUAGES = ['hi', 'ta', 'te', 'ml', 'kn', 'bn', 'mr', 'gu', 'pa'];

export function isIndianPerson(person) {
  return person.known_for?.some(
    (m) =>
      m.origin_country?.includes('IN') ||
      INDIAN_LANGUAGES.includes(m.original_language)
  );
}

export async function fetchIndianActors(apiKey, { maxPages } = {}) {
  const buildUrl = (page) =>
    `https://api.themoviedb.org/3/person/popular?api_key=${apiKey}&language=en-US&page=${page}`;

  const pages = await fetchTmdbPages(buildUrl, { maxPages });

  const seen = new Set();
  const actors = [];

  for (const data of pages) {
    for (const person of data.results || []) {
      if (seen.has(person.id) || !person.profile_path || !isIndianPerson(person)) {
        continue;
      }
      seen.add(person.id);
      actors.push({
        id: person.id,
        name: person.name,
        image: `https://image.tmdb.org/t/p/w500${person.profile_path}`,
        trendingScore: Math.round(person.popularity),
      });
    }
  }

  return actors;
}
