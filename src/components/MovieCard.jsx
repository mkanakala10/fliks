import { useState } from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Button from './Button';

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
  const [hoverRating, setHoverRating] = useState(null);
  const isUpcoming = variant === 'upcoming';
  const isClickable = Boolean(onViewDetails);
  const currentRating = movie?.ratingValue || 0;
  const displayRating = hoverRating !== null ? hoverRating : currentRating;

  const handleStarHover = (starIndex, event) => {
    if (!onRate) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const isLeftHalf = x < rect.width / 2;
    const rating = starIndex + (isLeftHalf ? 0.5 : 1);
    setHoverRating(rating);
  };

  const handleStarClick = (starIndex, event) => {
    event.stopPropagation();
    if (!onRate) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const isLeftHalf = x < rect.width / 2;
    const rating = starIndex + (isLeftHalf ? 0.5 : 1);
    onRate(movie.id, rating);
  };

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
        bgcolor: 'background.paper',
        borderRadius: 2,
        overflow: 'hidden',
        border: 1,
        borderColor: 'divider',
        position: 'relative',
        transition: 'transform 0.2s, box-shadow 0.2s, border-color 0.2s',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        cursor: isClickable ? 'pointer' : 'default',
        '&:hover': isClickable
          ? {
              transform: 'translateY(-4px)',
              borderColor: 'text.secondary',
              boxShadow: (theme) =>
                theme.palette.mode === 'dark'
                  ? '0 12px 32px rgba(0,0,0,0.4)'
                  : '0 12px 32px rgba(0,0,0,0.08)',
            }
          : {},
        '&:hover .movie-card-poster': {
          transform: 'scale(1.03)',
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

      <Box sx={{ position: 'relative', overflow: 'hidden', paddingTop: '150%' }}>
        <Box
          className="movie-card-poster"
          component="img"
          src={movie.image}
          alt={movie.title}
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
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
      </Box>

      <Stack p={2} spacing={1.5} flex={1} justifyContent="space-between" alignItems="center">
        <Stack spacing={0.5} width="100%">
          <Typography
            fontWeight={600}
            fontSize="0.95rem"
            textAlign="center"
            noWrap
            color="text.primary"
          >
            {movie.title}
          </Typography>

          <Box
            sx={{ display: 'flex', justifyContent: 'center', gap: 0.3 }}
            onClick={stopPropagation}
          >
            {[0, 1, 2, 3, 4].map((starIndex) => (
              <Box
                key={starIndex}
                component="button"
                type="button"
                onMouseMove={(event) => handleStarHover(starIndex, event)}
                onMouseLeave={() => setHoverRating(null)}
                onClick={(event) => handleStarClick(starIndex, event)}
                sx={{
                  border: 'none',
                  background: 'none',
                  fontSize: '1.2rem',
                  cursor: onRate ? 'pointer' : 'default',
                  p: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  height: '1.2rem',
                  width: '1rem',
                  opacity: onRate ? 1 : 0.6,
                }}
              >
                <Box sx={{ position: 'absolute', color: 'text.disabled' }}>☆</Box>
                <Box
                  sx={{
                    position: 'absolute',
                    color: '#f59e0b',
                    overflow: 'hidden',
                    width: `${Math.max(0, Math.min(100, ((displayRating - starIndex) / 1) * 100))}%`,
                  }}
                >
                  ★
                </Box>
              </Box>
            ))}
          </Box>

          {isUpcoming && movie.genre && (
            <Typography variant="caption" color="text.secondary" textAlign="center" display="block">
              {movie.genre}
            </Typography>
          )}

          {!isUpcoming && (
            <>
              <Typography
                fontWeight={600}
                color="text.primary"
                textAlign="center"
                fontSize="0.875rem"
              >
                {movie.revenue}
              </Typography>
              <Typography variant="caption" color="text.secondary" textAlign="center" display="block">
                {movie.releaseDate}
              </Typography>
            </>
          )}
        </Stack>

        {showWatchlist && (
          <Box width="100%" onClick={stopPropagation}>
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
