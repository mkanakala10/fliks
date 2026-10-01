import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { ArrowUpRight } from 'lucide-react';

export default function SectionHeader({ id, title, subtitle, actionLabel, onAction }) {
  return (
    <Stack direction="row" justifyContent="space-between" alignItems="flex-start" gap={2} mb={3}>
      <Stack spacing={0.75} sx={{ minWidth: 0 }}>
        <Typography id={id} component="h2" sx={{ fontSize: { xs: 21, md: 25 }, fontWeight: 500, letterSpacing: '-0.035em', lineHeight: 1.25 }}>{title}</Typography>
        {subtitle && <Typography sx={{ color: 'text.secondary', maxWidth: 640, fontSize: 12, lineHeight: 1.7 }}>{subtitle}</Typography>}
      </Stack>
      {onAction && <Button onClick={onAction} endIcon={<ArrowUpRight size={14} />} sx={{ color: 'text.secondary', whiteSpace: 'nowrap', fontSize: 11, px: 0, minWidth: 'auto' }}>{actionLabel || 'View all'}</Button>}
    </Stack>
  );
}
