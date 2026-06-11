import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import PageShell from '../components/PageShell';
import SectionHeader from '../components/SectionHeader';
import MovieCard from '../components/MovieCard';
import HorizontalScroller from '../components/HorizontalScroller';
import { useWatchLater } from '../contexts/WatchLaterContext';

function WatchLater({ onViewMovie, onRate, ratings = {} }) {
  const { watchLater, removeFromWatchLater } = useWatchLater();

  return (
    <PageShell>
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
              <Typography color="text.secondary">
                Add movies by tapping the Watchlist button on any movie card.
              </Typography>
            </Box>
          ) : (
            <Box component="section" pb={8}>
              <HorizontalScroller
                items={watchLater}
                getKey={(movie) => movie.id}
                renderItem={(movie) => (
                  <MovieCard
                    movie={{ ...movie, ratingValue: ratings[movie.id] || 0 }}
                    variant="upcoming"
                    isInWatchlist
                    onRemoveFromWatchlist={() => removeFromWatchLater(movie.id)}
                    onViewDetails={() => onViewMovie?.(movie.id)}
                    onRate={onRate}
                  />
                )}
              />
            </Box>
          )}
        </Stack>
      </Container>
    </PageShell>
  );
}

export default WatchLater;
