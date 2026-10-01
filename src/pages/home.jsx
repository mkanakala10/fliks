import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import PageShell from '../components/PageShell';
import Hero from '../components/Hero';
import SectionHeader from '../components/SectionHeader';
import ActorCard from '../components/ActorCard';
import MovieCard from '../components/MovieCard';
import CTA from '../components/CTA';
import HorizontalScroller from '../components/HorizontalScroller';
import { fetchIndianActors } from '../utils/indianActors';
import { fetchIndianDirectors } from '../utils/indianDirectors';
import ActorModal from '../components/ActorModal';
import {
  fetchDiscoverMovies,
  filterUnreleasedMovies,
  getUpcomingReleaseDateFloor,
  mapDiscoverMovie,
  fetchHighestRoiMovies,
  fetchRecentReleaseMovies,
  fetchNowPlayingMovies,
} from '../utils/tmdbMovies';

function Home({ onReplayIntro, onNavigate, onViewMovie, onRate, ratings = {} }) {
  const [trendingActors, setTrendingActors] = useState([]);
  const [trendingDirectors, setTrendingDirectors] = useState([]);
  const [roiMovies, setRoiMovies] = useState([]);
  const [nowPlaying, setNowPlaying] = useState([]);
  const [theaterError, setTheaterError] = useState(null);
  const [theatersLoading, setTheatersLoading] = useState(true);
  const [recentReleases, setRecentReleases] = useState([]);
  const [anticipated, setAnticipated] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedActorId, setSelectedActorId] = useState(null);
  const [selectedActorName, setSelectedActorName] = useState('');
  const [isActorModalOpen, setIsActorModalOpen] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    const apiKey = import.meta.env.VITE_TMDB_API_KEY;
    if (!apiKey) {
      setTheaterError('Theater listings are currently unavailable.');
      setTheatersLoading(false);
      return;
    }
    fetchNowPlayingMovies(apiKey, { signal: controller.signal })
      .then(setNowPlaying)
      .catch(() => {
        if (!controller.signal.aborted) setTheaterError('We couldn’t load theater listings. Please try again later.');
      })
      .finally(() => {
        if (!controller.signal.aborted) setTheatersLoading(false);
      });
    return () => controller.abort();
  }, []);

  useEffect(() => {
    const apiKey = import.meta.env.VITE_TMDB_API_KEY;
    if (!apiKey) {
      setError('The film catalog is currently unavailable. Please try again later.');
      setIsLoading(false);
      return;
    }

    let cancelled = false;

    const fetchHomeData = async () => {
      setIsLoading(true);
      setError(null);

      const results = await Promise.allSettled([
        fetchIndianActors(),
        fetchIndianDirectors(),
        fetchDiscoverMovies(apiKey, {
          primary_release_year: '2026',
          sort_by: 'popularity.desc',
          'primary_release_date.gte': getUpcomingReleaseDateFloor(),
        }),
        fetchHighestRoiMovies(apiKey),
        fetchRecentReleaseMovies(apiKey),
      ]);

      if (cancelled) return;

      const [actorsResult, directorsResult, anticipatedResult, roiResult, recentReleasesResult] = results;

      if (actorsResult.status === 'fulfilled') {
        setTrendingActors(actorsResult.value);
      }
      if (directorsResult.status === 'fulfilled') {
        setTrendingDirectors(directorsResult.value);
      }
      if (roiResult.status === 'fulfilled') {
        setRoiMovies(roiResult.value.slice(0, 20));
      }
      if (anticipatedResult.status === 'fulfilled') {
        setAnticipated(
          filterUnreleasedMovies(anticipatedResult.value).map((movie) =>
            mapDiscoverMovie(movie)
          )
        );
      }
      if (recentReleasesResult.status === 'fulfilled') {
        setRecentReleases(recentReleasesResult.value);
      }

      const allFailed = results.every((r) => r.status === 'rejected');
      if (allFailed) {
        setError('We couldn’t load the film catalog. Please try again later.');
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

  return (
    <PageShell>
      <Hero
        loading={isLoading}
        onNavigate={onNavigate}
        onViewMovie={onViewMovie}
        featuredMovies={recentReleases}
      />

      <Container maxWidth="xl">
        <Stack spacing={0}>
          {error && (
            <Box py={2}>
              <Alert severity="warning">{error}</Alert>
            </Box>
          )}

          <Box component="section" aria-labelledby="in-theaters-title" aria-busy={theatersLoading} sx={{ py: { xs: 3.5, md: 4.5 } }}>
            <SectionHeader
              id="in-theaters-title"
              title="Currently in theaters"
              subtitle="Indian films now playing in India. Availability varies by cinema."
            />
            {theatersLoading ? (
              <Stack direction="row" spacing={2} aria-label="Loading theater listings">
                {[1, 2, 3, 4].map((n) => <Skeleton key={n} variant="rounded" height={230} sx={{ flex: 1 }} />)}
              </Stack>
            ) : theaterError ? (
              <Alert severity="info">{theaterError}</Alert>
            ) : (
              <HorizontalScroller
                items={nowPlaying}
                getKey={(movie) => movie.id}
                renderItem={(movie) => (
                  <MovieCard
                    movie={{ ...movie, ratingValue: ratings[movie.id] || 0 }}
                    onViewDetails={() => onViewMovie?.(movie.id)}
                    onRate={onRate}
                  />
                )}
                emptyMessage="No theater listings are available right now."
              />
            )}
          </Box>

          <Box component="section" sx={{ py: { xs: 3.5, md: 4.5 } }}>
            <SectionHeader
              title="Recent Releases"
              subtitle="The biggest releases from the last six months."
              onAction={() => onNavigate?.('all-movies')}
            />
            {isLoading ? <Stack direction="row" spacing={2} aria-label="Loading catalog">{[1, 2, 3, 4].map((n) => <Skeleton key={n} variant="rounded" height={230} sx={{ flex: 1 }} />)}</Stack> : <HorizontalScroller
              items={recentReleases}
              getKey={(movie) => movie.id}
              renderItem={(movie, index) => (
                <MovieCard
                  movie={{ ...movie, ratingValue: ratings[movie.id] || 0 }}
                  rank={index + 1}
                  onViewDetails={() => onViewMovie?.(movie.id)}
                  onRate={onRate}
                />
              )}
              emptyMessage="No recent releases available."
            />}
          </Box>

          <Box component="section" sx={{ py: { xs: 3.5, md: 4.5 } }}>
            <SectionHeader
              title="Small budgets. Big returns."
              subtitle="Indian films with the highest return on investment since 2023."
              actionLabel="Box office"
              onAction={() => onNavigate?.('box-office')}
            />
            {isLoading ? <Stack direction="row" spacing={2} aria-label="Loading catalog">{[1, 2, 3, 4].map((n) => <Skeleton key={n} variant="rounded" height={230} sx={{ flex: 1 }} />)}</Stack> : <HorizontalScroller
              items={roiMovies}
              getKey={(movie) => movie.id}
              renderItem={(movie, index) => (
                <MovieCard
                  movie={{ ...movie, ratingValue: ratings[movie.id] || 0 }}
                  rank={index + 1}
                  onViewDetails={() => onViewMovie?.(movie.id)}
                  onRate={onRate}
                />
              )}
              emptyMessage="Box office figures are currently unavailable."
            />}
          </Box>

          <Box component="section" sx={{ py: { xs: 3.5, md: 4.5 } }}>
            <SectionHeader
              title="Coming to a screen near you"
              subtitle="Upcoming releases to keep on your radar."
            />
            {isLoading ? <Stack direction="row" spacing={2} aria-label="Loading catalog">{[1, 2, 3, 4].map((n) => <Skeleton key={n} variant="rounded" height={230} sx={{ flex: 1 }} />)}</Stack> : <HorizontalScroller
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
              emptyMessage="No upcoming releases available."
            />}
          </Box>

          <Box component="section" sx={{ py: { xs: 3.5, md: 4.5 } }}>
            <SectionHeader
              title="People in the spotlight"
              subtitle="Explore the faces behind the films."
              onAction={() => onNavigate?.('actors')}
            />
            {isLoading ? <Stack direction="row" spacing={2} aria-label="Loading catalog">{[1, 2, 3, 4].map((n) => <Skeleton key={n} variant="rounded" height={230} sx={{ flex: 1 }} />)}</Stack> : <HorizontalScroller
              items={trendingActors}
              getKey={(actor) => actor.id}
              renderItem={(actor, index) => (
                <ActorCard
                  actor={actor}
                  rank={index + 1}
                  onClick={() => {
                    setSelectedActorId(actor.id);
                    setSelectedActorName(actor.name);
                    setIsActorModalOpen(true);
                  }}
                />
              )}
              emptyMessage="Updating trending stars…"
              centerWhenFits
              cardVariant="actor"
            />}
          </Box>

          <Box component="section" sx={{ py: { xs: 3.5, md: 4.5 } }}>
            <SectionHeader
              title="Behind the camera"
              subtitle="Get to know the filmmakers shaping Indian cinema."
            />
            {isLoading ? <Stack direction="row" spacing={2} aria-label="Loading catalog">{[1, 2, 3, 4].map((n) => <Skeleton key={n} variant="rounded" height={230} sx={{ flex: 1 }} />)}</Stack> : <HorizontalScroller
              items={trendingDirectors}
              getKey={(director) => director.id}
              renderItem={(director, index) => (
                <ActorCard
                  actor={director}
                  rank={index + 1}
                  onClick={() => {
                    setSelectedActorId(director.id);
                    setSelectedActorName(director.name);
                    setIsActorModalOpen(true);
                  }}
                />
              )}
              emptyMessage="Updating trending directors…"
              centerWhenFits
              cardVariant="actor"
            />}
          </Box>

          <CTA
            title="There’s always another great film."
            description="Find what’s trending and make your next watch a good one."
            buttonText="Explore trending films"
            onButtonClick={() => onNavigate?.('trending')}
          />
        </Stack>
      </Container>

      <Container component="footer" maxWidth="xl" sx={{ py: 3, pb: 5 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={1}>
          <Typography sx={{ fontSize: 12, fontWeight: 600 }}>fliks. <Box component="span" sx={{ fontWeight: 400, color: 'text.secondary', ml: 1 }}>A closer look at Indian cinema.</Box></Typography>
          <Button onClick={onReplayIntro} sx={{ fontSize: 11, color: 'text.secondary', p: 0, minHeight: 24, alignSelf: 'flex-start' }}>Replay intro</Button>
          <Typography sx={{ fontSize: 10, color: 'text.secondary' }}>Film data and imagery provided by TMDB.</Typography>
        </Stack>
      </Container>

      <ActorModal
        actorId={selectedActorId}
        actorName={selectedActorName}
        open={isActorModalOpen}
        onClose={() => setIsActorModalOpen(false)}
        onMovieClick={onViewMovie}
      />
    </PageShell>
  );
}

export default Home;
