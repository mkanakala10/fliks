import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Header from '../components/Header';
import SectionHeader from '../components/SectionHeader';
import MovieCard from '../components/MovieCard';
import { useWatchLater } from '../contexts/WatchLaterContext';

const GENRE_MAP = {
  28: 'Action', 12: 'Adventure', 16: 'Animation', 35: 'Comedy',
  80: 'Crime', 99: 'Documentary', 18: 'Drama', 10751: 'Family',
  14: 'Fantasy', 36: 'History', 27: 'Horror', 10402: 'Music',
  9648: 'Mystery', 10749: 'Romance', 878: 'Sci-Fi', 10770: 'TV Movie',
  53: 'Thriller', 10752: 'War', 37: 'Western',
};

function Trending({ onViewMovie, onRate, ratings = {} }) {
  const [movies, setMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { addToWatchLater, isInWatchLater } = useWatchLater();

  useEffect(() => {
    const apiKey = import.meta.env.VITE_TMDB_API_KEY;
    if (!apiKey) {
      setError('Missing TMDB API key. Add VITE_TMDB_API_KEY to your .env file.');
      setIsLoading(false);
      return;
    }

    const fetchTrending = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const url = `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&region=IN&with_origin_country=IN&primary_release_year=2026&sort_by=popularity.desc`;
        const res = await fetch(url);
        const data = await res.json();
        if (!res.ok) throw new Error(data.status_message || 'Failed to fetch movies');

        setMovies(
          (data.results || []).slice(0, 10).map((item) => ({
            id: item.id,
            title: item.title,
            image: item.poster_path
              ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
              : 'https://via.placeholder.com/300x450?text=No+Poster',
            releaseDate: item.release_date || '2026-TBA',
            genre: GENRE_MAP[item.genre_ids?.[0]] || 'Indian Cinema',
          }))
        );
      } catch (fetchError) {
        setError(fetchError.message || 'Unable to load trending movies.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTrending();
  }, []);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg,#1a1a2e 0%,#16213e 50%,#0f3460 100%)',
        color: '#fff',
      }}
    >
      <Header />
      <Container maxWidth="xl">
        <Stack spacing={0}>
          <Box component="section" py={6} textAlign="center">
            <SectionHeader
              title="Top 10 Trending Indian Movies (2026)"
              subtitle="The most anticipated releases in India this year, powered by TMDb."
            />
          </Box>

          {error && (
            <Box px={2} pb={3}>
              <Alert severity="error">{error}</Alert>
            </Box>
          )}

          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
              <CircularProgress size={56} sx={{ color: '#64b5f6' }} thickness={4} />
            </Box>
          ) : movies.length > 0 ? (
            <Box component="section" pb={8}>
              <Grid container spacing={3} justifyContent="center">
                {movies.map((movie, index) => (
                  <Grid item xs={12} sm={6} md={4} lg={2.4} key={movie.id}>
                    <MovieCard
                      movie={{ ...movie, ratingValue: ratings[movie.id] || 0 }}
                      variant="upcoming"
                      rank={index + 1}
                      onAddToWatchlist={() => addToWatchLater(movie)}
                      isInWatchlist={isInWatchLater(movie.id)}
                      onRate={onRate}
                      onViewDetails={() => onViewMovie?.(movie.id)}
                    />
                  </Grid>
                ))}
              </Grid>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
              <Typography fontSize="1.2rem">No upcoming movies found for 2026 yet!</Typography>
            </Box>
          )}
        </Stack>
      </Container>
    </Box>
  );
}

export default Trending;
