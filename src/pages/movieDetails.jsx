import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Alert from '@mui/material/Alert';
import Rating from '@mui/material/Rating';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Modal from '@mui/material/Modal';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ShareIcon from '@mui/icons-material/Share';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import CloseIcon from '@mui/icons-material/Close';
import PageShell from '../components/PageShell';
import Button from '../components/Button';
import { useWatchLater } from '../contexts/WatchLaterContext';
import { useNavigation } from '../contexts/NavigationContext';
import { useUserData } from '../contexts/UserDataContext';
import { useAuth } from '../contexts/AuthContext';
import { useMovieFliksRating } from '../hooks/useMovieFliksRating';
import { useToast } from '../contexts/ToastContext';

function MovieDetails() {
  const { movieId: movieIdParam } = useParams();
  const movieId = Number(movieIdParam);
  const { onGoBack, onNavigate } = useNavigation();
  const { ratings, rateMovie } = useUserData();
  const { isAuthenticated } = useAuth();
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
        const [movieRes, creditsRes, videosRes] = await Promise.all([
          fetch(`https://api.themoviedb.org/3/movie/${movieId}?api_key=${apiKey}`),
          fetch(`https://api.themoviedb.org/3/movie/${movieId}/credits?api_key=${apiKey}`),
          fetch(`https://api.themoviedb.org/3/movie/${movieId}/videos?api_key=${apiKey}`),
        ]);

        if (!movieRes.ok) throw new Error('Movie not found');

        const movieData = await movieRes.json();
        const creditsData = creditsRes.ok ? await creditsRes.json() : { cast: [], crew: [] };
        const videosData = videosRes.ok ? await videosRes.json() : { results: [] };

        // Find YouTube trailer key
        const trailer = videosData.results?.find(
          (v) => v.type === 'Trailer' && v.site === 'YouTube'
        ) || videosData.results?.find((v) => v.site === 'YouTube');

        setTrailerKey(trailer ? trailer.key : null);

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
          budget: movieData.budget,
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

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
  const heroBackground = movie.backdrop || movie.image;
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
  const formattedBudget = movie.budget > 0 ? `₹${(movie.budget / 10000000).toFixed(1)} Cr` : null;
  const formattedRevenue = movie.revenue > 0 ? `₹${(movie.revenue / 10000000).toFixed(1)} Cr` : null;
  let roi = null;
  if (movie.budget > 0 && movie.revenue > 0) {
    roi = (((movie.revenue - movie.budget) / movie.budget) * 100).toFixed(0);
  }

  return (
    <PageShell>
      <Box sx={{ position: 'relative', overflow: 'hidden', pb: 8 }}>
        {/* Background glow and backdrop */}
        <Box
          aria-hidden
          sx={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `url(${heroBackground})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center top',
            opacity: 0.15,
            zIndex: 0,
          }}
        />
        <Box
          aria-hidden
          sx={{
            position: 'absolute',
            inset: 0,
            background: (theme) =>
              theme.palette.mode === 'dark'
                ? `linear-gradient(180deg, rgba(7,7,20,0.5) 0%, ${theme.palette.background.default} 90%)`
                : `linear-gradient(180deg, rgba(255,255,255,0.7) 0%, ${theme.palette.background.default} 90%)`,
            zIndex: 1,
          }}
        />

        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2, py: 4 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onGoBack?.()}
              sx={{ borderColor: 'rgba(99, 102, 241, 0.25)' }}
            >
              <ArrowBackIcon sx={{ mr: 0.5, fontSize: 18 }} /> Back
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleShare}
              sx={{
                borderColor: copied ? 'rgba(217, 70, 239, 0.4)' : 'rgba(99, 102, 241, 0.25)',
                color: copied ? '#d946ef' : 'inherit',
                transition: 'all 0.3s',
              }}
            >
              <ShareIcon sx={{ mr: 0.5, fontSize: 16 }} />
              {copied ? 'Link Copied!' : 'Share'}
            </Button>
          </Stack>

          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              alignItems: { xs: 'center', md: 'flex-start' },
              gap: { xs: 4, md: 5 },
            }}
          >
            {/* Poster & Trailer Trigger */}
            <Stack spacing={2} sx={{ flexShrink: 0, width: { xs: 260, sm: 300 } }}>
              <Box
                sx={{
                  position: 'relative',
                  borderRadius: 4,
                  overflow: 'hidden',
                  border: '1px solid rgba(99, 102, 241, 0.15)',
                  boxShadow: '0 24px 48px rgba(0,0,0,0.5)',
                  transition: 'transform 0.3s',
                  '&:hover': { transform: 'scale(1.01)' },
                }}
              >
                <Box
                  component="img"
                  src={movie.image}
                  alt={movie.title}
                  sx={{ width: '100%', display: 'block' }}
                />
                {trailerKey && (
                  <Box
                    onClick={() => setIsTrailerOpen(true)}
                    sx={{
                      position: 'absolute',
                      inset: 0,
                      bgcolor: 'rgba(0,0,0,0.4)',
                      opacity: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      transition: 'opacity 0.25s',
                      '&:hover': { opacity: 1 },
                    }}
                  >
                    <Box
                      sx={{
                        width: 68,
                        height: 68,
                        borderRadius: '50%',
                        bgcolor: 'primary.main',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 0 20px rgba(99, 102, 241, 0.5)',
                      }}
                    >
                      <PlayArrowIcon sx={{ fontSize: 36, color: 'primary.contrastText', ml: 0.3 }} />
                    </Box>
                  </Box>
                )}
              </Box>
              {trailerKey && (
                <Button
                  variant="primary"
                  onClick={() => setIsTrailerOpen(true)}
                  sx={{
                    background: 'linear-gradient(135deg, #6366f1 0%, #d946ef 100%)',
                    borderRadius: 3,
                    py: 1.25,
                    fontWeight: 700,
                  }}
                >
                  <PlayArrowIcon sx={{ mr: 0.5 }} /> Watch Trailer
                </Button>
              )}
            </Stack>

            {/* Movie Info Details */}
            <Box sx={{ flex: 1, minWidth: 0, width: '100%' }}>
              <Stack spacing={3.5}>
                <Box>
                  <Typography variant="h3" fontWeight={900} letterSpacing="-0.03em" sx={{ lineHeight: 1.15 }}>
                    {movie.title}
                  </Typography>
                  {movie.tagline && (
                    <Typography variant="h6" color="text.secondary" fontStyle="italic" sx={{ mt: 1, fontWeight: 500 }}>
                      "{movie.tagline}"
                    </Typography>
                  )}
                </Box>

                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  {movie.genres.map((g) => (
                    <Chip
                      key={g}
                      label={g}
                      size="small"
                      sx={{
                        bgcolor: 'rgba(99, 102, 241, 0.08)',
                        color: '#818cf8',
                        border: '1px solid rgba(99, 102, 241, 0.15)',
                        fontWeight: 600,
                        px: 1,
                      }}
                    />
                  ))}
                </Stack>

                {/* Ratings Cards Grid */}
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
                    gap: 2,
                  }}
                >
                  {/* Fliks Community Card */}
                  <Box
                    sx={{
                      p: 2,
                      bgcolor: 'rgba(15, 14, 38, 0.5)',
                      border: '1px solid rgba(168, 85, 247, 0.25)',
                      borderRadius: 3,
                      boxShadow: '0 8px 32px rgba(168, 85, 247, 0.08)',
                      textAlign: 'center',
                    }}
                  >
                    <Typography variant="caption" sx={{ color: '#c084fc', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                      Fliks Rating
                    </Typography>
                    <Typography variant="h4" fontWeight={800} sx={{ color: '#a855f7', mt: 0.5 }}>
                      {fliks.isLoading ? '...' : fliks.count > 0 ? `★ ${fliks.average}` : '★ --'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {fliks.count} community votes
                    </Typography>
                  </Box>

                  {/* TMDB Card */}
                  <Box
                    sx={{
                      p: 2,
                      bgcolor: 'rgba(15, 14, 38, 0.5)',
                      border: '1px solid rgba(99, 102, 241, 0.15)',
                      borderRadius: 3,
                      textAlign: 'center',
                    }}
                  >
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                      TMDB Rating
                    </Typography>
                    <Typography variant="h4" fontWeight={800} sx={{ color: '#818cf8', mt: 0.5 }}>
                      ★ {movie.rating?.toFixed(1)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {movie.voteCount?.toLocaleString()} votes
                    </Typography>
                  </Box>

                  {/* Watchlist Quick Actions */}
                  <Box
                    sx={{
                      p: 2,
                      bgcolor: 'rgba(15, 14, 38, 0.5)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: 3,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  >
                    <Button
                      variant={inWatchlist ? 'secondary' : 'primary'}
                      size="sm"
                      onClick={handleWatchlist}
                      sx={{
                        width: '100%',
                        py: 1,
                        background: inWatchlist ? 'transparent' : 'linear-gradient(135deg, #6366f1 0%, #d946ef 100%)',
                      }}
                    >
                      {inWatchlist ? 'Remove Watchlist' : 'Add Watchlist'}
                    </Button>
                  </Box>
                </Box>

                {/* Movie Specs */}
                <Stack spacing={1.5} sx={{ bgcolor: 'rgba(255,255,255,0.02)', p: 3, borderRadius: 3, border: '1px solid rgba(255,255,255,0.04)' }}>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography color="text.secondary">Released</Typography>
                    <Typography fontWeight={600}>{movie.releaseDate || 'TBA'}</Typography>
                  </Stack>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography color="text.secondary">Runtime</Typography>
                    <Typography fontWeight={600}>{movie.runtime ? `${movie.runtime} min` : 'TBA'}</Typography>
                  </Stack>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography color="text.secondary">Language</Typography>
                    <Typography fontWeight={600}>{movie.language || 'N/A'}</Typography>
                  </Stack>
                  {(formattedBudget || formattedRevenue) && (
                    <Box sx={{ pt: 1, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                      <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700, color: 'text.secondary' }}>Financials</Typography>
                      {formattedBudget && (
                        <Stack direction="row" justifyContent="space-between">
                          <Typography color="text.secondary" variant="body2">Budget</Typography>
                          <Typography fontWeight={600} variant="body2">{formattedBudget}</Typography>
                        </Stack>
                      )}
                      {formattedRevenue && (
                        <Stack direction="row" justifyContent="space-between">
                          <Typography color="text.secondary" variant="body2">Box Office Revenue</Typography>
                          <Typography fontWeight={600} variant="body2" sx={{ color: '#10b981' }}>{formattedRevenue}</Typography>
                        </Stack>
                      )}
                      {roi && (
                        <Stack direction="row" justifyContent="space-between" sx={{ mt: 0.5 }}>
                          <Typography color="text.secondary" variant="body2">Box Office Success / ROI</Typography>
                          <Typography fontWeight={700} variant="body2" sx={{ color: Number(roi) > 0 ? '#10b981' : '#ef4444' }}>
                            {Number(roi) > 0 ? `+${roi}% Profit` : `${roi}% Loss`}
                          </Typography>
                        </Stack>
                      )}
                    </Box>
                  )}
                  {(director || writers || composers) && (
                    <Box sx={{ pt: 1.5, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                      <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700, color: 'text.secondary' }}>Key Crew</Typography>
                      {director && (
                        <Stack direction="row" justifyContent="space-between">
                          <Typography color="text.secondary" variant="body2">Director</Typography>
                          <Typography fontWeight={600} variant="body2">{director}</Typography>
                        </Stack>
                      )}
                      {writers && (
                        <Stack direction="row" justifyContent="space-between">
                          <Typography color="text.secondary" variant="body2">Writer</Typography>
                          <Typography fontWeight={600} variant="body2" sx={{ maxWidth: '70%', textAlign: 'right' }} noWrap>{writers}</Typography>
                        </Stack>
                      )}
                      {composers && (
                        <Stack direction="row" justifyContent="space-between">
                          <Typography color="text.secondary" variant="body2">Music Composer</Typography>
                          <Typography fontWeight={600} variant="body2" sx={{ maxWidth: '70%', textAlign: 'right' }} noWrap>{composers}</Typography>
                        </Stack>
                      )}
                    </Box>
                  )}
                </Stack>

                {/* Synopsis */}
                <Box>
                  <Typography variant="h5" fontWeight={700} sx={{ mb: 1.5, letterSpacing: '-0.01em' }}>
                    Synopsis
                  </Typography>
                  <Typography variant="body1" color="text.secondary" lineHeight={1.8}>
                    {movie.overview || 'No overview available.'}
                  </Typography>
                </Box>

                {/* Star Rating & Review input */}
                {isUnreleased ? (
                  <Box sx={{ bgcolor: 'rgba(15, 14, 38, 0.45)', p: 3.5, border: '1px solid rgba(99,102,241,0.15)', borderRadius: 4, textAlign: 'center' }}>
                    <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>
                      Rate & Review This Film
                    </Typography>
                    <Typography color="text.secondary" sx={{ mb: 1, fontSize: '0.95rem' }}>
                      Ratings and reviews are not available for upcoming movies.
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#818cf8', fontWeight: 600 }}>
                      Release Date: {movie.releaseDate || 'TBA'}
                    </Typography>
                  </Box>
                ) : isAuthenticated ? (
                  <Box sx={{ bgcolor: 'rgba(15, 14, 38, 0.45)', p: 3, border: '1px solid rgba(99,102,241,0.15)', borderRadius: 4 }}>
                    <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>
                      {myReview ? 'Update Your Rating & Review' : 'Rate & Review This Film'}
                    </Typography>
                    <Stack spacing={2}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Typography color="text.secondary">Your Rating:</Typography>
                        <Rating
                          name={`movie-details-rating-${movie.id}`}
                          value={currentRating}
                          precision={0.5}
                          onChange={(_, value) => {
                            if (value !== null) handleRate(value);
                          }}
                          sx={{
                            '& .MuiRating-iconFilled': { color: '#f59e0b' },
                            '& .MuiRating-iconHover': { color: '#fbbf24' },
                          }}
                        />
                      </Box>
                      <TextField
                        multiline
                        rows={3}
                        fullWidth
                        variant="outlined"
                        placeholder="Write your review here... (What did you like or dislike?)"
                        value={reviewInput}
                        onChange={(e) => setReviewInput(e.target.value)}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 3,
                            bgcolor: 'rgba(7, 7, 20, 0.3)',
                          },
                        }}
                      />
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <Button
                          variant="primary"
                          onClick={handleSaveReview}
                          disabled={isSubmittingReview}
                          sx={{
                            background: 'linear-gradient(135deg, #6366f1 0%, #d946ef 100%)',
                            px: 3,
                          }}
                        >
                          {isSubmittingReview ? 'Saving...' : 'Save Review'}
                        </Button>
                      </Box>
                    </Stack>
                  </Box>
                ) : (
                  <Box sx={{ bgcolor: 'rgba(15, 14, 38, 0.45)', p: 3.5, border: '1px solid rgba(99,102,241,0.15)', borderRadius: 4, textAlign: 'center' }}>
                    <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>
                      Rate & Review This Film
                    </Typography>
                    <Typography color="text.secondary" sx={{ mb: 2.5, fontSize: '0.95rem' }}>
                      Please sign in to write a review and rate this film.
                    </Typography>
                    <Button
                      variant="primary"
                      onClick={() => onNavigate?.('signup')}
                      sx={{
                        background: 'linear-gradient(135deg, #6366f1 0%, #d946ef 100%)',
                        px: 4,
                      }}
                    >
                      Sign In to Review
                    </Button>
                  </Box>
                )}

                {/* Cast Grid */}
                {cast.length > 0 && (
                  <Box mt={2}>
                    <Typography variant="h5" fontWeight={700} mb={3} letterSpacing="-0.02em">
                      Cast
                    </Typography>
                    <Box
                      sx={{
                        display: 'grid',
                        gridTemplateColumns: {
                          xs: 'repeat(2, minmax(0, 1fr))',
                          sm: 'repeat(4, minmax(0, 1fr))',
                          md: 'repeat(4, minmax(0, 1fr))',
                        },
                        gap: 3,
                      }}
                    >
                      {cast.map((person) => (
                        <Stack key={person.id} alignItems="center" spacing={0.75} textAlign="center" sx={{
                          p: 1.5,
                          bgcolor: 'rgba(255,255,255,0.01)',
                          border: '1px solid rgba(255,255,255,0.03)',
                          borderRadius: 3,
                        }}>
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
                              objectPosition: 'top center',
                              border: '2px solid rgba(99, 102, 241, 0.15)',
                            }}
                          />
                          <Typography fontWeight={700} fontSize="0.85rem" lineHeight={1.25}>
                            {person.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" lineHeight={1.25}>
                            {person.character}
                          </Typography>
                        </Stack>
                      ))}
                    </Box>
                  </Box>
                )}

                {/* User Reviews Timeline Section */}
                <Box sx={{ mt: 4 }}>
                  <Typography variant="h5" fontWeight={700} sx={{ mb: 2.5, letterSpacing: '-0.01em' }}>
                    User Reviews ({fliks.reviews?.filter((r) => r.reviewText.trim()).length || 0})
                  </Typography>
                  {fliks.reviews?.filter((r) => r.reviewText.trim()).length > 0 ? (
                    <Stack spacing={2}>
                      {fliks.reviews
                        .filter((r) => r.reviewText.trim())
                        .map((rev, index) => (
                          <Box
                            key={index}
                            sx={{
                              p: 2.5,
                              bgcolor: 'rgba(15, 14, 38, 0.35)',
                              border: '1px solid rgba(255,255,255,0.05)',
                              borderRadius: 3,
                            }}
                          >
                            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                              <Typography fontWeight={700} variant="body2" sx={{ color: '#818cf8' }}>
                                {rev.username}
                              </Typography>
                              <Rating
                                value={rev.rating}
                                precision={0.5}
                                readOnly
                                size="small"
                                sx={{ '& .MuiRating-iconFilled': { color: '#f59e0b' } }}
                              />
                            </Stack>
                            <Typography variant="body2" color="text.primary" sx={{ fontStyle: 'italic', lineHeight: 1.6 }}>
                              "{rev.reviewText}"
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                              {rev.updatedAt?.toLocaleDateString()}
                            </Typography>
                          </Box>
                        ))}
                    </Stack>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No reviews written yet. Be the first to share your thoughts!
                    </Typography>
                  )}
                </Box>
              </Stack>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Embedded Trailer Modal */}
      <Modal
        open={isTrailerOpen}
        onClose={() => setIsTrailerOpen(false)}
        aria-labelledby="movie-trailer-modal"
        sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <Box
          sx={{
            position: 'relative',
            width: '90%',
            maxWidth: 800,
            aspectRatio: '16 / 9',
            bgcolor: '#000',
            border: '2px solid rgba(99, 102, 241, 0.4)',
            boxShadow: '0 0 50px rgba(99, 102, 241, 0.35)',
            borderRadius: 4,
            overflow: 'hidden',
            outline: 'none',
          }}
        >
          <IconButton
            onClick={() => setIsTrailerOpen(false)}
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              zIndex: 10,
              bgcolor: 'rgba(0,0,0,0.5)',
              color: '#fff',
              '&:hover': { bgcolor: 'rgba(0,0,0,0.8)' },
            }}
          >
            <CloseIcon />
          </IconButton>
          {isTrailerOpen && trailerKey && (
            <iframe
              src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1`}
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              style={{ width: '100%', height: '100%', border: 'none' }}
            />
          )}
        </Box>
      </Modal>
    </PageShell>
  );
}

export default MovieDetails;
