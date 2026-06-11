import { fetchTmdbPages } from './tmdbPagination';

export const GENRE_MAP = {
  28: 'Action',
  12: 'Adventure',
  16: 'Animation',
  35: 'Comedy',
  80: 'Crime',
  99: 'Documentary',
  18: 'Drama',
  10751: 'Family',
  14: 'Fantasy',
  36: 'History',
  27: 'Horror',
  10402: 'Music',
  9648: 'Mystery',
  10749: 'Romance',
  878: 'Sci-Fi',
  10770: 'TV Movie',
  53: 'Thriller',
  10752: 'War',
  37: 'Western',
};

export function mapDiscoverMovie(item, extras = {}) {
  return {
    id: item.id,
    title: item.title,
    image: item.poster_path
      ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
      : 'https://via.placeholder.com/300x450?text=No+Poster',
    releaseDate: item.release_date || 'TBA',
    genre: GENRE_MAP[item.genre_ids?.[0]] || 'Indian Cinema',
    rating: item.vote_average,
    revenue:
      item.revenue > 0 ? `₹${(item.revenue / 10000000).toFixed(1)} Cr` : 'Blockbuster',
    ...extras,
  };
}

export async function fetchDiscoverMovies(apiKey, queryParams, { maxPages } = {}) {
  const buildUrl = (page) => {
    const params = new URLSearchParams({
      api_key: apiKey,
      region: 'IN',
      with_origin_country: 'IN',
      page: String(page),
      ...queryParams,
    });
    return `https://api.themoviedb.org/3/discover/movie?${params}`;
  };

  const pages = await fetchTmdbPages(buildUrl, { maxPages });

  const seen = new Set();
  const movies = [];

  for (const data of pages) {
    for (const item of data.results || []) {
      if (!item.poster_path || seen.has(item.id)) continue;
      seen.add(item.id);
      movies.push(item);
    }
  }

  return movies;
}
