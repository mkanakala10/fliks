import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import { useSearchParams } from 'react-router-dom';
import MovieBoxOffice from '../components/MovieBoxOffice';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import PageShell from '../components/PageShell';
import PageHeading from '../components/PageHeading';
import MovieCard from '../components/MovieCard';
import Button from '../components/Button';
import { fetchDetailedBoxOfficeMovies } from '../utils/tmdbMovies';
import HorizontalScroller from '../components/HorizontalScroller';

const LANGUAGE_OPTIONS = [
  { label: 'All', value: '' },
  { label: 'Hindi', value: 'hi' },
  { label: 'Tamil', value: 'ta' },
  { label: 'Telugu', value: 'te' },
  { label: 'Malayalam', value: 'ml' },
  { label: 'Kannada', value: 'kn' },
  { label: 'English', value: 'en' },
];

function getYearOptions() {
  const currentYear = new Date().getFullYear();
  const earliestYear = 2020;
  return Array.from({ length: currentYear - earliestYear + 1 }, (_, index) => String(currentYear - index));
}

export default function BoxOffice({ onViewMovie, onRate, ratings = {} }) {
  const [params, setParams] = useSearchParams();
  const tab = params.get('tab') === 'trends' ? 'trends' : 'rankings';
  const [movies, setMovies] = useState([]);
  const [year, setYear] = useState(String(new Date().getFullYear()));
  const [language, setLanguage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (tab !== 'rankings') return;
    const apiKey = import.meta.env.VITE_TMDB_API_KEY;
    if (!apiKey) {
      setError('Missing TMDB API key. Add VITE_TMDB_API_KEY to your .env file.');
      setLoading(false);
      return;
    }

    let cancelled = false;
    const fetchTopBoxOffice = async () => {
      setLoading(true);
      setError(null);

      try {
        const queryParams = {
          primary_release_year: year,
          sort_by: 'revenue.desc',
          'vote_count.gte': '10',
        };

        if (language) {
          queryParams.with_original_language = language;
        }

        const results = await fetchDetailedBoxOfficeMovies(apiKey, queryParams);
        if (cancelled) return;

        setMovies(results);
      } catch (fetchError) {
        setError(fetchError.message || 'Unable to load box office rankings.');
        setMovies([]);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchTopBoxOffice();

    return () => {
      cancelled = true;
    };
  }, [year, language, tab]);

  const yearOptions = getYearOptions();

  return (
    <PageShell>
      <Container maxWidth="xl">
        <Stack spacing={4} py={6}>
          <PageHeading
            title="Box office"
            subtitle="Explore the highest grossing Indian films and follow how a movie’s earnings grew over time."
          />

          <Tabs value={tab} onChange={(_, value) => setParams(value === 'trends' ? { tab: 'trends' } : {})} aria-label="Box office views" sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tab id="rankings-tab" aria-controls="rankings-panel" value="rankings" label="Rankings" /><Tab id="trends-tab" aria-controls="trends-panel" value="trends" label="Movie trends" />
          </Tabs>
          {tab === 'trends' ? <Box role="tabpanel" id="trends-panel" aria-labelledby="trends-tab"><MovieBoxOffice /></Box> : <Stack role="tabpanel" id="rankings-panel" aria-labelledby="rankings-tab" spacing={4}>
          <Stack direction="column" spacing={2} alignItems="center" textAlign="center">
            <Stack direction="row" spacing={1} flexWrap="wrap" justifyContent="center">
              {yearOptions.map((option) => (
                <Button
                  key={option}
                  variant={year === option ? 'primary' : 'secondary'}
                  size="sm"
                  onClick={() => setYear(option)}
                >
                  {option}
                </Button>
              ))}
            </Stack>
            <Stack direction="row" spacing={1} flexWrap="wrap" justifyContent="center">
              {LANGUAGE_OPTIONS.map((option) => (
                <Button
                  key={option.value}
                  variant={language === option.value ? 'primary' : 'secondary'}
                  size="sm"
                  onClick={() => setLanguage(option.value)}
                >
                  {option.label}
                </Button>
              ))}
            </Stack>
          </Stack>

          {error && <Alert severity="error">{error}</Alert>}

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress size={48} color="primary" thickness={4} />
            </Box>
          ) : movies.length > 0 ? (
            <Box pb={8}>
              <HorizontalScroller
                items={movies}
                getKey={(movie) => movie.id}
                cardVariant="landscape"
                renderItem={(movie, index) => (
                  <MovieCard
                    movie={{ ...movie, ratingValue: ratings[movie.id] || 0 }}
                    variant="landscape"
                    rank={index + 1}
                    onViewDetails={() => onViewMovie?.(movie.id)}
                    onRate={onRate}
                  />
                )}
                emptyMessage="No box office data available yet."
              />
            </Box>
          ) : (
            <Alert severity="info">No top box office movies were found for this year and language filter.</Alert>
          )}
          </Stack>}
        </Stack>
      </Container>
    </PageShell>
  );
}
