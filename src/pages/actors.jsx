import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import SearchIcon from '@mui/icons-material/Search';
import PageShell from '../components/PageShell';
import SectionHeader from '../components/SectionHeader';
import ActorCard from '../components/ActorCard';
import HorizontalScroller from '../components/HorizontalScroller';
import { fetchIndianActors } from '../utils/indianActors';

function Actors() {
  const [actors, setActors] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchActors = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const indianActors = await fetchIndianActors();
        setActors(indianActors);
        setFiltered(indianActors);
      } catch (err) {
        setError('Unable to load actors. Please try again later.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchActors();
  }, []);

  useEffect(() => {
    if (!search.trim()) {
      setFiltered(actors);
    } else {
      setFiltered(
        actors.filter((a) => a.name.toLowerCase().includes(search.toLowerCase()))
      );
    }
  }, [search, actors]);

  return (
    <PageShell>
      <Container maxWidth="xl">
        <Stack spacing={0}>
          <Box component="section" py={6} textAlign="center">
            <SectionHeader
              title="Indian Actors"
              subtitle="Explore the most popular stars of Indian cinema"
            />
            <Box sx={{ maxWidth: '400px', mx: 'auto', mt: 2 }}>
              <TextField
                fullWidth
                placeholder="Search actors..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
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
            </Box>
          </Box>

          {error && (
            <Typography color="error" textAlign="center" pb={3}>{error}</Typography>
          )}

          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
              <CircularProgress size={44} color="primary" thickness={4} />
            </Box>
          ) : filtered.length > 0 ? (
            <Box pb={8}>
              <HorizontalScroller
                items={filtered}
                getKey={(actor) => actor.id}
                renderItem={(actor, index) => <ActorCard actor={actor} rank={index + 1} />}
                cardVariant="actor"
              />
            </Box>
          ) : (
            <Box sx={{ textAlign: 'center', py: 10 }}>
              <Typography fontSize="1.2rem" fontWeight="bold" mb={1}>
                No actors found
              </Typography>
              <Typography color="text.secondary">
                {search ? `No results for "${search}"` : 'Check back soon!'}
              </Typography>
            </Box>
          )}
        </Stack>
      </Container>
    </PageShell>
  );
}

export default Actors;
