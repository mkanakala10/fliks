import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Header from '../components/Header';
import SectionHeader from '../components/SectionHeader';
import MovieCard from '../components/MovieCard';

const GENRE_MAP = {
  28: 'Action', 12: 'Adventure', 16: 'Animation', 35: 'Comedy',
  80: 'Crime', 99: 'Documentary', 18: 'Drama', 10751: 'Family',
  14: 'Fantasy', 36: 'History', 27: 'Horror', 10402: 'Music',
  9648: 'Mystery', 10749: 'Romance', 878: 'Sci-Fi', 10770: 'TV Movie',
  53: 'Thriller', 10752: 'War', 37: 'Western',
};

function Ratings({ onViewMovie, onRate, ratings = {} }) {
  const [ratedMovies, setRatedMovies] = useState([]);
  const [sortBy, setSortBy] = useState('rating');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadRatedMovies = async () => {
      setIsLoading(true);
      try {
        const apiKey = import.meta.env.VITE_TMDB_API_KEY;
        if (!apiKey) {
          console.error('Missing TMDB API key');
          return;
        }

        // Get list of movie IDs that have been rated
        const ratedIds = Object.keys(ratings).filter((id) => ratings[id] > 0);

        if (ratedIds.length === 0) {
          setRatedMovies([]);
          return;
        }

        // Fetch details for each rated movie
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
                revenue: data.revenue
                  ? `$${(data.revenue / 1000000).toFixed(1)}M`
                  : 'N/A',
                genre: GENRE_MAP[data.genres?.[0]?.id] || 'Cinema',
              };
            } catch {
              return null;
            }
          })
        );

        const validMovies = movies
          .filter((m) => m !== null)
          .map((movie) => ({ ...movie, ratingValue: ratings[movie.id] }));

        // Sort movies
        let sorted = [...validMovies];
        if (sortBy === 'rating') {
          sorted.sort((a, b) => (b.ratingValue || 0) - (a.ratingValue || 0));
        } else if (sortBy === 'title') {
          sorted.sort((a, b) => a.title.localeCompare(b.title));
        } else if (sortBy === 'recent') {
          sorted.sort((a, b) => new Date(b.releaseDate) - new Date(a.releaseDate));
        }

        setRatedMovies(sorted);
      } catch (error) {
        console.error('Error loading rated movies:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadRatedMovies();
  }, [ratings, sortBy]);

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
              title="My Ratings"
              subtitle="All the movies you've rated, organized by your feedback."
            />
          </Box>

          {ratedMovies.length === 0 ? (
            <Box sx={{ py: 10, textAlign: 'center' }}>
              <Typography fontSize="1.2rem" fontWeight="bold" mb={1}>
                {isLoading ? 'Loading your ratings...' : 'No rated movies yet'}
              </Typography>
              <Typography sx={{ color: 'grey.400' }}>
                {!isLoading && 'Start rating movies to see them here. Hover over the stars on any movie card to rate from 1-5 with 0.5 increments.'}
              </Typography>
            </Box>
          ) : (
            <Box component="section" pb={8}>
              <Box sx={{ mb: 4, display: 'flex', justifyContent: 'flex-end' }}>
                <FormControl sx={{ minWidth: 200 }} size="small">
                  <InputLabel sx={{ color: '#fff' }}>Sort By</InputLabel>
                  <Select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    label="Sort By"
                    sx={{
                      color: '#fff',
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#2196f3',
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#64b5f6',
                      },
                      '& .MuiSvgIcon-root': {
                        color: '#fff',
                      },
                    }}
                  >
                    <MenuItem value="rating">Highest Rated</MenuItem>
                    <MenuItem value="title">Title (A-Z)</MenuItem>
                    <MenuItem value="recent">Recently Released</MenuItem>
                  </Select>
                </FormControl>
              </Box>

              <Grid container spacing={3} justifyContent="center">
                {ratedMovies.map((movie) => (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={movie.id}>
                    <MovieCard
                      movie={movie}
                      variant="default"
                      onViewDetails={() => onViewMovie?.(movie.id)}
                      onRate={onRate}
                    />
                  </Grid>
                ))}
              </Grid>

              <Box sx={{ mt: 6, textAlign: 'center' }}>
                <Typography variant="body2" sx={{ color: 'grey.400' }}>
                  Total Rated: {ratedMovies.length} movie{ratedMovies.length !== 1 ? 's' : ''}
                </Typography>
              </Box>
            </Box>
          )}
        </Stack>
      </Container>
    </Box>
  );
}

export default Ratings;
