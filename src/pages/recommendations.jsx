import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Slider from '@mui/material/Slider';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Paper from '@mui/material/Paper';
import PageShell from '../components/PageShell';
import SectionHeader from '../components/SectionHeader';
import Button from '../components/Button';
import MovieCard from '../components/MovieCard';
import HorizontalScroller from '../components/HorizontalScroller';
import { useWatchLater } from '../contexts/WatchLaterContext';
import { fetchSurveyCatalog, submitOnboarding } from '../config/api';

const FALLBACK_SURVEY = [
  { id: 20453, title: '3 Idiots' },
  { id: 19404, title: 'Dilwale Dulhania Le Jayenge' },
  { id: 297222, title: 'PK' },
  { id: 7508, title: 'Taare Zameen Par' },
  { id: 360814, title: 'Dangal' },
];

async function enrichWithTmdb(movie) {
  const apiKey = import.meta.env.VITE_TMDB_API_KEY;
  if (!apiKey) {
    return {
      id: movie.id,
      title: movie.title,
      image: 'https://via.placeholder.com/300x450?text=No+Poster',
      genre: 'Indian Cinema',
      releaseDate: '',
    };
  }

  try {
    const res = await fetch(
      `https://api.themoviedb.org/3/movie/${movie.id}?api_key=${apiKey}`
    );
    if (!res.ok) throw new Error('not found');
    const data = await res.json();
    return {
      id: movie.id,
      title: data.title || movie.title,
      image: data.poster_path
        ? `https://image.tmdb.org/t/p/w500${data.poster_path}`
        : 'https://via.placeholder.com/300x450?text=No+Poster',
      genre: data.genres?.[0]?.name || 'Indian Cinema',
      releaseDate: data.release_date || '',
    };
  } catch {
    return {
      id: movie.id,
      title: movie.title,
      image: 'https://via.placeholder.com/300x450?text=No+Poster',
      genre: 'Indian Cinema',
      releaseDate: '',
    };
  }
}

function Recommendations({ onViewMovie, onRate, ratings: userRatings = {} }) {
  const [surveyMovies, setSurveyMovies] = useState(FALLBACK_SURVEY);
  const [surveyRatings, setSurveyRatings] = useState(
    Object.fromEntries(FALLBACK_SURVEY.map((m) => [m.id, 3]))
  );
  const [recommendations, setRecommendations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [catalogError, setCatalogError] = useState(null);
  const [submitError, setSubmitError] = useState(null);
  const { addToWatchLater, isInWatchLater } = useWatchLater();

  useEffect(() => {
    const loadCatalog = async () => {
      try {
        const data = await fetchSurveyCatalog();
        if (!data.movies?.length) return;
        setSurveyMovies(data.movies);
        setSurveyRatings(Object.fromEntries(data.movies.map((m) => [m.id, 3])));
      } catch {
        setCatalogError(
          'Using offline Indian survey films. Start the backend with: python main.py'
        );
      }
    };
    loadCatalog();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setSubmitError(null);
    setRecommendations([]);

    try {
      const data = await submitOnboarding(
        Object.fromEntries(surveyMovies.map((m) => [m.id, surveyRatings[m.id] ?? 3]))
      );
      const raw = data.recommendations || [];
      const enriched = await Promise.all(raw.map(enrichWithTmdb));
      setRecommendations(enriched);
    } catch {
      setSubmitError(
        'Could not generate recommendations. Ensure the backend is running and trained (python train_model.py).'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PageShell>
      <Container maxWidth="lg">
        <Stack spacing={4} py={6}>
          <SectionHeader
            title="Personalized For You"
            subtitle="Rate iconic Indian films — our matrix factorization model maps your taste profile."
          />

          {catalogError && <Alert severity="info">{catalogError}</Alert>}
          {submitError && <Alert severity="error">{submitError}</Alert>}

          <Paper
            elevation={0}
            sx={{
              p: 3,
              bgcolor: 'background.paper',
              border: 1,
              borderColor: 'divider',
              borderRadius: 3,
            }}
          >
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
              <Typography variant="h6" fontWeight={600}>
                Rate each seed movie
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Scale: 1 – 5 stars
              </Typography>
            </Stack>

            <Grid container spacing={2}>
              {surveyMovies.map((movie) => (
                <Grid item xs={12} md={6} key={movie.id}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2.5,
                      bgcolor: 'background.default',
                      border: 1,
                      borderColor: 'divider',
                      borderRadius: 2,
                    }}
                  >
                    <Stack direction="row" justifyContent="space-between" mb={1}>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          #{movie.id}
                        </Typography>
                        <Typography fontWeight={600}>{movie.title}</Typography>
                      </Box>
                      <Typography
                        fontWeight={700}
                        sx={{
                          bgcolor: 'action.selected',
                          px: 1.5,
                          py: 0.5,
                          borderRadius: 2,
                        }}
                      >
                        {surveyRatings[movie.id] ?? 3}
                      </Typography>
                    </Stack>

                    <Slider
                      min={1}
                      max={5}
                      step={1}
                      marks
                      value={surveyRatings[movie.id] ?? 3}
                      onChange={(_, value) =>
                        setSurveyRatings((prev) => ({ ...prev, [movie.id]: value }))
                      }
                      color="primary"
                      sx={{ mt: 1 }}
                    />
                  </Paper>
                </Grid>
              ))}
            </Grid>

            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3, textAlign: 'right' }}>
              <Button type="submit" variant="primary" disabled={isLoading}>
                {isLoading ? 'Generating…' : 'Get My Recommendations'}
              </Button>
            </Box>
          </Paper>

          {isLoading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress color="primary" />
            </Box>
          )}

          {recommendations.length > 0 && (
            <Box>
              <Typography variant="h5" fontWeight={700} mb={3} textAlign="center">
                Recommended Indian Films For You
              </Typography>
              <HorizontalScroller
                items={recommendations}
                getKey={(movie) => movie.id}
                renderItem={(movie) => (
                  <MovieCard
                    movie={{ ...movie, ratingValue: userRatings[movie.id] || 0 }}
                    variant="upcoming"
                    onAddToWatchlist={() => addToWatchLater(movie)}
                    isInWatchlist={isInWatchLater(movie.id)}
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

export default Recommendations;
