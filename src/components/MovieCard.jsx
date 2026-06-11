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
  onSetReminder,
  onRate,
}) {
  const isUpcoming = variant === 'upcoming';

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
        {isUpcoming && (
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

          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.5 }}>
            {[1, 2, 3, 4, 5].map((value) => (
              <Box
                key={value}
                component="button"
                type="button"
                onClick={() => onRate?.(movie.id, value)}
                sx={{
                  border: 'none',
                  background: 'none',
                  color: value <= (movie?.ratingValue || 0) ? '#ffb400' : '#cccccc',
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
