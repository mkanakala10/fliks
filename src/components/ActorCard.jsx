import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';

function ActorCard({ actor }) {
  return (
    <Box
      sx={{
        bgcolor: 'background.paper',
        borderRadius: 2,
        overflow: 'hidden',
        border: 1,
        borderColor: 'divider',
        cursor: 'pointer',
        transition: 'transform 0.2s, box-shadow 0.2s',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: (theme) =>
            theme.palette.mode === 'dark'
              ? '0 8px 24px rgba(0,0,0,0.35)'
              : '0 8px 24px rgba(0,0,0,0.08)',
        },
      }}
    >
      <Box sx={{ position: 'relative', paddingTop: '150%' }}>
        <Box
          component="img"
          src={actor.image}
          alt={actor.name}
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            bgcolor: 'action.hover',
          }}
        />
        <Chip
          label={`${actor.trendingScore}%`}
          size="small"
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            bgcolor: 'primary.main',
            color: 'primary.contrastText',
            fontWeight: 600,
            fontSize: '0.75rem',
          }}
        />
      </Box>

      <Stack spacing={0.5} p={2} alignItems="center" flex={1} justifyContent="center">
        <Typography fontWeight={600} fontSize="0.95rem" textAlign="center">
          {actor.name}
        </Typography>
        <Typography fontSize="0.8rem" color="text.secondary">
          Trending
        </Typography>
      </Stack>
    </Box>
  );
}

export default ActorCard;
