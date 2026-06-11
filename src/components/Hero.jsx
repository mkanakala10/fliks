import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Button from './Button';

function Hero({ stats = [], onNavigate }) {
  return (
    <Box
      component="section"
      sx={{
        py: { xs: 5, md: 7 },
        borderBottom: 1,
        borderColor: 'divider',
      }}
    >
      <Stack spacing={3} alignItems="center" textAlign="center">
        <Typography
          variant="h3"
          sx={{
            fontWeight: 700,
            letterSpacing: '-0.03em',
            fontSize: { xs: '1.75rem', md: '2.5rem' },
            maxWidth: 640,
          }}
        >
          Discover what India is watching
        </Typography>
        <Typography
          variant="body1"
          sx={{ color: 'text.secondary', fontWeight: 400, maxWidth: 560 }}
        >
          Track real-time trends, box office rankings, and audience sentiment
        </Typography>

        <Stack direction="row" spacing={1.5} flexWrap="wrap" justifyContent="center">
          <Button variant="primary" size="md" onClick={() => onNavigate?.('all-movies')}>
            Explore Movies
          </Button>
          <Button variant="secondary" size="md" onClick={() => onNavigate?.('recommendations')}>
            AI Recommendations
          </Button>
        </Stack>
      </Stack>

      {stats.length > 0 && (
        <Stack
          direction="row"
          spacing={{ xs: 4, md: 8 }}
          justifyContent="center"
          flexWrap="wrap"
          mt={{ xs: 5, md: 6 }}
        >
          {stats.map((stat, i) => (
            <Stack key={i} spacing={0.5} alignItems="center">
              <Typography variant="h4" fontWeight={700} letterSpacing="-0.02em">
                {stat.value}
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: 'text.secondary',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  fontSize: '0.7rem',
                }}
              >
                {stat.label}
              </Typography>
            </Stack>
          ))}
        </Stack>
      )}
    </Box>
  );
}

export default Hero;
