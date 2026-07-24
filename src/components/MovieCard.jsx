import { useState } from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Rating from '@mui/material/Rating';
import Button from './Button';
import { useMovieFliksRating } from '../hooks/useMovieFliksRating';

function MovieCard({
  movie,
  variant = 'default',
  rank,
  onViewDetails,
  onAddToWatchlist,
  onRemoveFromWatchlist,
  isInWatchlist,
  onRate,
}) {
  const [hoverRating, setHoverRating] = useState(-1);
  const isUpcoming = variant === 'upcoming';
  const isLandscape = variant === 'landscape';
  const isClickable = Boolean(onViewDetails);
  const currentRating = movie?.ratingValue || 0;
  const tmdbRating = movie?.rating > 0 ? Number(movie.rating) : null;
  const displayRating = hoverRating >= 0 ? hoverRating : currentRating;
  const fliks = useMovieFliksRating(movie?.id);

  const isUnreleased = (() => {
    if (!movie?.releaseDate) return isUpcoming;
    try {
      const releaseDate = new Date(movie.releaseDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return releaseDate > today;
    } catch {
      return false;
    }
  })();

  const shouldShowComingSoon = () => {
    if (!isUpcoming) return false;
    if (!movie?.releaseDate) return true;

    try {
      const releaseDate = new Date(movie.releaseDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return releaseDate > today;
    } catch {
      return true;
    }
  };

  const watchlistAction = isInWatchlist ? onRemoveFromWatchlist : onAddToWatchlist;
  const watchlistLabel = isInWatchlist ? 'Remove' : 'Watchlist';
  const watchlistVariant = isInWatchlist ? 'secondary' : 'primary';
  const showWatchlist = isUpcoming && watchlistAction;

  const handleCardClick = () => {
    onViewDetails?.();
  };

  const handleCardKeyDown = (event) => {
    if (!isClickable) return;
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onViewDetails?.();
    }
  };

  const stopPropagation = (event) => {
    event.stopPropagation();
  };

  return (
    <Box
      onClick={isClickable ? handleCardClick : undefined}
      onKeyDown={isClickable ? handleCardKeyDown : undefined}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      aria-label={isClickable ? `View details for ${movie.title}` : undefined}
      sx={{
        bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(15, 14, 38, 0.65)' : 'rgba(255, 255, 255, 0.85)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderRadius: 3,
        overflow: 'hidden',
        border: 1,
        borderColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(99, 102, 241, 0.12)' : 'rgba(0, 0, 0, 0.08)',
        position: 'relative',
        transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.4s ease, border-color 0.4s ease',
        display: 'flex',
        flexDirection: isLandscape ? { xs: 'column', sm: 'row' } : 'column',
        height: isLandscape ? { xs: 'auto', sm: '185px', md: '200px' } : '100%',
        width: '100%',
        cursor: isClickable ? 'pointer' : 'default',
        '&:hover': isClickable
          ? {
              transform: 'translateY(-6px)',
              borderColor: 'rgba(99, 102, 241, 0.35)',
              boxShadow: (theme) =>
                theme.palette.mode === 'dark'
                  ? '0 16px 36px rgba(99, 102, 241, 0.2), inset 0 0 12px rgba(99, 102, 241, 0.08)'
                  : '0 16px 36px rgba(99, 102, 241, 0.1), inset 0 0 12px rgba(99, 102, 241, 0.04)',
            }
          : {},
        '&:hover .movie-card-poster': {
          transform: 'scale(1.05)',
        },
      }}
    >
      {rank !== undefined && (
        <Chip
          label={`#${rank}`}
          size="small"
          sx={{
            position: 'absolute',
            top: 8,
            left: 8,
            zIndex: 3,
            bgcolor: 'primary.main',
            color: 'primary.contrastText',
            fontWeight: 700,
          }}
        />
      )}

      <Box
        sx={{
          position: 'relative',
          overflow: 'hidden',
          aspectRatio: isLandscape ? { xs: '2 / 3', sm: 'unset' } : '2 / 3',
          width: isLandscape ? { xs: '100%', sm: '130px', md: '140px' } : '100%',
          height: isLandscape ? { xs: 'auto', sm: '100%' } : 'auto',
          flexShrink: 0,
          bgcolor: 'action.hover',
        }}
      >
        <Box
          className="movie-card-poster"
          component="img"
          src={movie.image}
          alt={movie.title}
          sx={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block',
            transition: 'transform 0.4s',
          }}
        />
        {shouldShowComingSoon() && (
          <Chip
            label="Coming Soon"
            size="small"
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              zIndex: 2,
              bgcolor: 'primary.main',
              color: 'primary.contrastText',
              fontSize: '0.65rem',
            }}
          />
        )}
        {tmdbRating !== null && (
          <Chip
            label={`★ ${tmdbRating.toFixed(1)}`}
            size="small"
            sx={{
              position: 'absolute',
              bottom: 8,
              left: 8,
              zIndex: 2,
              bgcolor: 'rgba(0,0,0,0.75)',
              color: '#fff',
              fontWeight: 600,
              fontSize: '0.7rem',
              height: 24,
              backdropFilter: 'blur(4px)',
            }}
          />
        )}
      </Box>

      <Stack
        p={1.5}
        spacing={1}
        flex={1}
        justifyContent="center"
        alignItems={isLandscape ? { xs: 'center', sm: 'flex-start' } : 'center'}
        sx={{ minHeight: isLandscape ? { xs: 148, sm: 'unset' } : 148, minWidth: 0 }}
      >
        <Typography
          fontWeight={600}
          fontSize="0.875rem"
          textAlign={isLandscape ? { xs: 'center', sm: 'left' } : 'center'}
          color="text.primary"
          sx={{
            width: '100%',
            minHeight: '2.5em',
            lineHeight: 1.25,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {movie.title}
        </Typography>

        {!isUnreleased && (
          <Box onClick={stopPropagation} sx={{ lineHeight: 0 }}>
            <Rating
              name={`rating-${movie.id}`}
              value={currentRating}
              precision={0.5}
              readOnly={!onRate}
              size="small"
              onChange={(_, value) => {
                if (value !== null) onRate?.(movie.id, value);
              }}
              onChangeActive={(_, value) => setHoverRating(value ?? -1)}
              sx={{
                '& .MuiRating-iconFilled': { color: '#f59e0b' },
                '& .MuiRating-iconHover': { color: '#fbbf24' },
                '& .MuiRating-iconEmpty': { color: 'action.disabled' },
              }}
            />
          </Box>
        )}

        <Box sx={{ minHeight: 48, display: 'flex', flexDirection: 'column', alignItems: isLandscape ? { xs: 'center', sm: 'flex-start' } : 'center', justifyContent: 'center', gap: 0.25 }}>
          <Typography variant="caption" sx={{ color: '#a855f7', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 0.5 }}>
            Fliks: {fliks.isLoading ? '...' : fliks.count > 0 ? `★ ${fliks.average} (${fliks.count} votes)` : '★ -- (0 votes)'}
          </Typography>

          {(displayRating > 0 || tmdbRating !== null) && (
            <Typography variant="caption" color="text.secondary" textAlign={isLandscape ? { xs: 'center', sm: 'left' } : 'center'}>
              {displayRating > 0 && (
                <>
                  You:{' '}
                  <Box component="span" sx={{ color: '#f59e0b', fontWeight: 600 }}>
                    {displayRating.toFixed(1)}
                  </Box>
                </>
              )}
              {displayRating > 0 && tmdbRating !== null && ' · '}
              {tmdbRating !== null && <>TMDB {tmdbRating.toFixed(1)}</>}
            </Typography>
          )}
        </Box>

        <Box sx={{ minHeight: 36, width: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          {isUpcoming && (
            <>
              {movie.genre && (
                <Typography variant="caption" color="text.secondary" textAlign="center" display="block" noWrap>
                  {movie.genre}
                </Typography>
              )}
              {movie.releaseDate && movie.releaseDate !== 'TBA' && (
                <Typography variant="caption" color="text.secondary" textAlign="center" display="block" noWrap>
                  {movie.releaseDate}
                </Typography>
              )}
            </>
          )}

          {!isUpcoming && (
            <>
              <Typography
                fontWeight={600}
                color="text.primary"
                textAlign={isLandscape ? { xs: 'center', sm: 'left' } : 'center'}
                fontSize="0.8rem"
                noWrap
              >
                {movie.revenue}
              </Typography>
              {movie.budget && movie.budget !== 'N/A' && (
                <Typography
                  variant="caption"
                  color="text.secondary"
                  textAlign={isLandscape ? { xs: 'center', sm: 'left' } : 'center'}
                  display="block"
                  noWrap
                >
                  Budget: {movie.budget}
                </Typography>
              )}
              <Typography
                variant="caption"
                color="text.secondary"
                textAlign={isLandscape ? { xs: 'center', sm: 'left' } : 'center'}
                display="block"
                noWrap
              >
                {movie.releaseDate}
              </Typography>
            </>
          )}
        </Box>

        {showWatchlist && (
          <Box width="100%" mt="auto" pt={0.5} onClick={stopPropagation}>
            <Button variant={watchlistVariant} size="sm" onClick={watchlistAction} sx={{ width: '100%' }}>
              {watchlistLabel}
            </Button>
          </Box>
        )}
      </Stack>
    </Box>
  );
}

export default MovieCard;
