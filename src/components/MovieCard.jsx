import { useState } from 'react';
import { useToast } from '../contexts/ToastContext';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Rating from '@mui/material/Rating';
import IconButton from '@mui/material/IconButton';
import ClearIcon from '@mui/icons-material/Clear';
import Button from './Button';
import Star from 'lucide-react/dist/esm/icons/star';

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
  const showToast = useToast();
  const [saving, setSaving] = useState(false);
  const [failedImage, setFailedImage] = useState(null);
  const isUpcoming = variant === 'upcoming';
  const isLandscape = variant === 'landscape';
  const isClickable = Boolean(onViewDetails);
  const currentRating = movie?.ratingValue || 0;
  const tmdbRating = movie?.rating > 0 ? Number(movie.rating) : null;

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
  const showWatchlist = Boolean(watchlistAction);
  const handleWatchlist = async () => {
    if (saving) return;
    setSaving(true);
    try { await watchlistAction(); }
    catch (error) {
      if (error.code !== 'auth/required') showToast('Your watchlist couldn’t be updated. Please try again.', 'error');
    } finally { setSaving(false); }
  };

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
        bgcolor: 'transparent',
        borderRadius: '6px',
        overflow: 'hidden',
        border: 'none',
        position: 'relative',
        transition: 'color 160ms ease',
        display: 'flex',
        flexDirection: isLandscape ? 'row' : 'column',
        height: isLandscape ? '200px' : '100%',
        width: '100%',
        cursor: isClickable ? 'pointer' : 'default',
        '&:hover': isClickable
          ? { color: 'primary.main' }
          : {},
        '&:hover .movie-card-poster': {
          opacity: 0.88,
        },
      }}
    >
      {/* Rank Badge Indicator */}
      {rank !== undefined && (
        <Box
          sx={{
            position: 'absolute',
            top: 10,
            left: 10,
            zIndex: 3,
            bgcolor: '#09090b',
            color: '#ffffff',
            border: '1px solid rgba(255, 255, 255, 0.16)',
            fontFamily: 'ui-monospace, SFMono-Regular, monospace',
            fontWeight: 700,
            fontSize: '0.72rem',
            px: 1.2,
            py: 0.3,
            borderRadius: '6px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.5)',
          }}
        >
          #{rank}
        </Box>
      )}

      {/* Poster Image Container */}
      <Box
        sx={{
          position: 'relative',
          overflow: 'hidden',
          borderRadius: '6px',
          aspectRatio: isLandscape ? 'unset' : '2 / 3',
          width: isLandscape ? { xs: '110px', sm: '135px' } : '100%',
          height: isLandscape ? '100%' : 'auto',
          flexShrink: 0,
          bgcolor: '#09090b',
        }}
      >
        {movie.image && failedImage !== movie.image ? <Box
          className="movie-card-poster"
          component="img"
          src={movie.image}
          alt={movie.title}
          loading="lazy"
          onError={() => setFailedImage(movie.image)}
          sx={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block',
            transition: 'opacity 160ms ease',
          }}
        /> : <Box sx={{ height: '100%', display: 'grid', placeItems: 'center', p: 2, color: '#a8aaa2', fontSize: 12 }}>Poster unavailable</Box>}

        {shouldShowComingSoon() && (
          <Chip
            label="Coming Soon"
            size="small"
            sx={{
              position: 'absolute',
              top: 10,
              right: 10,
              zIndex: 2,
              bgcolor: '#242a23',
              color: '#ffffff',
              fontWeight: 600,
              fontSize: '0.65rem',
              borderRadius: '4px',
            }}
          />
        )}

        {tmdbRating !== null && (
          <Box
            sx={{
              position: 'absolute',
              bottom: 10,
              left: 10,
              zIndex: 2,
              bgcolor: 'rgba(9, 9, 11, 0.85)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              color: '#ffffff',
              fontWeight: 700,
              fontSize: '0.7rem',
              px: 1,
              py: 0.2,
              borderRadius: '6px',
              backdropFilter: 'blur(12px)',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <Star size={11} style={{ color: 'primary.main', fill: '#fbbf24' }} />
            <span style={{ fontFamily: 'ui-monospace, monospace' }}>{tmdbRating.toFixed(1)}</span>
          </Box>
        )}
      </Box>

      {/* Content Metadata */}
      <Stack
        pt={1.5}
        px={isLandscape ? 2 : 0}
        spacing={0.8}
        flex={1}
        justifyContent="flex-start"
        alignItems="flex-start"
        sx={{ minWidth: 0 }}
      >
        <Stack spacing={0.5} width="100%">
          <Typography
            fontWeight={500}
            fontSize="0.86rem"
            textAlign="left"
            color="text.primary"
            sx={{
              lineHeight: 1.3,
              letterSpacing: '-0.01em',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {movie.title}
          </Typography>

          <Typography
            variant="caption"
            sx={{
              color: 'text.secondary',
              fontSize: '0.72rem',
              fontVariantNumeric: 'tabular-nums',
              display: 'block',
            }}
          >
            {movie.releaseDate?.slice(0, 4) || 'TBA'}{movie.genre ? ` · ${movie.genre}` : ''}
          </Typography>
        </Stack>

        {/* User Interactive Rating */}
        {!isUpcoming && <Box onClick={stopPropagation} onKeyDown={stopPropagation} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Rating
            name={`rating-${movie.id}`}
            value={currentRating}
            precision={0.5}
            readOnly={!onRate}
            size="small"
            onChange={(_, value) => onRate?.(movie.id, value)}
            sx={{
              '& .MuiRating-iconFilled': { color: 'primary.main' },
              '& .MuiRating-iconHover': { color: 'primary.main' },
              '& .MuiRating-iconEmpty': { color: 'text.disabled' },
            }}
          />
          {currentRating > 0 && onRate && (
            <IconButton
              size="small"
              onClick={() => onRate?.(movie.id, null)}
              title="Remove rating"
              sx={{ p: 0.25, color: '#71717a', '&:hover': { color: '#ef4444' } }}
            >
              <ClearIcon sx={{ fontSize: 13 }} />
            </IconButton>
          )}
        </Box>}

        {/* Financial / Revenue Metadata Pills */}
        {!isUpcoming && movie.revenue && movie.revenue !== 'Blockbuster' && (
          <Typography
            variant="caption"
            sx={{
              color: 'text.secondary',
              fontWeight: 600,
              fontSize: '0.72rem',
              fontVariantNumeric: 'tabular-nums',
              bgcolor: 'transparent',
              px: 0,
              py: 0,
              borderRadius: '4px',
              border: 'none',
              display: 'inline-block',
            }}
          >
            {movie.revenue}{String(movie.revenue).startsWith('ROI:') ? '' : ' worldwide'}
          </Typography>
        )}

        {showWatchlist && (
          <Box width="100%" pt={0.5} onClick={stopPropagation} onKeyDown={stopPropagation}>
            <Button
              variant={watchlistVariant}
              size="sm"
              onClick={handleWatchlist}
              disabled={saving}
              sx={{
                width: '100%',
                borderRadius: '8px',
                bgcolor: watchlistVariant === 'primary' ? 'primary.main' : 'background.paper',
                color: watchlistVariant === 'primary' ? 'primary.contrastText' : 'text.primary',
                fontWeight: 600,
                '&:hover': {
                  opacity: 0.85,
                },
              }}
            >
              {saving ? 'Saving…' : watchlistLabel}
            </Button>
          </Box>
        )}
      </Stack>
    </Box>
  );
}

export default MovieCard;
