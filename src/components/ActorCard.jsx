import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';

function ActorCard({ actor, onClick }) {
  return (
    <Box
      onClick={onClick}
      sx={{
        width: '100%',
        bgcolor: 'background.paper',
        borderRadius: 2,
        overflow: 'hidden',
        border: 1,
        borderColor: 'divider',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'transform 0.2s, box-shadow 0.2s, border-color 0.2s',
        '&:hover': onClick
          ? {
              transform: 'translateY(-4px)',
              borderColor: 'text.secondary',
              boxShadow: (theme) =>
                theme.palette.mode === 'dark'
                  ? '0 8px 24px rgba(0,0,0,0.35)'
                  : '0 8px 24px rgba(0,0,0,0.08)',
            }
          : {},
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
          component="img"
          src={actor.image}
          alt={actor.name}
          sx={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'top center',
            display: 'block',
          }}
        />
        <Chip
          label={`${actor.trendingScore}%`}
          size="small"
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            bgcolor: 'rgba(0,0,0,0.72)',
            color: '#fff',
            fontWeight: 600,
            fontSize: '0.7rem',
            height: 22,
            backdropFilter: 'blur(4px)',
          }}
        />
      </Box>

      <Box sx={{ px: 1.25, py: 1.25, textAlign: 'center' }}>
        <Typography
          fontWeight={600}
          fontSize="0.8rem"
          lineHeight={1.25}
          color="text.primary"
          sx={{
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            minHeight: '2.5em',
          }}
        >
          {actor.name}
        </Typography>
        <Typography variant="caption" color="text.secondary" display="block" mt={0.25}>
          Trending
        </Typography>
      </Box>
    </Box>
  );
}

export default ActorCard;
