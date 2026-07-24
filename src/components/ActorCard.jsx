import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';

function ActorCard({ actor, rank, onClick }) {
  const isClickable = Boolean(onClick);

  return (
    <Box
      onClick={onClick}
      sx={{
        width: '100%',
        bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(15, 14, 38, 0.65)' : 'rgba(255, 255, 255, 0.85)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderRadius: 3,
        overflow: 'hidden',
        border: 1,
        borderColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(99, 102, 241, 0.12)' : 'rgba(0, 0, 0, 0.08)',
        cursor: isClickable ? 'pointer' : 'default',
        transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.4s ease, border-color 0.4s ease',
        '&:hover': {
          transform: 'translateY(-6px)',
          borderColor: 'rgba(99, 102, 241, 0.35)',
          boxShadow: (theme) =>
            theme.palette.mode === 'dark'
              ? '0 16px 36px rgba(99, 102, 241, 0.2), inset 0 0 12px rgba(99, 102, 241, 0.08)'
              : '0 16px 36px rgba(99, 102, 241, 0.1), inset 0 0 12px rgba(99, 102, 241, 0.04)',
        },
        '&:hover .actor-card-image': {
          transform: 'scale(1.05)',
        },
      }}
    >
      <Box
        sx={{
          position: 'relative',
          aspectRatio: '3 / 4',
          width: '100%',
          bgcolor: 'action.hover',
          overflow: 'hidden',
        }}
      >
        <Box
          className="actor-card-image"
          component="img"
          src={actor.image}
          alt={actor.name}
          sx={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'top center',
            display: 'block',
            transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        />
        <Chip
          label={rank ? `#${rank}` : 'Trending'}
          size="small"
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            bgcolor: 'rgba(10, 8, 30, 0.8)',
            color: '#818cf8',
            fontWeight: 700,
            fontSize: '0.65rem',
            height: 22,
            border: '1px solid rgba(99, 102, 241, 0.25)',
            backdropFilter: 'blur(6px)',
            WebkitBackdropFilter: 'blur(6px)',
          }}
        />
      </Box>

      <Box sx={{ px: 1.5, py: 1.5, textAlign: 'center' }}>
        <Typography
          fontWeight={700}
          fontSize="0.875rem"
          lineHeight={1.35}
          color="text.primary"
          sx={{
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            minHeight: '2.7em',
          }}
        >
          {actor.name}
        </Typography>
      </Box>
    </Box>
  );
}

export default ActorCard;
