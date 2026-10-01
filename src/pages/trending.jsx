import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import PageShell from '../components/PageShell';
import PageHeading from '../components/PageHeading';
import MovieCard from '../components/MovieCard';
import HorizontalScroller from '../components/HorizontalScroller';
import { useWatchLater } from '../contexts/WatchLaterContext';
import { fetchDiscoverMovies, mapDiscoverMovie } from '../utils/tmdbMovies';

function Trending({ onViewMovie, onRate, ratings = {} }) {
  const [movies, setMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { addToWatchLater, removeFromWatchLater, isInWatchLater } = useWatchLater();

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
        const results = await fetchDiscoverMovies(apiKey, {
          primary_release_year: String(new Date().getFullYear()),
          sort_by: 'popularity.desc',
        });
        setMovies(results.map((item) => mapDiscoverMovie(item)));
      } catch (fetchError) {
        setError(fetchError.message || 'Unable to load trending movies.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTrending();
  }, []);

  return (
    <PageShell>
      <Container maxWidth="xl">
        <Stack spacing={0}>
          <Box component="section" py={{ xs: 4, md: 6 }}>
            <PageHeading
              title="Trending Indian films"
              subtitle="Explore the Indian films people are following this year."
            />
          </Box>

          {error && (
            <Box px={2} pb={3}>
              <Alert severity="error">{error}</Alert>
            </Box>
          )}

          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
              <CircularProgress size={44} color="primary" thickness={4} />
            </Box>
          ) : movies.length > 0 ? (
            <Box component="section" pb={8}>
              <HorizontalScroller
                items={movies}
                getKey={(movie) => movie.id}
                renderItem={(movie, index) => (
                  <MovieCard
                    movie={{ ...movie, ratingValue: ratings[movie.id] || 0 }}
                    variant="upcoming"
                    rank={index + 1}
                    onAddToWatchlist={() => addToWatchLater(movie)}
                      onRemoveFromWatchlist={() => removeFromWatchLater(movie.id)}
                    isInWatchlist={isInWatchLater(movie.id)}
                    onRate={onRate}
                    onViewDetails={() => onViewMovie?.(movie.id)}
                  />
                )}
                emptyMessage="No trending films are available right now."
              />
            </Box>
          ) : (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
              <Typography fontSize="1.2rem">No trending films are available right now.</Typography>
            </Box>
          )}
        </Stack>
      </Container>
    </PageShell>
  );
}

export default Trending;
