import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Header from '../components/Header';
import Hero from '../components/Hero';
import SectionHeader from '../components/SectionHeader';
import ActorCard from '../components/ActorCard';
import MovieCard from '../components/MovieCard';
import CTA from '../components/CTA';

function Home({ onNavigate, onViewMovie, onRate, ratings = {} }) {
  const [trendingActors, setTrendingActors] = useState([]);
  const [boxOffice, setBoxOffice] = useState([]);
  const [anticipated, setAnticipated] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const apiKey = import.meta.env.VITE_TMDB_API_KEY;

    const fetchHomeData = async () => {
      setIsLoading(true);
      try {
        const actorRes = await fetch(
          `https://api.themoviedb.org/3/person/popular?api_key=${apiKey}&language=en-US&page=1`
        );
        const actorData = await actorRes.json();

        const indianActors = (actorData.results || [])
          .filter((person) =>
            person.known_for?.some(
              (m) =>
                m.origin_country?.includes('IN') ||
                ['hi', 'ta', 'te', 'ml', 'kn'].includes(m.original_language)
            )
          )
          .filter((p) => p.profile_path)
          .slice(0, 20)
          .map((person) => ({
            id: person.id,
            name: person.name,
            image: `https://image.tmdb.org/t/p/w500${person.profile_path}`,
            trendingScore: Math.round(person.popularity),
          }));

        setTrendingActors(indianActors);

        const boRes = await fetch(
          `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&region=IN&with_origin_country=IN&primary_release_year=2026&sort_by=revenue.desc`
        );
        const boData = await boRes.json();
        setBoxOffice(
          (boData.results || []).slice(0, 5).map((movie) => ({
            id: movie.id,
            title: movie.title,
            image: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
            revenue:
              movie.revenue > 0
                ? `₹${(movie.revenue / 10000000).toFixed(1)} Cr`
                : 'Blockbuster',
            rating: movie.vote_average,
            releaseDate: movie.release_date,
          }))
        );

        const antRes = await fetch(
          `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&region=IN&with_origin_country=IN&primary_release_year=2026&sort_by=popularity.desc`
        );
        const antData = await antRes.json();
        setAnticipated(
          (antData.results || []).slice(0, 4).map((movie) => ({
            id: movie.id,
            title: movie.title,
            image: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
            releaseDate: movie.release_date,
            genre: 'Highly Anticipated',
          }))
        );
      } catch (err) {
        console.error('Error fetching homepage data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    if (apiKey) fetchHomeData();
    else setIsLoading(false);
  }, []);

  const heroStats = [
    { value: '12K+', label: 'Movies Tracked' },
    { value: '8K+', label: 'Actors' },
    { value: '2M+', label: 'User Reviews' },
  ];

  if (isLoading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg,#1a1a2e 0%,#16213e 50%,#0f3460 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <CircularProgress size={56} sx={{ color: '#64b5f6' }} thickness={4} />
      </Box>
    );
  }

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
          <Hero stats={heroStats} onNavigate={onNavigate} />

          {/* Trending Actors */}
          <Box component="section" py={6}>
            <SectionHeader
              title="Trending Indian Actors"
              subtitle="Most popular stars in 2026 based on recent hits"
            />
            <Box
              sx={{
                display: 'flex',
                gap: 3,
                overflowX: 'auto',
                py: 3,
                px: 1,
                '&::-webkit-scrollbar': { display: 'none' },
                scrollbarWidth: 'none',
              }}
            >
              {trendingActors.length > 0 ? (
                trendingActors.map((actor) => (
                  <Box key={actor.id} sx={{ minWidth: '160px', flex: '0 0 auto' }}>
                    <ActorCard actor={actor} />
                  </Box>
                ))
              ) : (
                <Typography sx={{ width: '100%', textAlign: 'center', color: 'grey.400' }}>
                  Updating trending stars…
                </Typography>
              )}
            </Box>
          </Box>

          {/* Box Office Leaders */}
          <Box component="section" py={6}>
            <SectionHeader
              title="2026 Box Office Leaders"
              subtitle="Highest grossing Indian films this year"
            />
            <Grid container spacing={3}>
              {boxOffice.map((movie, index) => (
                <Grid item xs={12} sm={6} md={4} lg={2.4} key={movie.id}>
                  <MovieCard
                    movie={{ ...movie, ratingValue: ratings[movie.id] || 0 }}
                    rank={index + 1}
                    onViewDetails={() => onViewMovie?.(movie.id)}
                    onRate={onRate}
                  />
                </Grid>
              ))}
            </Grid>
          </Box>

          {/* Most Anticipated */}
          <Box component="section" py={6}>
            <SectionHeader
              title="Most Anticipated 2026"
              subtitle="Films generating the most buzz right now"
            />
            <Grid container spacing={3}>
              {anticipated.map((film) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={film.id}>
                  <MovieCard
                    movie={{ ...film, ratingValue: ratings[film.id] || 0 }}
                    variant="upcoming"
                    onRate={onRate}
                    onViewDetails={() => onViewMovie?.(film.id)}
                  />
                </Grid>
              ))}
            </Grid>
          </Box>

          <CTA
            title="Ready to Dive Deeper?"
            description="Track your favorite stars and never miss a release date in 2026."
            buttonText="Explore All Trends"
            onButtonClick={() => onNavigate?.('trending')}
          />
        </Stack>
      </Container>
    </Box>
  );
}

export default Home;
