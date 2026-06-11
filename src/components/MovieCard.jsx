import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Button from './Button';
import { useState } from 'react';

function MovieCard({
  movie,
  variant = 'default',
  rank,
  onViewDetails,
  onAddToWatchlist,
  onRemoveFromWatchlist,
  isInWatchlist,
  onSetReminder,
  onRate,
}) {
  const [hoverRating, setHoverRating] = useState(null);
  const isUpcoming = variant === 'upcoming';
  const currentRating = movie?.ratingValue || 0;
  const displayRating = hoverRating !== null ? hoverRating : currentRating;

  const handleStarHover = (starIndex, e) => {
    if (!onRate) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const isLeftHalf = x < rect.width / 2;
    const rating = starIndex + (isLeftHalf ? 0.5 : 1);
    setHoverRating(rating);
  };

  const handleStarClick = (starIndex, e) => {
    if (!onRate) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
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

  return (
    <Box
      sx={{
        background: 'rgba(22,33,62,0.8)',
        borderRadius: '12px',
        overflow: 'hidden',
        border: '1px solid #2196f3',
        position: 'relative',
        transition: 'all 0.3s ease',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        '&:hover': {
          transform: 'translateY(-8px)',
          boxShadow: '0 10px 30px rgba(33,150,243,0.3)',
          borderColor: '#64b5f6',
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
            backgroundColor: '#2196f3',
            color: '#fff',
            fontWeight: 700,
          }}
        />
      )}

      <Box sx={{ position: 'relative', overflow: 'hidden', paddingTop: '150%' }}>
        <Box
          component="img"
          src={movie.image}
          alt={movie.title}
          sx={{
            position: 'absolute',
            top: 0, left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform 0.5s',
            '&:hover': { transform: 'scale(1.05)' },
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
              backgroundColor: '#2196f3',
              color: '#fff',
              fontSize: '0.65rem',
            }}
          />
        )}
      </Box>

      <Stack p={2} spacing={1.5} flex={1} justifyContent="space-between" alignItems="center">
        <Stack spacing={0.5} width="100%">
          <Typography
            fontWeight="bold"
            fontSize="0.95rem"
            textAlign="center"
            noWrap
            sx={{ color: '#fff' }}
          >
            {movie.title}
          </Typography>

          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.3 }}>
            {[0, 1, 2, 3, 4].map((starIndex) => (
              <Box
                key={starIndex}
                component="button"
                type="button"
                onMouseMove={(e) => handleStarHover(starIndex, e)}
                onMouseLeave={() => setHoverRating(null)}
                onClick={(e) => handleStarClick(starIndex, e)}
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
                {/* Background (empty) star */}
                <Box sx={{ position: 'absolute', color: '#cccccc' }}>☆</Box>
                {/* Filled star - only show for filled portion */}
                <Box
                  sx={{
                    position: 'absolute',
                    color: '#ffb400',
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
            <Typography variant="caption" sx={{ color: 'grey.400', textAlign: 'center', display: 'block' }}>
              {movie.genre}
            </Typography>
          )}

          {!isUpcoming && (
            <>
              <Typography fontWeight="bold" sx={{ color: '#64b5f6', textAlign: 'center', fontSize: '0.875rem' }}>
                {movie.revenue}
              </Typography>
              <Typography variant="caption" sx={{ color: 'grey.400', textAlign: 'center', display: 'block' }}>
                {movie.releaseDate}
              </Typography>
            </>
          )}
        </Stack>

        <Box width="100%">
          {isUpcoming ? (
            <Stack direction="row" spacing={1} width="100%">
              <Button
                variant={watchlistVariant}
                size="sm"
                onClick={watchlistAction}
                sx={{ flex: 1 }}
              >
                {watchlistLabel}
              </Button>
              {onViewDetails && (
                <Button variant="secondary" size="sm" onClick={onViewDetails} sx={{ flex: 1 }}>
                  Details
                </Button>
              )}
            </Stack>
          ) : (
            <Button variant="primary" size="sm" sx={{ width: '100%' }} onClick={onViewDetails}>
              View Details
            </Button>
          )}
        </Box>
      </Stack>
    </Box>
  );
}

export default MovieCard;
