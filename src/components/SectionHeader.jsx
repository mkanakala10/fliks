import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

function SectionHeader({ title, subtitle }) {
  return (
    <Stack spacing={1} mb={5} alignItems="center" textAlign="center">
      <Typography
        variant="h4"
        sx={{ fontSize: { xs: '1.5rem', md: '1.85rem' }, fontWeight: 700, letterSpacing: '-0.02em' }}
      >
        {title}
      </Typography>
      {subtitle && (
        <Typography variant="body1" sx={{ color: 'text.secondary', maxWidth: 560 }}>
          {subtitle}
        </Typography>
      )}
    </Stack>
  );
}

export default SectionHeader;
