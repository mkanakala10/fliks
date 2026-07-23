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

export function isUnreleasedMovie(movieOrItem) {
  const dateStr = movieOrItem.release_date ?? movieOrItem.releaseDate;
  if (!dateStr || dateStr === 'TBA') return true;

  try {
    const release = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return release > today;
  } catch {
    return false;
  }
}

export function filterUnreleasedMovies(movies) {
  return movies.filter(isUnreleasedMovie);
}

export function getUpcomingReleaseDateFloor() {
  const tomorrow = new Date();
  tomorrow.setHours(0, 0, 0, 0);
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.toISOString().split('T')[0];
}

export const USD_TO_INR_RATE = 96;

export function formatUsdToInrCrores(usdAmount) {
  if (!usdAmount || usdAmount <= 0) return null;
  const inrAmount = usdAmount * USD_TO_INR_RATE;
  return `₹${(inrAmount / 10000000).toFixed(1)} Cr`;
}

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
    revenue: formatUsdToInrCrores(item.revenue) || 'Blockbuster',
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

export async function fetchHighestRoiMovies(apiKey) {
  const rawMovies = await fetchDiscoverMovies(apiKey, {
    sort_by: 'revenue.desc',
    'primary_release_date.gte': '2023-01-01',
  }, { maxPages: 2 });

  const detailPromises = rawMovies.slice(0, 40).map(async (movie) => {
    try {
      const res = await fetch(`https://api.themoviedb.org/3/movie/${movie.id}?api_key=${apiKey}`);
      if (!res.ok) return null;
      const data = await res.json();
      return data;
    } catch {
      return null;
    }
  });

  const detailedMovies = await Promise.all(detailPromises);

  const moviesWithRoi = detailedMovies
    .filter((m) => m && m.budget > 0 && m.revenue > 0)
    .map((m) => {
      const roiValue = ((m.revenue - m.budget) / m.budget) * 100;
      return {
        ...mapDiscoverMovie(m),
        revenue: `ROI: +${roiValue.toFixed(0)}%`,
        releaseDate: m.release_date || 'TBA',
        roi: roiValue,
      };
    });

  return moviesWithRoi.sort((a, b) => b.roi - a.roi);
}

export async function fetchDetailedBoxOfficeMovies(apiKey, queryParams) {
  const rawMovies = await fetchDiscoverMovies(apiKey, {
    sort_by: 'revenue.desc',
    ...queryParams,
  });

  const detailPromises = rawMovies.slice(0, 20).map(async (movie) => {
    try {
      const res = await fetch(`https://api.themoviedb.org/3/movie/${movie.id}?api_key=${apiKey}`);
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  });

  const detailedMovies = await Promise.all(detailPromises);
  return detailedMovies
    .filter((m) => m !== null)
    .map((m) => ({
      ...mapDiscoverMovie(m),
      revenue: formatUsdToInrCrores(m.revenue) || 'Blockbuster',
      budget: formatUsdToInrCrores(m.budget) || 'N/A',
      releaseDate: m.release_date || 'TBA',
    }));
}


