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
  const isUpcoming = variant === 'upcoming';
  const isClickable = Boolean(onViewDetails);
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
        {isUpcoming && (
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

          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.5 }}>
            {[1, 2, 3, 4, 5].map((value) => (
              <Box
                key={value}
                component="button"
                type="button"
                onClick={(event) => {
                  stopPropagation(event);
                  onRate?.(movie.id, value);
                }}
                sx={{
                  border: 'none',
                  background: 'none',
                  color: value <= (movie?.ratingValue || 0) ? '#f59e0b' : 'text.disabled',
                  fontSize: '1rem',
                  cursor: 'pointer',
                  p: 0,
                }}
              >
                {value <= (movie?.ratingValue || 0) ? '★' : '☆'}
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
