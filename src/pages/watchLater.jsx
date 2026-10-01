import { Link } from 'react-router-dom';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import PageShell from '../components/PageShell';
import PageHeading from '../components/PageHeading';
import MovieCard from '../components/MovieCard';
import Button from '../components/Button';
import { useAuth } from '../contexts/AuthContext';
import { useUserData } from '../contexts/UserDataContext';

function WatchLater({ onViewMovie, onRate, ratings = {} }) {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { watchLater, removeFromWatchLater, loading, syncError } = useUserData();
  if (authLoading || loading) return <PageShell loading />;
  return <PageShell>
    <Container maxWidth="xl" sx={{ py: { xs: 4, md: 6 } }}>
      <PageHeading title="Your watchlist" subtitle="Keep the films you want to see in one place." />
      {syncError && <Alert severity="error" sx={{ mt: 3 }}>Your watchlist couldn’t sync. Check your connection and try refreshing the page.</Alert>}
      {!isAuthenticated ? <Box sx={{ mt: 4, p: { xs: 3, md: 5 }, border: 1, borderColor: 'divider', borderRadius: '6px', bgcolor: 'background.paper' }}>
        <Typography component="h2" sx={{ fontSize: 22, fontWeight: 500, mb: 1 }}>A place for your next great film</Typography>
        <Typography sx={{ color: 'text.secondary', fontSize: 13, lineHeight: 1.8, mb: 3 }}>Sign in to save movies and keep your watchlist available across devices.</Typography>
        <Button component={Link} to="/signup">Sign in to save films</Button>
      </Box> : !syncError && watchLater.length === 0 ? <Box sx={{ mt: 4, py: 6, borderTop: 1, borderColor: 'divider' }}>
        <Typography component="h2" sx={{ fontSize: 22, fontWeight: 500, mb: 1 }}>Your watchlist is empty</Typography>
        <Typography sx={{ color: 'text.secondary', fontSize: 13, mb: 3 }}>Save a film from its movie page or use Watchlist on a movie card.</Typography>
        <Button component={Link} to="/all-movies" variant="secondary">Browse movies</Button>
      </Box> : <>
        <Typography sx={{ color: 'text.secondary', fontSize: 12, mt: 4, mb: 3 }}>{watchLater.length} saved {watchLater.length === 1 ? 'film' : 'films'}</Typography>
        <Box component="section" aria-label="Saved films" sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, minmax(0, 1fr))', sm: 'repeat(3, minmax(0, 1fr))', md: 'repeat(4, minmax(0, 1fr))', lg: 'repeat(6, minmax(0, 1fr))' }, gap: { xs: 2, md: 3 }, alignItems: 'start' }}>
          {watchLater.map((movie) => <MovieCard key={movie.id} movie={{ ...movie, ratingValue: ratings[movie.id] || 0 }} variant="upcoming" isInWatchlist onRemoveFromWatchlist={() => removeFromWatchLater(movie.id)} onViewDetails={() => onViewMovie?.(movie.id)} onRate={onRate} />)}
        </Box>
      </>}
    </Container>
  </PageShell>;
}
export default WatchLater;
