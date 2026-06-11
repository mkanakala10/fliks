import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Header from '../components/Header';
import SectionHeader from '../components/SectionHeader';
import MovieCard from '../components/MovieCard';
import { useWatchLater } from '../contexts/WatchLaterContext';

function WatchLater({ onViewMovie, onRate, ratings = {} }) {
  const { watchLater, removeFromWatchLater } = useWatchLater();

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
              title="Watch Later"
              subtitle="Movies you've marked to watch next. Tap Remove to keep your list tidy."
            />
          </Box>

          {watchLater.length === 0 ? (
            <Box sx={{ py: 10, textAlign: 'center' }}>
              <Typography fontSize="1.2rem" fontWeight="bold" mb={1}>
                Your watchlist is empty
              </Typography>
              <Typography sx={{ color: 'grey.400' }}>
                Add movies by tapping the Watchlist button on any movie card.
              </Typography>
            </Box>
          ) : (
            <Box component="section" pb={8}>
              <Grid container spacing={3} justifyContent="center">
                {watchLater.map((movie) => (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={movie.id}>
                    <MovieCard
                      movie={{ ...movie, ratingValue: ratings[movie.id] || 0 }}
                      variant="upcoming"
                      isInWatchlist
                      onRemoveFromWatchlist={() => removeFromWatchLater(movie.id)}
                      onViewDetails={() => onViewMovie?.(movie.id)}
                      onRate={onRate}
                    />
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}
        </Stack>
      </Container>
    </Box>
  );
}

export default WatchLater;
