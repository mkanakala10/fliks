import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import PageShell from '../components/PageShell';
import Hero from '../components/Hero';
import SectionHeader from '../components/SectionHeader';
import ActorCard from '../components/ActorCard';
import MovieCard from '../components/MovieCard';
import CTA from '../components/CTA';
import HorizontalScroller from '../components/HorizontalScroller';
import { fetchIndianActors } from '../utils/indianActors';
import {
  fetchDiscoverMovies,
  filterUnreleasedMovies,
  getUpcomingReleaseDateFloor,
  mapDiscoverMovie,
} from '../utils/tmdbMovies';

function Home({ onNavigate, onViewMovie, onRate, ratings = {} }) {
  const [trendingActors, setTrendingActors] = useState([]);
  const [boxOffice, setBoxOffice] = useState([]);
  const [anticipated, setAnticipated] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const apiKey = import.meta.env.VITE_TMDB_API_KEY;
    if (!apiKey) {
      setError('Missing TMDB API key. Add VITE_TMDB_API_KEY to your .env file.');
      setIsLoading(false);
      return;
    }

    let cancelled = false;

    const fetchHomeData = async () => {
      setIsLoading(true);
      setError(null);

      const results = await Promise.allSettled([
        fetchIndianActors(),
        fetchDiscoverMovies(apiKey, {
          primary_release_year: '2026',
          sort_by: 'revenue.desc',
        }),
        fetchDiscoverMovies(apiKey, {
          primary_release_year: '2026',
          sort_by: 'popularity.desc',
          'primary_release_date.gte': getUpcomingReleaseDateFloor(),
        }),
      ]);

      if (cancelled) return;

      const [actorsResult, boxOfficeResult, anticipatedResult] = results;

      if (actorsResult.status === 'fulfilled') {
        setTrendingActors(actorsResult.value);
      }
      if (boxOfficeResult.status === 'fulfilled') {
        setBoxOffice(
          boxOfficeResult.value.map((movie) => mapDiscoverMovie(movie)).slice(0, 20)
        );
      }
      if (anticipatedResult.status === 'fulfilled') {
        setAnticipated(
          filterUnreleasedMovies(anticipatedResult.value).map((movie) =>
            mapDiscoverMovie(movie, { genre: 'Highly Anticipated' })
          )
        );
      }

      const allFailed = results.every((r) => r.status === 'rejected');
      if (allFailed) {
        setError('Unable to load homepage data. Check your TMDB API key and connection.');
      }

      setIsLoading(false);
    };

    fetchHomeData().catch(() => {
      if (!cancelled) {
        setError('Unable to load homepage data.');
        setIsLoading(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const heroStats = [
    { value: '12K+', label: 'Movies Tracked' },
    { value: '8K+', label: 'Actors' },
    { value: '2M+', label: 'User Reviews' },
  ];

  if (isLoading) return <PageShell loading />;

  return (
    <PageShell>
      <Container maxWidth="xl">
        <Stack spacing={0}>
          <Hero stats={heroStats} onNavigate={onNavigate} />

          {error && (
            <Box py={2}>
              <Alert severity="warning">{error}</Alert>
            </Box>
          )}

          <Box component="section" py={6}>
            <SectionHeader
              title="2026 Box Office Leaders"
              subtitle="Highest grossing Indian films this year"
            />
            <HorizontalScroller
              items={boxOffice}
              getKey={(movie) => movie.id}
              renderItem={(movie, index) => (
                <MovieCard
                  movie={{ ...movie, ratingValue: ratings[movie.id] || 0 }}
                  rank={index + 1}
                  onViewDetails={() => onViewMovie?.(movie.id)}
                  onRate={onRate}
                />
              )}
              emptyMessage="No box office data available yet."
            />
          </Box>

          <Box component="section" py={6}>
            <SectionHeader
              title="Most Anticipated 2026"
              subtitle="Upcoming Indian releases generating the most buzz on TMDB"
            />
            <HorizontalScroller
              items={anticipated}
              getKey={(film) => film.id}
              renderItem={(film) => (
                <MovieCard
                  movie={{ ...film, ratingValue: ratings[film.id] || 0 }}
                  variant="upcoming"
                  onRate={onRate}
                  onViewDetails={() => onViewMovie?.(film.id)}
                />
              )}
              emptyMessage="No anticipated releases found yet."
            />
          </Box>

          <Box component="section" py={6}>
            <SectionHeader
              title="Trending Indian Actors"
              subtitle="Most popular stars in 2026 based on recent hits"
            />
            <HorizontalScroller
              items={trendingActors}
              getKey={(actor) => actor.id}
              renderItem={(actor, index) => <ActorCard actor={actor} rank={index + 1} />}
              emptyMessage="Updating trending stars…"
              centerWhenFits
              cardVariant="actor"
            />
          </Box>

          <CTA
            title="Ready to Dive Deeper?"
            description="Track your favorite stars and never miss a release date in 2026."
            buttonText="Explore All Trends"
            onButtonClick={() => onNavigate?.('trending')}
          />
        </Stack>
      </Container>
    </PageShell>
  );
}

export default Home;
