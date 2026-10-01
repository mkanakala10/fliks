import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Button from './Button';
import { ArrowRight } from 'lucide-react';

export default function CTA({ title, description, buttonText = 'Get started', onButtonClick }) {
  return (
    <Box component="section" sx={{ py: { xs: 4, md: 5 }, my: 3, borderTop: 1, borderBottom: 1, borderColor: 'divider' }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }}>
        <Box>
          <Typography component="h2" sx={{ fontSize: { xs: 24, md: 30 }, fontFamily: 'Georgia, serif', letterSpacing: '-0.025em', mb: 1 }}>{title}</Typography>
          {description && <Typography sx={{ color: 'text.secondary', fontSize: 13 }}>{description}</Typography>}
        </Box>
        <Button variant="secondary" onClick={onButtonClick} endIcon={<ArrowRight size={16} />} sx={{ flexShrink: 0, fontSize: 12 }}>{buttonText}</Button>
      </Stack>
    </Box>
  );
}
