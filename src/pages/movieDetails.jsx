import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Alert from '@mui/material/Alert';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PageShell from '../components/PageShell';
import Button from '../components/Button';
import { useWatchLater } from '../contexts/WatchLaterContext';
import { useNavigation } from '../contexts/NavigationContext';

function MovieDetails() {
  const { movieId: movieIdParam } = useParams();
  const movieId = Number(movieIdParam);
  const { onGoBack } = useNavigation();
  const [movie, setMovie] = useState(null);
  const [credits, setCredits] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { addToWatchLater, removeFromWatchLater, isInWatchLater } = useWatchLater();

  useEffect(() => {
    const apiKey = import.meta.env.VITE_TMDB_API_KEY;
    if (!apiKey || !movieId) {
      setError('Missing movie ID or TMDB API key.');
      setIsLoading(false);
      return;
    }

    const fetchDetails = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [movieRes, creditsRes] = await Promise.all([
          fetch(`https://api.themoviedb.org/3/movie/${movieId}?api_key=${apiKey}`),
          fetch(`https://api.themoviedb.org/3/movie/${movieId}/credits?api_key=${apiKey}`),
        ]);

        if (!movieRes.ok) throw new Error('Movie not found');

        const movieData = await movieRes.json();
        const creditsData = creditsRes.ok ? await creditsRes.json() : { cast: [] };

        setMovie({
          id: movieData.id,
          title: movieData.title,
          overview: movieData.overview,
          image: movieData.poster_path
            ? `https://image.tmdb.org/t/p/w500${movieData.poster_path}`
            : 'https://via.placeholder.com/300x450?text=No+Poster',
          backdrop: movieData.backdrop_path
            ? `https://image.tmdb.org/t/p/original${movieData.backdrop_path}`
            : null,
          releaseDate: movieData.release_date,
          runtime: movieData.runtime,
          rating: movieData.vote_average,
          voteCount: movieData.vote_count,
          genres: movieData.genres?.map((g) => g.name) || [],
          tagline: movieData.tagline,
          revenue: movieData.revenue,
          language: movieData.original_language?.toUpperCase(),
        });
        setCredits(creditsData);
      } catch (err) {
        setError(err.message || 'Unable to load movie details.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDetails();
  }, [movieId]);

  const handleWatchlist = () => {
    if (!movie) return;
    const card = {
      id: movie.id,
      title: movie.title,
      image: movie.image,
      genre: movie.genres[0] || 'Indian Cinema',
      releaseDate: movie.releaseDate,
    };
    if (isInWatchLater(movie.id)) {
      removeFromWatchLater(movie.id);
    } else {
      addToWatchLater(card);
    }
  };

  if (isLoading) return <PageShell loading />;

  if (error || !movie) {
    return (
      <PageShell>
        <Container maxWidth="md" sx={{ py: 8 }}>
          <Alert severity="error" sx={{ mb: 3 }}>
            {error || 'Movie not found'}
          </Alert>
          <Button variant="secondary" onClick={() => onGoBack?.()}>
            ← Back
          </Button>
        </Container>
      </PageShell>
    );
  }

  const cast = (credits?.cast || []).slice(0, 8);
  const inWatchlist = isInWatchLater(movie.id);

  return (
    <PageShell>
      {movie.backdrop && (
        <Box
          sx={{
            height: { xs: 180, md: 280 },
            backgroundImage: (theme) =>
              `linear-gradient(to bottom, transparent, ${theme.palette.background.default}), url(${movie.backdrop})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
      )}

      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => onGoBack?.()}
          sx={{ mb: 3 }}
        >
          <ArrowBackIcon sx={{ mr: 0.5, fontSize: 18 }} /> Back
        </Button>

        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Box
              component="img"
              src={movie.image}
              alt={movie.title}
              sx={{
                width: '100%',
                borderRadius: 2,
                border: 1,
                borderColor: 'divider',
                boxShadow: (theme) =>
                  theme.palette.mode === 'dark'
                    ? '0 16px 48px rgba(0,0,0,0.5)'
                    : '0 16px 48px rgba(0,0,0,0.12)',
              }}
            />
          </Grid>

          <Grid item xs={12} md={8}>
            <Stack spacing={2}>
              <Typography variant="h3" fontWeight={700} letterSpacing="-0.02em">
                {movie.title}
              </Typography>
              {movie.tagline && (
                <Typography color="text.secondary" fontStyle="italic">
                  {movie.tagline}
                </Typography>
              )}

              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {movie.genres.map((g) => (
                  <Chip
                    key={g}
                    label={g}
                    size="small"
                    sx={{ bgcolor: 'action.selected', color: 'text.primary' }}
                  />
                ))}
              </Stack>

              <Stack direction="row" spacing={3} flexWrap="wrap">
                {movie.releaseDate && (
                  <Typography variant="body2" color="text.secondary">
                    Released: {movie.releaseDate}
                  </Typography>
                )}
                {movie.runtime > 0 && (
                  <Typography variant="body2" color="text.secondary">
                    {movie.runtime} min
                  </Typography>
                )}
                {movie.language && (
                  <Typography variant="body2" color="text.secondary">
                    {movie.language}
                  </Typography>
                )}
                <Typography variant="body2" fontWeight={600}>
                  ★ {movie.rating?.toFixed(1)} ({movie.voteCount?.toLocaleString()} votes)
                </Typography>
              </Stack>

              {movie.revenue > 0 && (
                <Typography fontWeight={600}>
                  Box Office: ₹{(movie.revenue / 10000000).toFixed(1)} Cr
                </Typography>
              )}

              <Typography variant="body1" color="text.secondary" lineHeight={1.8} mt={1}>
                {movie.overview || 'No overview available.'}
              </Typography>

              <Stack direction="row" spacing={2} mt={2}>
                <Button variant={inWatchlist ? 'secondary' : 'primary'} onClick={handleWatchlist}>
                  {inWatchlist ? 'Remove from Watchlist' : 'Add to Watchlist'}
                </Button>
              </Stack>
            </Stack>
          </Grid>
        </Grid>

        {cast.length > 0 && (
          <Box mt={6}>
            <Typography variant="h5" fontWeight={700} mb={3} letterSpacing="-0.02em">
              Cast
            </Typography>
            <Grid container spacing={2}>
              {cast.map((person) => (
                <Grid item xs={6} sm={4} md={3} key={person.id}>
                  <Stack
                    alignItems="center"
                    sx={{
                      p: 2,
                      bgcolor: 'background.paper',
                      borderRadius: 2,
                      border: 1,
                      borderColor: 'divider',
                    }}
                  >
                    <Box
                      component="img"
                      src={
                        person.profile_path
                          ? `https://image.tmdb.org/t/p/w185${person.profile_path}`
                          : 'https://via.placeholder.com/185x278?text=No+Photo'
                      }
                      alt={person.name}
                      sx={{
                        width: 80,
                        height: 80,
                        borderRadius: '50%',
                        objectFit: 'cover',
                        mb: 1,
                        border: 1,
                        borderColor: 'divider',
                      }}
                    />
                    <Typography fontWeight={600} fontSize="0.9rem" textAlign="center">
                      {person.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" textAlign="center">
                      {person.character}
                    </Typography>
                  </Stack>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}
      </Container>
    </PageShell>
  );
}

export default MovieDetails;
