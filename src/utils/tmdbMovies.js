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
    overview: item.overview || '',
    backdropPath: item.backdrop_path ? `https://image.tmdb.org/t/p/w1280${item.backdrop_path}` : null,
    image: item.poster_path
      ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
      : 'https://via.placeholder.com/300x450?text=No+Poster',
    releaseDate: item.release_date || 'TBA',
    genre: item.genres?.[0]?.name || GENRE_MAP[item.genre_ids?.[0]] || 'Indian Cinema',
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

export function getSixMonthsAgoReleaseDateFloor() {
  const d = new Date();
  d.setMonth(d.getMonth() - 6);
  return d.toISOString().split('T')[0];
}

export function getTodayReleaseDateCeiling() {
  const d = new Date();
  return d.toISOString().split('T')[0];
}

export async function fetchRecentReleaseMovies(apiKey) {
  const gte = getSixMonthsAgoReleaseDateFloor();
  const lte = getTodayReleaseDateCeiling();
  let rawMovies = await fetchDiscoverMovies(
    apiKey,
    {
      'primary_release_date.gte': gte,
      'primary_release_date.lte': lte,
      sort_by: 'revenue.desc',
    },
    { maxPages: 2 }
  );

  if (!rawMovies || rawMovies.length === 0) {
    rawMovies = await fetchDiscoverMovies(
      apiKey,
      {
        'primary_release_date.gte': gte,
        'primary_release_date.lte': lte,
        sort_by: 'popularity.desc',
      },
      { maxPages: 2 }
    );
  }

  const detailPromises = rawMovies.slice(0, 20).map(async (movie) => {
    try {
      const res = await fetch(`https://api.themoviedb.org/3/movie/${movie.id}?api_key=${apiKey}`);
      if (!res.ok) return movie;
      return await res.json();
    } catch {
      return movie;
    }
  });

  const detailedMovies = await Promise.all(detailPromises);

  const mapped = detailedMovies.map((m) => ({
    ...mapDiscoverMovie(m),
    revenue: formatUsdToInrCrores(m.revenue) || 'Blockbuster',
    budget: formatUsdToInrCrores(m.budget) || 'N/A',
    releaseDate: m.release_date || 'TBA',
    rawRevenue: m.revenue || 0,
  }));

  mapped.sort((a, b) => b.rawRevenue - a.rawRevenue);
  return mapped;
}


/** Use TMDB's now-playing window with Indian origin and theatrical-release filters. */
export async function fetchNowPlayingMovies(apiKey, { signal } = {}) {
  const params = new URLSearchParams({ api_key: apiKey, region: 'IN', language: 'en-US', page: '1' });
  const response = await fetch(`https://api.themoviedb.org/3/movie/now_playing?${params}`, { signal });
  if (!response.ok) throw new Error('Theater listings are currently unavailable.');
  const nowPlaying = await response.json();
  const { minimum, maximum } = nowPlaying.dates || {};
  if (!minimum || !maximum) throw new Error('Theater release dates are currently unavailable.');

  // Region selects where a movie is showing; origin selects where it was produced.
  const today = getTodayReleaseDateCeiling();
  const discoverParams = new URLSearchParams({
    api_key: apiKey,
    region: 'IN',
    with_origin_country: 'IN',
    with_release_type: '2|3',
    'release_date.gte': minimum,
    'release_date.lte': maximum < today ? maximum : today,
    include_adult: 'false',
    include_video: 'false',
    sort_by: 'popularity.desc',
    language: 'en-US',
    page: '1',
  });
  const discoverResponse = await fetch(`https://api.themoviedb.org/3/discover/movie?${discoverParams}`, { signal });
  if (!discoverResponse.ok) throw new Error('Theater listings are currently unavailable.');
  const data = await discoverResponse.json();
  const seen = new Set();
  return (data.results || []).filter((movie) => {
    if (movie.adult || !movie.poster_path || seen.has(movie.id)) return false;
    seen.add(movie.id);
    return true;
  }).map((movie) => mapDiscoverMovie(movie, { revenue: null }));
}
