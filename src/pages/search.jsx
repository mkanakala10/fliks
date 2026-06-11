import { useState } from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Paper from '@mui/material/Paper';
import SearchIcon from '@mui/icons-material/Search';
import PageShell from '../components/PageShell';
import SectionHeader from '../components/SectionHeader';
import Button from '../components/Button';
import { semanticSearch } from '../config/api';

function Search({ onViewMovie }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;

    setIsLoading(true);
    setError(null);
    setHasSearched(true);

    try {
      const data = await semanticSearch(trimmed, 12);
      setResults(data.results || []);
    } catch {
      setError(
        'Could not reach the API. Start the unified backend: cd backend && python main.py'
      );
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PageShell>
      <Container maxWidth="md">
        <Stack spacing={4} py={6}>
          <SectionHeader
            title="Semantic Indian Cinema Search"
            subtitle="Describe a mood, plot, or vibe — search by meaning across Indian films."
          />

          <Box component="form" onSubmit={handleSearch}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                fullWidth
                placeholder='e.g. "underdog sports drama" or "romantic train journey"'
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: 'text.secondary' }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 3,
                    bgcolor: 'background.paper',
                  },
                }}
              />
              <Button type="submit" variant="primary" disabled={isLoading || !query.trim()}>
                {isLoading ? 'Searching…' : 'Search'}
              </Button>
            </Stack>
          </Box>

          {error && <Alert severity="error">{error}</Alert>}

          {isLoading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
              <CircularProgress color="primary" />
            </Box>
          )}

          {!isLoading && hasSearched && results.length === 0 && !error && (
            <Typography textAlign="center" color="text.secondary" py={4}>
              No matches found. Try a different description.
            </Typography>
          )}

          <Stack spacing={2}>
            {results.map((movie, index) => {
              const movieId = Number(movie.csv_id);
              return (
                <Paper
                  key={`${movie.csv_id}-${index}`}
                  elevation={0}
                  onClick={() => movieId && onViewMovie?.(movieId)}
                  sx={{
                    p: 3,
                    bgcolor: 'background.paper',
                    border: 1,
                    borderColor: 'divider',
                    borderRadius: 2,
                    cursor: movieId ? 'pointer' : 'default',
                    transition: 'transform 0.15s, border-color 0.15s',
                    '&:hover': movieId
                      ? {
                          borderColor: 'text.secondary',
                          transform: 'translateY(-2px)',
                        }
                      : {},
                  }}
                >
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                    <Typography variant="h6" fontWeight={600} gutterBottom>
                      {movie.title}
                    </Typography>
                    {movie.language && (
                      <Typography variant="caption" color="text.secondary" ml={2}>
                        {movie.language.toUpperCase()}
                      </Typography>
                    )}
                  </Stack>
                  <Typography variant="body2" color="text.secondary" lineHeight={1.7}>
                    {movie.plot || movie.overview || 'No plot available.'}
                  </Typography>
                  {movieId > 0 && (
                    <Typography variant="caption" color="text.primary" mt={1} display="block">
                      Click for full details →
                    </Typography>
                  )}
                </Paper>
              );
            })}
          </Stack>
        </Stack>
      </Container>
    </PageShell>
  );
}

export default Search;
