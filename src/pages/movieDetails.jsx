import { Fragment, useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import Rating from '@mui/material/Rating';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Dialog from '@mui/material/Dialog';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import MovieBoxOffice from '../components/MovieBoxOffice';
import { Check, Plus } from 'lucide-react';
import SectionHeader from '../components/SectionHeader';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ShareIcon from '@mui/icons-material/Share';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import CloseIcon from '@mui/icons-material/Close';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import PageShell from '../components/PageShell';
import Button from '../components/Button';
import { useWatchLater } from '../contexts/WatchLaterContext';
import { useNavigation } from '../contexts/NavigationContext';
import { useUserData } from '../contexts/UserDataContext';
import { useAuth } from '../contexts/AuthContext';
import { useMovieFliksRating } from '../hooks/useMovieFliksRating';
import { useToast } from '../contexts/ToastContext';
import { formatUsdToInrCrores } from '../utils/tmdbMovies';
import ActorModal from '../components/ActorModal';
import PersonImage from '../components/PersonImage';

function MovieDetails() {
  const { movieId: movieIdParam } = useParams();
  const movieId = Number(movieIdParam);
  const [params, setParams] = useSearchParams();
  const activeTab = params.get('tab') === 'box-office' ? 'box-office' : 'overview';
  const { onGoBack, onNavigate } = useNavigation();
  const navigate = useNavigate();
  const [selectedActorId, setSelectedActorId] = useState(null);
  const [selectedActorName, setSelectedActorName] = useState('');
  const [isActorModalOpen, setIsActorModalOpen] = useState(false);
  const { ratings, rateMovie, removeRating } = useUserData();
  const { isAuthenticated, user } = useAuth();
  const showToast = useToast();
  const [movie, setMovie] = useState(null);
  const [credits, setCredits] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { addToWatchLater, removeFromWatchLater, isInWatchLater } = useWatchLater();

  const [trailerKey, setTrailerKey] = useState(null);
  const [isTrailerOpen, setIsTrailerOpen] = useState(false);
  const [reviewInput, setReviewInput] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [copied, setCopied] = useState(false);
  const [savingWatchlist, setSavingWatchlist] = useState(false);

  useEffect(() => {
    const apiKey = import.meta.env.VITE_TMDB_API_KEY;
    if (!apiKey || !movieId) {
      setError('This film is currently unavailable.');
      setIsLoading(false);
      return;
    }

    const controller = new AbortController();
    setIsTrailerOpen(false);
    setTrailerKey(null);
    setReviewInput('');
    const fetchDetails = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [movieRes, creditsRes, videosRes] = await Promise.all([
          fetch(`https://api.themoviedb.org/3/movie/${movieId}?api_key=${apiKey}`, { signal: controller.signal }),
          fetch(`https://api.themoviedb.org/3/movie/${movieId}/credits?api_key=${apiKey}`, { signal: controller.signal }).catch(() => null),
          fetch(`https://api.themoviedb.org/3/movie/${movieId}/videos?api_key=${apiKey}`, { signal: controller.signal }).catch(() => null),
        ]);

        if (!movieRes.ok) throw new Error('Movie not found');

        const movieData = await movieRes.json();
        const creditsData = creditsRes?.ok ? await creditsRes.json() : { cast: [], crew: [] };
        const videosData = videosRes?.ok ? await videosRes.json() : { results: [] };

        if (controller.signal.aborted) return;
        const chooseTrailer = (results = []) => {
          const videos = results.filter((video) => video.site === 'YouTube' && video.key);
          return videos.find((video) => video.type === 'Trailer' && video.official)
            || videos.find((video) => video.type === 'Trailer')
            || videos.find((video) => video.type === 'Teaser');
        };
        let trailer = chooseTrailer(videosData.results);
        // TMDB defaults videos to English; Indian films often only have native-language trailers.
        if (!trailer && movieData.original_language && movieData.original_language !== 'en') {
          try {
            const nativeRes = await fetch(
              `https://api.themoviedb.org/3/movie/${movieId}/videos?api_key=${apiKey}&language=${encodeURIComponent(movieData.original_language)}`,
              { signal: controller.signal }
            );
            if (nativeRes.ok) trailer = chooseTrailer((await nativeRes.json()).results);
          } catch {
            // A missing trailer must not prevent the film details from loading.
          }
        }
        if (controller.signal.aborted) return;

        setTrailerKey(trailer ? trailer.key : null);

        setMovie({
          id: movieData.id,
          title: movieData.title,
          overview: movieData.overview,
          image: movieData.poster_path
            ? `https://image.tmdb.org/t/p/w500${movieData.poster_path}`
            : null,
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
          budget: movieData.budget,
          language: movieData.original_language ? new Intl.DisplayNames(['en'], { type: 'language' }).of(movieData.original_language) : null,
        });
        setCredits(creditsData);
      } catch (err) {
        if (!controller.signal.aborted) setError(err.message || 'Unable to load movie details.');
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    };

    fetchDetails();
    return () => controller.abort();
  }, [movieId]);

  const handleWatchlist = async () => {
    if (!movie || savingWatchlist) return;
    const card = {
      id: movie.id,
      title: movie.title,
      image: movie.image,
      genre: movie.genres[0] || 'Indian Cinema',
      releaseDate: movie.releaseDate,
    };
    setSavingWatchlist(true);
    try {
      if (isInWatchLater(movie.id)) await removeFromWatchLater(movie.id);
      else await addToWatchLater(card);
    } catch (error) {
      if (error.code !== 'auth/required') showToast('Your watchlist couldn’t be updated. Please try again.', 'error');
    } finally { setSavingWatchlist(false); }
  };

  const fliks = useMovieFliksRating(movie?.id);
  const myReview = fliks.reviews?.find((r) => r.userId === user?.uid);

  useEffect(() => {
    if (myReview && !reviewInput) {
      setReviewInput(myReview.reviewText);
    }
  }, [myReview, reviewInput]);

  const handleRate = async (value) => {
    if (!isAuthenticated) {
      showToast('Please sign in to rate movies.', 'warning');
      return;
    }
    await rateMovie(movie.id, value, reviewInput);
    if (value === null) {
      setReviewInput('');
    }
  };

  const handleSaveReview = async () => {
    if (!isAuthenticated) {
      showToast('Please sign in to save a review.', 'warning');
      return;
    }
    setIsSubmittingReview(true);
    try {
      await rateMovie(movie.id, currentRating || 5, reviewInput);
      showToast('Review saved successfully!', 'success');
    } catch (e) {
      console.error(e);
      showToast('Failed to save review.', 'error');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handleRemoveReview = async () => {
    if (!isAuthenticated) {
      showToast('Please sign in to remove a review.', 'warning');
      return;
    }
    setIsSubmittingReview(true);
    try {
      await removeRating(movie.id);
      setReviewInput('');
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      showToast('Couldn’t copy the link. You can copy it from the address bar.', 'info');
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
  const crew = credits?.crew || [];
  const director = crew.find((c) => c.job === 'Director')?.name;
  const writers = crew.filter((c) => c.job === 'Writer' || c.job === 'Screenplay').map((c) => c.name).slice(0, 3).join(', ');
  const composers = crew.filter((c) => c.job === 'Music' || c.job === 'Original Music Composer' || c.job === 'Composer').map((c) => c.name).slice(0, 3).join(', ');

  const inWatchlist = isInWatchLater(movie.id);
  const currentRating = ratings[movie.id] || 0;

  const isUnreleased = (() => {
    if (!movie?.releaseDate) return false;
    try {
      const releaseDate = new Date(movie.releaseDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return releaseDate > today;
    } catch {
      return false;
    }
  })();

  // Compute budget / ROI details
  const formattedBudget = formatUsdToInrCrores(movie.budget);
  const formattedRevenue = formatUsdToInrCrores(movie.revenue);
  let roi = null;
  if (movie.budget > 0 && movie.revenue > 0) {
    roi = (((movie.revenue - movie.budget) / movie.budget) * 100).toFixed(0);
  }

  const writtenReviews = (fliks.reviews || []).filter((review) => review.reviewText?.trim());
  const facts = [
    ['Release date', movie.releaseDate || 'To be announced'],
    ['Runtime', movie.runtime ? `${Math.floor(movie.runtime / 60)}h ${movie.runtime % 60}m` : 'Not available'],
    ['Language', movie.language || 'Not available'],
    ['Director', director],
    ['Screenplay', writers],
    ['Music', composers],
  ].filter(([, value]) => value);

  return (
    <PageShell>
      <Container maxWidth="xl" sx={{ pt: 3, pb: 7 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
          <Button variant="secondary" size="sm" onClick={() => onGoBack?.()} startIcon={<ArrowBackIcon sx={{ fontSize: 16 }} />}>Back</Button>
          <Button variant="secondary" size="sm" onClick={handleShare} startIcon={<ShareIcon sx={{ fontSize: 16 }} />}>{copied ? 'Link copied' : 'Share film'}</Button>
        </Stack>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '260px minmax(0, 1fr)' }, gap: { xs: 4, md: 5, lg: 7 } }}>
          <Box component="aside">
            <Box sx={{ position: { md: 'sticky' }, top: 104, maxWidth: { xs: 230, md: 'none' }, mx: 'auto' }}>
              <Box sx={{ position: 'relative', borderRadius: '6px', overflow: 'hidden', bgcolor: 'background.paper', aspectRatio: '2 / 3' }}>
                {movie.image ? <Box component="img" src={movie.image} alt={`${movie.title} poster`} sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} /> : <Box sx={{ p: 3 }}>Poster unavailable</Box>}
                {trailerKey && (
                  <Box
                    component="button"
                    aria-label={`Play trailer for ${movie.title}`}
                    onClick={() => setIsTrailerOpen(true)}
                    sx={{ position: 'absolute', inset: 0, width: '100%', border: 0, cursor: 'pointer', bgcolor: '#0006', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'opacity 160ms', '@media (hover: hover) and (pointer: fine)': { opacity: 0, '&:hover, &:focus-visible': { opacity: 1 } } }}
                  >
                    <Box component="span" sx={{ display: 'grid', placeItems: 'center', width: 60, height: 60, borderRadius: '50%', bgcolor: '#f0efe9', color: '#242621' }}><PlayArrowIcon sx={{ fontSize: 32 }} /></Box>
                  </Box>
                )}
              </Box>
              {trailerKey ? (
                <Button variant="secondary" onClick={() => setIsTrailerOpen(true)} startIcon={<PlayArrowIcon />} sx={{ width: '100%', mt: 2 }}>Watch trailer</Button>
              ) : <Typography sx={{ color: 'text.secondary', fontSize: 12, mt: 1.5, textAlign: 'center' }}>No trailer available yet</Typography>}
            </Box>
          </Box>

          <Stack spacing={4.5} sx={{ minWidth: 0 }}>
            <Box component="section" aria-labelledby="film-title">
              <Typography sx={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.16em', color: 'primary.main', mb: 1.5 }}>{isUnreleased ? 'Coming soon' : 'The film guide'}</Typography>
              <Typography id="film-title" component="h1" sx={{ fontFamily: 'Georgia, serif', fontSize: { xs: 38, sm: 48, md: 56 }, lineHeight: 1.1, letterSpacing: '-0.035em', overflowWrap: 'anywhere' }}>{movie.title}</Typography>
              <Typography sx={{ color: 'text.secondary', fontSize: 13, mt: 2 }}>{[movie.releaseDate?.slice(0, 4), ...movie.genres].filter(Boolean).join(' · ')}</Typography>
              {movie.tagline && <Typography sx={{ mt: 2, fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 18, color: 'text.secondary' }}>{movie.tagline}</Typography>}
              <Stack direction="row" flexWrap="wrap" useFlexGap spacing={3} sx={{ borderTop: 1, borderBottom: 1, borderColor: 'divider', py: 2.5, mt: 3 }}>
                <Box>
                  <Typography sx={{ fontSize: 10, color: 'text.secondary', mb: 0.5 }}>TMDB RATING</Typography>
                  <Typography sx={{ fontSize: 24, fontWeight: 500 }}>{movie.rating > 0 ? movie.rating.toFixed(1) : '—'}<Box component="span" sx={{ fontSize: 12, color: 'text.secondary' }}> / 10</Box></Typography>
                  <Typography sx={{ fontSize: 11, color: 'text.secondary' }}>{movie.voteCount?.toLocaleString() || 0} votes</Typography>
                </Box>
                <Box sx={{ pl: 3, borderLeft: 1, borderColor: 'divider' }}>
                  <Typography sx={{ fontSize: 10, color: 'text.secondary', mb: 0.5 }}>FLIKS COMMUNITY</Typography>
                  <Typography sx={{ fontSize: 24, fontWeight: 500 }}>{fliks.isLoading ? '…' : fliks.count ? fliks.average : '—'}<Box component="span" sx={{ fontSize: 12, color: 'text.secondary' }}> / 5</Box></Typography>
                  <Typography sx={{ fontSize: 11, color: 'text.secondary' }}>{fliks.count || 0} ratings</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', ml: { sm: 'auto !important' } }}>
                  <Button disabled={savingWatchlist} variant={inWatchlist ? 'secondary' : 'primary'} onClick={handleWatchlist} startIcon={inWatchlist ? <Check size={16} /> : <Plus size={16} />}>{savingWatchlist ? 'Saving…' : inWatchlist ? 'In your watchlist' : 'Add to watchlist'}</Button>
                </Box>
              </Stack>
            </Box>

            <Tabs value={activeTab} onChange={(_, value) => setParams(value === 'box-office' ? { tab: 'box-office' } : {})} aria-label="Movie sections" sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tab id="movie-overview-tab" aria-controls="movie-overview-panel" value="overview" label="Overview" /><Tab id="movie-box-office-tab" aria-controls="movie-box-office-panel" value="box-office" label="Box office" />
            </Tabs>
            {activeTab === 'box-office' ? <Box role="tabpanel" id="movie-box-office-panel" aria-labelledby="movie-box-office-tab"><MovieBoxOffice key={movie.id} movieId={movie.id} movieTitle={movie.title} /></Box> : <Stack role="tabpanel" id="movie-overview-panel" aria-labelledby="movie-overview-tab" spacing={4.5}>
            <Box component="section">
              <SectionHeader title="Synopsis" />
              <Typography sx={{ color: 'text.secondary', fontSize: 14, lineHeight: 1.9, maxWidth: 760 }}>{movie.overview || 'A synopsis is not available yet.'}</Typography>
            </Box>

            <Box component="section" sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1.2fr 1fr' }, gap: { xs: 3, sm: 5 }, py: 3, borderTop: 1, borderBottom: 1, borderColor: 'divider' }}>
              <Box>
                <Typography component="h2" sx={{ fontSize: 17, fontWeight: 500, mb: 2 }}>Film details</Typography>
                <Box component="dl" sx={{ m: 0, display: 'grid', gridTemplateColumns: '100px minmax(0, 1fr)', gap: 1.5 }}>
                  {facts.map(([label, value]) => <Fragment key={label}><Typography component="dt" sx={{ color: 'text.secondary', fontSize: 12 }}>{label}</Typography><Typography component="dd" sx={{ m: 0, fontSize: 12 }}>{value}</Typography></Fragment>)}
                </Box>
              </Box>
              <Box>
                <Typography component="h2" sx={{ fontSize: 17, fontWeight: 500, mb: 2 }}>At the box office</Typography>
                {formattedBudget || formattedRevenue ? (
                  <Stack spacing={1.5}>
                    {[[ 'Budget', formattedBudget ], [ 'Worldwide gross', formattedRevenue ], [ 'Return on investment', roi !== null ? `${Number(roi) > 0 ? '+' : ''}${roi}%` : null ]].filter(([, value]) => value).map(([label, value]) => <Stack key={label} direction="row" justifyContent="space-between" gap={2}><Typography sx={{ fontSize: 12, color: 'text.secondary' }}>{label}</Typography><Typography sx={{ fontSize: 13, fontWeight: 500, whiteSpace: 'nowrap' }}>{value}</Typography></Stack>)}
                    <Typography sx={{ fontSize: 10, color: 'text.secondary', pt: 1 }}>Reported figures from TMDB, converted to INR.</Typography>
                  </Stack>
                ) : <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>Box office figures are not available yet.</Typography>}
              </Box>
            </Box>

            {cast.length > 0 && <Box component="section">
              <SectionHeader title="The cast" subtitle="The people who bring the story to life." />
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(3, minmax(0, 1fr))', sm: 'repeat(4, minmax(0, 1fr))' }, gap: { xs: 2, md: 3 } }}>
                {cast.map((person) => <Box key={person.id} component="button" onClick={() => { setSelectedActorId(person.id); setSelectedActorName(person.name); setIsActorModalOpen(true); }} aria-label={`View ${person.name}`} sx={{ p: 0, border: 0, textAlign: 'left', cursor: 'pointer', bgcolor: 'transparent', color: 'text.primary', '&:hover img': { opacity: 0.8 } }}>
                  <Box sx={{ aspectRatio: '4 / 5', borderRadius: '6px', overflow: 'hidden', bgcolor: 'background.paper', mb: 1.2 }}>
                    <PersonImage src={person.profile_path ? `https://image.tmdb.org/t/p/w185${person.profile_path}` : undefined} name={person.name} sx={{ width: '100%', height: '100%' }} />
                  </Box>
                  <Typography sx={{ fontSize: 12, fontWeight: 500, lineHeight: 1.4 }}>{person.name}</Typography>
                  <Typography sx={{ fontSize: 11, color: 'text.secondary', mt: 0.5 }}>{person.character}</Typography>
                </Box>)}
              </Box>
            </Box>}

            <Box component="section" sx={{ p: { xs: 2.5, sm: 3 }, border: 1, borderColor: 'divider', borderRadius: '6px', bgcolor: 'background.paper' }}>
              <Typography component="h2" sx={{ fontSize: 21, fontWeight: 500, mb: 1 }}>{myReview ? 'Your take on the film' : 'What did you think?'}</Typography>
              {isUnreleased ? <Typography sx={{ color: 'text.secondary', fontSize: 13 }}>Ratings and reviews open after the film is released.</Typography> : isAuthenticated ? (
                <Stack spacing={2}>
                  <Stack direction="row" alignItems="center" flexWrap="wrap" useFlexGap gap={2}>
                    <Typography sx={{ color: 'text.secondary', fontSize: 12 }}>Your rating</Typography>
                    <Rating name={`movie-details-rating-${movie.id}`} value={currentRating} precision={0.5} onChange={(_, value) => handleRate(value)} sx={{ '& .MuiRating-iconFilled': { color: 'primary.main' } }} />
                    {currentRating > 0 && <Button variant="secondary" size="sm" onClick={() => handleRate(null)}>Clear rating</Button>}
                  </Stack>
                  <TextField label="Your review" multiline rows={3} fullWidth placeholder="What stayed with you?" value={reviewInput} onChange={(event) => setReviewInput(event.target.value)} />
                  <Stack direction="row" justifyContent="flex-end" flexWrap="wrap" useFlexGap gap={1.5}>
                    {(currentRating > 0 || myReview) && <Button variant="secondary" onClick={handleRemoveReview} disabled={isSubmittingReview}>Remove review</Button>}
                    <Button onClick={handleSaveReview} disabled={isSubmittingReview}>{isSubmittingReview ? 'Saving…' : 'Save review'}</Button>
                  </Stack>
                </Stack>
              ) : <Stack alignItems="flex-start" spacing={2}><Typography sx={{ color: 'text.secondary', fontSize: 13 }}>Keep a record of what you watch and share your thoughts with the community.</Typography><Button onClick={() => onNavigate?.('signup')}>Sign in to review</Button></Stack>}
            </Box>

            <Box component="section">
              <SectionHeader title={`Community reviews (${writtenReviews.length})`} />
              {writtenReviews.length ? <Stack spacing={3}>{writtenReviews.map((review) => <Box key={review.userId} sx={{ pb: 3, borderBottom: 1, borderColor: 'divider' }}>
                <Stack direction="row" flexWrap="wrap" useFlexGap gap={1.5} alignItems="center" justifyContent="space-between" sx={{ mb: 1.5 }}>
                  <Typography sx={{ fontSize: 13, fontWeight: 500 }}>{review.username}{user?.uid === review.userId ? ' · You' : ''}</Typography>
                  <Stack direction="row" alignItems="center" spacing={1}><Rating value={review.rating || 0} precision={0.5} readOnly size="small" sx={{ '& .MuiRating-iconFilled': { color: 'primary.main' } }} />{user?.uid === review.userId && <IconButton aria-label="Remove your review" onClick={handleRemoveReview} disabled={isSubmittingReview} size="small"><DeleteOutlineIcon fontSize="small" /></IconButton>}</Stack>
                </Stack>
                <Typography sx={{ fontSize: 13, lineHeight: 1.8, whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>{review.reviewText}</Typography>
                <Typography sx={{ color: 'text.secondary', fontSize: 11, mt: 1 }}>{review.updatedAt?.toLocaleDateString()}</Typography>
              </Box>)}</Stack> : <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>No reviews yet. Be the first to share your thoughts.</Typography>}
            </Box>
            </Stack>}
          </Stack>
        </Box>
      </Container>

      <Dialog open={isTrailerOpen} onClose={() => setIsTrailerOpen(false)} aria-labelledby="movie-trailer-title" maxWidth="md" fullWidth>
        <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2} sx={{ px: 2.5, py: 1.5 }}>
          <Typography id="movie-trailer-title" component="h2" sx={{ fontSize: 15 }}>{movie.title} · Trailer</Typography>
          <IconButton aria-label="Close trailer" onClick={() => setIsTrailerOpen(false)}><CloseIcon /></IconButton>
        </Stack>
        {isTrailerOpen && trailerKey && <Box component="iframe" src={`https://www.youtube.com/embed/${encodeURIComponent(trailerKey)}?autoplay=1&playsinline=1&rel=0`} title={`${movie.title} trailer`} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen sx={{ width: '100%', aspectRatio: '16 / 9', border: 0, bgcolor: '#000' }} />}
        <Typography sx={{ px: 2.5, py: 1.5, fontSize: 12, color: 'text.secondary' }}>Player unavailable? <Box component="a" href={`https://www.youtube.com/watch?v=${encodeURIComponent(trailerKey || '')}`} target="_blank" rel="noopener noreferrer" sx={{ color: 'text.primary' }}>Watch on YouTube</Box></Typography>
      </Dialog>
      <ActorModal actorId={selectedActorId} actorName={selectedActorName} open={isActorModalOpen} onClose={() => setIsActorModalOpen(false)} onMovieClick={(id) => navigate(`/movie/${id}`)} />
    </PageShell>
  );
}

export default MovieDetails;
