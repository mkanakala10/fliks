import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

export function useItemsPerView(variant = 'movie') {
  const theme = useTheme();
  const isXl = useMediaQuery(theme.breakpoints.up('xl'));
  const isLg = useMediaQuery(theme.breakpoints.up('lg'));
  const isMd = useMediaQuery(theme.breakpoints.up('md'));
  const isSm = useMediaQuery(theme.breakpoints.up('sm'));

  if (variant === 'actor') {
    if (isXl) return 8;
    if (isLg) return 7;
    if (isMd) return 5;
    if (isSm) return 4;
    return 3;
  }

  if (isXl) return 6;
  if (isLg) return 5;
  if (isMd) return 4;
  if (isSm) return 3;
  return 2;
}
