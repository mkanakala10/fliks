import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Select from '@mui/material/Select';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Avatar from '@mui/material/Avatar';
import PageShell from '../components/PageShell';
import MovieCard from '../components/MovieCard';
import HorizontalScroller from '../components/HorizontalScroller';
import ForYouPanel from '../components/ForYouPanel';
import Button from '../components/Button';
import { useAuth } from '../contexts/AuthContext';
import { useUserData } from '../contexts/UserDataContext';

const GENRE_MAP = {
  28: 'Action', 12: 'Adventure', 16: 'Animation', 35: 'Comedy',
  80: 'Crime', 99: 'Documentary', 18: 'Drama', 10751: 'Family',
  14: 'Fantasy', 36: 'History', 27: 'Horror', 10402: 'Music',
  9648: 'Mystery', 10749: 'Romance', 878: 'Sci-Fi', 10770: 'TV Movie',
  53: 'Thriller', 10752: 'War', 37: 'Western',
};

function Account({ onViewMovie, onRate }) {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [accountMenuAnchor, setAccountMenuAnchor] = useState(null);
  const { user, isAuthenticated, logout } = useAuth();
  const { ratings, watchLater, loading, syncError, removeFromWatchLater } = useUserData();

  const openAccountMenu = (event) => setAccountMenuAnchor(event.currentTarget);
  const closeAccountMenu = () => setAccountMenuAnchor(null);
  const handleOpenSettings = () => {
    closeAccountMenu();
    navigate('/settings');
  };
  const handleSignOut = async () => {
    closeAccountMenu();
    await logout();
    navigate('/');
  };

  const tabFromParams = searchParams.get('tab');
  const resolveTab = (param) => {
    if (param === 'watchlist') return 'watchlist';
    if (param === 'for-you') return 'for-you';
    return 'ratings';
  };
  const [tab, setTab] = useState(() => resolveTab(tabFromParams));
  const [sortBy, setSortBy] = useState('rating');
  const [ratedMovies, setRatedMovies] = useState([]);
  const [loadingMovies, setLoadingMovies] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/signup', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    setTab(resolveTab(searchParams.get('tab')));
  }, [searchParams]);

  useEffect(() => {
    if (tab !== 'ratings') return undefined;

    const loadRatedMovies = async () => {
      setLoadingMovies(true);
      try {
        const apiKey = import.meta.env.VITE_TMDB_API_KEY;
        if (!apiKey) return;

        const ratedIds = Object.keys(ratings).filter((id) => ratings[id] > 0);
        if (ratedIds.length === 0) {
          setRatedMovies([]);
          return;
        }

        const movies = await Promise.all(
          ratedIds.map(async (movieId) => {
            try {
              const res = await fetch(
                `https://api.themoviedb.org/3/movie/${movieId}?api_key=${apiKey}`
              );
              if (!res.ok) throw new Error('Not found');
              const data = await res.json();
              return {
                id: data.id,
                title: data.title,
                image: data.poster_path
                  ? `https://image.tmdb.org/t/p/w500${data.poster_path}`
                  : 'https://via.placeholder.com/300x450?text=No+Poster',
                releaseDate: data.release_date || 'TBA',
                rating: data.vote_average,
                revenue: data.revenue
                  ? `₹${(data.revenue / 10000000).toFixed(1)} Cr`
                  : 'N/A',
                genre: GENRE_MAP[data.genres?.[0]?.id] || 'Cinema',
              };
            } catch {
              return null;
            }
          })
        );

        const validMovies = movies
          .filter((movie) => movie !== null)
          .map((movie) => ({ ...movie, ratingValue: ratings[movie.id] ?? ratings[String(movie.id)] }));

        let sorted = [...validMovies];
        if (sortBy === 'rating') {
          sorted.sort((a, b) => (b.ratingValue || 0) - (a.ratingValue || 0));
        } else if (sortBy === 'title') {
          sorted.sort((a, b) => a.title.localeCompare(b.title));
        } else if (sortBy === 'recent') {
          sorted.sort((a, b) => new Date(b.releaseDate) - new Date(a.releaseDate));
        }

        setRatedMovies(sorted);
      } finally {
        setLoadingMovies(false);
      }
    };

    if (!loading) loadRatedMovies();
  }, [ratings, sortBy, tab, loading]);

  const handleTabChange = (_, value) => {
    setTab(value);
    if (value === 'watchlist') {
      setSearchParams({ tab: 'watchlist' });
    } else if (value === 'for-you') {
      setSearchParams({ tab: 'for-you' });
    } else {
      setSearchParams({});
    }
  };

  if (!isAuthenticated) return <PageShell loading />;

  return (
    <PageShell>
      <Container maxWidth="xl">
        <Stack spacing={4} py={{ xs: 4, md: 6 }}>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            alignItems={{ xs: 'flex-start', sm: 'center' }}
            justifyContent="space-between"
          >
            <Stack direction="row" spacing={2} alignItems="center">
              <Avatar
                sx={{
                  width: 48,
                  height: 48,
                  bgcolor: 'primary.main',
                  color: 'primary.contrastText',
                  fontWeight: 700,
                }}
              >
                {(user?.displayName || user?.email || 'U').charAt(0).toUpperCase()}
              </Avatar>
              <Box>
                <Typography variant="h5" fontWeight={700} letterSpacing="-0.02em">
                  My Account
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {user?.email}
                </Typography>
              </Box>
            </Stack>
            <Stack direction="row" spacing={1} alignItems="center">
              <Button variant="secondary" size="sm" onClick={openAccountMenu}>
                Account actions
              </Button>
              <Menu
                anchorEl={accountMenuAnchor}
                open={Boolean(accountMenuAnchor)}
                onClose={closeAccountMenu}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
              >
                <MenuItem onClick={handleOpenSettings}>Settings</MenuItem>
                <MenuItem onClick={handleSignOut}>Sign out</MenuItem>
              </Menu>
            </Stack>
          </Stack>

          {syncError && <Alert severity="warning">{syncError}</Alert>}

          <Tabs value={tab} onChange={handleTabChange} sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tab value="ratings" label={`My Ratings (${Object.values(ratings).filter((v) => v > 0).length})`} />
            <Tab value="watchlist" label={`Watch List (${watchLater.length})`} />
            <Tab value="for-you" label="For You" />
          </Tabs>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
              <CircularProgress size={44} color="primary" thickness={4} />
            </Box>
          ) : tab === 'for-you' ? (
            <ForYouPanel onViewMovie={onViewMovie} onRate={onRate} ratings={ratings} />
          ) : tab === 'ratings' ? (
            loadingMovies ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
                <CircularProgress size={44} color="primary" thickness={4} />
              </Box>
            ) : ratedMovies.length === 0 ? (
              <Box sx={{ py: 8, textAlign: 'center' }}>
                <Typography fontSize="1.1rem" fontWeight={600} mb={1}>
                  No rated movies yet
                </Typography>
                <Typography color="text.secondary">
                  Rate movies from any card — your scores are saved to your account.
                </Typography>
              </Box>
            ) : (
              <Box>
                <Box sx={{ mb: 3, display: 'flex', justifyContent: 'flex-end' }}>
                  <FormControl sx={{ minWidth: 200 }} size="small">
                    <InputLabel>Sort By</InputLabel>
                    <Select value={sortBy} onChange={(e) => setSortBy(e.target.value)} label="Sort By">
                      <MenuItem value="rating">Highest Rated</MenuItem>
                      <MenuItem value="title">Title (A-Z)</MenuItem>
                      <MenuItem value="recent">Recently Released</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
                <HorizontalScroller
                  items={ratedMovies}
                  getKey={(movie) => movie.id}
                  renderItem={(movie) => (
                    <MovieCard
                      movie={movie}
                      onViewDetails={() => onViewMovie?.(movie.id)}
                      onRate={onRate}
                    />
                  )}
                />
              </Box>
            )
          ) : watchLater.length === 0 ? (
            <Box sx={{ py: 8, textAlign: 'center' }}>
              <Typography fontSize="1.1rem" fontWeight={600} mb={1}>
                Your watch list is empty
              </Typography>
              <Typography color="text.secondary">
                Add movies with the Watchlist button — they sync to your account.
              </Typography>
            </Box>
          ) : (
            <HorizontalScroller
              items={watchLater}
              getKey={(movie) => movie.id}
              renderItem={(movie) => (
                <MovieCard
                  movie={{
                    ...movie,
                    ratingValue: (ratings[movie.id] ?? ratings[String(movie.id)]) || 0,
                  }}
                  variant="upcoming"
                  isInWatchlist
                  onRemoveFromWatchlist={() => removeFromWatchLater(movie.id)}
                  onViewDetails={() => onViewMovie?.(movie.id)}
                  onRate={onRate}
                />
              )}
            />
          )}
        </Stack>
      </Container>
    </PageShell>
  );
}

export default Account;
