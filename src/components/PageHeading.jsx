import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

export default function PageHeading({ title, subtitle }) {
  return <Box sx={{ textAlign: 'left' }}>
    <Typography component="h1" sx={{ fontFamily: 'Georgia, serif', fontWeight: 400, fontSize: { xs: 36, md: 52 }, letterSpacing: '-0.04em', lineHeight: 1.15, mb: 2 }}>{title}</Typography>
    {subtitle && <Typography sx={{ color: 'text.secondary', fontSize: 13, lineHeight: 1.8, maxWidth: 620 }}>{subtitle}</Typography>}
  </Box>;
}
