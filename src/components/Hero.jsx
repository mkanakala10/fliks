import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Button from './Button';

function Hero({ stats = [], onNavigate }) {
  return (
    <Box
      component="section"
      sx={{
        py: { xs: 6, md: 9 },
        borderBottom: 1,
        borderColor: 'rgba(99, 102, 241, 0.12)',
        position: 'relative',
      }}
    >
      {/* Visual Ambient Glow */}
      <Box
        aria-hidden
        sx={{
          position: 'absolute',
          top: '-20%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: { xs: '280px', md: '550px' },
          height: { xs: '280px', md: '450px' },
          background: 'radial-gradient(circle, rgba(99, 102, 241, 0.22) 0%, rgba(217, 70, 239, 0.08) 50%, transparent 100%)',
          filter: 'blur(60px)',
          zIndex: 0,
          pointerEvents: 'none',
        }}
      />

      <Stack spacing={3.5} alignItems="center" textAlign="center" sx={{ position: 'relative', zIndex: 1 }}>
        <Typography
          variant="h3"
          sx={{
            fontWeight: 900,
            letterSpacing: '-0.04em',
            fontSize: { xs: '2.2rem', md: '3.6rem' },
            maxWidth: 720,
            lineHeight: 1.15,
            background: 'linear-gradient(135deg, #818cf8 0%, #c084fc 40%, #f472b6 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Discover what India is watching
        </Typography>
        <Typography
          variant="body1"
          sx={{ color: 'text.secondary', fontWeight: 500, fontSize: { xs: '0.95rem', md: '1.1rem' }, maxWidth: 580 }}
        >
          Track real-time trends, box office rankings, and audience sentiment
        </Typography>

        <Stack direction="row" spacing={2} flexWrap="wrap" justifyContent="center">
          <Button
            variant="primary"
            size="large"
            onClick={() => onNavigate?.('all-movies')}
            sx={{
              background: 'linear-gradient(135deg, #6366f1 0%, #d946ef 100%)',
              boxShadow: '0 4px 20px rgba(99, 102, 241, 0.35)',
              px: 4,
              '&:hover': {
                background: 'linear-gradient(135deg, #4f46e5 0%, #c084fc 100%)',
              },
            }}
          >
            Explore Movies
          </Button>
          <Button
            variant="secondary"
            size="large"
            onClick={() => onNavigate?.('recommendations')}
            sx={{
              borderColor: 'rgba(255, 255, 255, 0.15)',
              px: 4,
              '&:hover': {
                bgcolor: 'rgba(255, 255, 255, 0.05)',
              },
            }}
          >
            For You
          </Button>
        </Stack>
      </Stack>

      {stats.length > 0 && (
        <Stack
          direction="row"
          spacing={{ xs: 3, md: 5 }}
          justifyContent="center"
          flexWrap="wrap"
          useFlexGap
          mt={{ xs: 6, md: 8 }}
          sx={{ position: 'relative', zIndex: 1 }}
        >
          {stats.map((stat, i) => (
            <Box
              key={i}
              sx={{
                bgcolor: 'rgba(15, 14, 38, 0.45)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                border: '1px solid rgba(99, 102, 241, 0.1)',
                borderRadius: 4,
                px: { xs: 3, md: 5 },
                py: 2.5,
                textAlign: 'center',
                minWidth: 140,
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  borderColor: 'rgba(99, 102, 241, 0.25)',
                },
              }}
            >
              <Typography
                variant="h4"
                fontWeight={800}
                letterSpacing="-0.03em"
                sx={{
                  background: 'linear-gradient(135deg, #818cf8 0%, #f472b6 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                {stat.value}
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: 'text.secondary',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  fontWeight: 700,
                  fontSize: '0.7rem',
                  mt: 0.5,
                  display: 'block',
                }}
              >
                {stat.label}
              </Typography>
            </Box>
          ))}
        </Stack>
      )}
    </Box>
  );
}

export default Hero;
