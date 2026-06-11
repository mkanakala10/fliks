import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Button from './Button';

function Hero({ stats = [], onNavigate }) {
  return (
    <Box
      component="section"
      sx={{
        py: { xs: 6, md: 8, lg: 10 },
        borderBottom: '2px solid #2196f3',
      }}
    >
      <Container maxWidth="xl">
        <Stack spacing={3} alignItems="center" textAlign="center">
          <Typography
            variant="h5"
            sx={{ color: '#90caf9', fontWeight: 400, maxWidth: '700px' }}
          >
            Track real-time trends, box office rankings, and audience sentiment
          </Typography>

          <Stack direction="row" spacing={2} flexWrap="wrap" justifyContent="center">
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
            mt={{ xs: 6, md: 8 }}
          >
            {stats.map((stat, i) => (
              <Stack key={i} spacing={0.5} alignItems="center">
                <Typography variant="h4" fontWeight={700}>
                  {stat.value}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ color: '#90caf9', textTransform: 'uppercase', letterSpacing: '0.5px' }}
                >
                  {stat.label}
                </Typography>
              </Stack>
            ))}
          </Stack>
        )}
      </Container>
    </Box>
  );
}

export default Hero;
