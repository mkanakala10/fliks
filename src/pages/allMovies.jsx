import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import PageShell from '../components/PageShell';
import SectionHeader from '../components/SectionHeader';
import MovieCard from '../components/MovieCard';
import Button from '../components/Button';
import { useWatchLater } from '../contexts/WatchLaterContext';

const GENRE_MAP = {
  28: 'Action', 12: 'Adventure', 16: 'Animation', 35: 'Comedy',
  80: 'Crime', 99: 'Documentary', 18: 'Drama', 10751: 'Family',
  14: 'Fantasy', 36: 'History', 27: 'Horror', 10402: 'Music',
  9648: 'Mystery', 10749: 'Romance', 878: 'Sci-Fi', 53: 'Thriller',
  10752: 'War', 37: 'Western',
};

const SORT_OPTIONS = [
  { label: 'Most Popular', value: 'popularity.desc' },
  { label: 'Highest Rated', value: 'vote_average.desc' },
  { label: 'Newest First', value: 'release_date.desc' },
  { label: 'Box Office', value: 'revenue.desc' },
];

const LANGUAGE_OPTIONS = [
  { label: 'All', value: '' },
  { label: 'Hindi', value: 'hi' },
  { label: 'Tamil', value: 'ta' },
  { label: 'Telugu', value: 'te' },
  { label: 'Malayalam', value: 'ml' },
  { label: 'Kannada', value: 'kn' },
];

function AllMovies({ onViewMovie, onRate, ratings = {} }) {
  const [movies, setMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState('popularity.desc');
  const [language, setLanguage] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { addToWatchLater, isInWatchLater } = useWatchLater();

  useEffect(() => {
    const apiKey = import.meta.env.VITE_TMDB_API_KEY;
    if (!apiKey) {
      setError('Missing TMDB API key. Add VITE_TMDB_API_KEY to your .env file.');
      setIsLoading(false);
      return;
    }

    const fetchMovies = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const langParam = language
          ? `&with_original_language=${language}`
          : '&with_origin_country=IN';
        const url = `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&region=IN${langParam}&sort_by=${sortBy}&page=${page}&vote_count.gte=10`;
        const res = await fetch(url);
        const data = await res.json();
        if (!res.ok) throw new Error(data.status_message || 'Failed to fetch movies');

        setTotalPages(Math.min(data.total_pages || 1, 20));
        setMovies(
          (data.results || []).map((item) => ({
            id: item.id,
            title: item.title,
            image: item.poster_path
              ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
              : 'https://via.placeholder.com/300x450?text=No+Poster',
            releaseDate: item.release_date || 'TBA',
            genre: GENRE_MAP[item.genre_ids?.[0]] || 'Indian Cinema',
            rating: item.vote_average,
          }))
        );
      } catch (err) {
        setError(err.message || 'Unable to load movies.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMovies();
  }, [sortBy, language, page]);

  const changeFilter = (setter) => (value) => {
    setter(value);
    setPage(1);
  };

  return (
    <PageShell>
      <Container maxWidth="xl">
        <Stack spacing={0}>
          <Box component="section" py={6} textAlign="center">
            <SectionHeader
              title="All Indian Movies"
              subtitle="Browse the complete collection of Indian cinema"
            />

            <Stack spacing={2} mt={1} alignItems="center">
              <Stack direction="row" spacing={1} flexWrap="wrap" justifyContent="center">
                {LANGUAGE_OPTIONS.map((opt) => (
                  <Button
                    key={opt.value}
                    variant={language === opt.value ? 'primary' : 'secondary'}
                    size="sm"
                    onClick={() => changeFilter(setLanguage)(opt.value)}
                    sx={{ mb: 1 }}
                  >
                    {opt.label}
                  </Button>
                ))}
              </Stack>
              <Stack direction="row" spacing={1} flexWrap="wrap" justifyContent="center">
                {SORT_OPTIONS.map((opt) => (
                  <Button
                    key={opt.value}
                    variant={sortBy === opt.value ? 'primary' : 'secondary'}
                    size="sm"
                    onClick={() => changeFilter(setSortBy)(opt.value)}
                    sx={{ mb: 1 }}
                  >
                    {opt.label}
                  </Button>
                ))}
              </Stack>
            </Stack>
          </Box>

          {error && (
            <Box pb={3}>
              <Alert severity="error">{error}</Alert>
            </Box>
          )}

          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
              <CircularProgress size={44} color="primary" thickness={4} />
            </Box>
          ) : movies.length > 0 ? (
            <Box pb={6}>
              <Grid container spacing={3}>
                {movies.map((movie) => (
                  <Grid item xs={6} sm={2.4} md={2.4} lg={2.4} key={movie.id}>
                    <MovieCard
                      movie={{ ...movie, ratingValue: ratings[movie.id] || 0 }}
                      variant="upcoming"
                      onAddToWatchlist={() => addToWatchLater(movie)}
                      isInWatchlist={isInWatchLater(movie.id)}
                      onRate={onRate}
                      onViewDetails={() => onViewMovie?.(movie.id)}
                    />
                  </Grid>
                ))}
              </Grid>

              <Stack direction="row" justifyContent="center" alignItems="center" spacing={3} mt={6}>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  ← Previous
                </Button>
                <Typography color="text.secondary" fontWeight={600}>
                  Page {page} of {totalPages}
                </Typography>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  Next →
                </Button>
              </Stack>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
              <Typography fontSize="1.2rem">No movies found. Try a different filter.</Typography>
            </Box>
          )}
        </Stack>
      </Container>
    </PageShell>
  );
}

export default AllMovies;
