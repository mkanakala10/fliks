import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import { HiMenu, HiMoon, HiSun, HiSearch } from 'react-icons/hi';
import { NavLink, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useColorMode } from '../contexts/ColorModeContext';
import { useNavigation } from '../contexts/NavigationContext';

const links = [['/', 'Discover'], ['/all-movies', 'Movies'], ['/box-office', 'Box office'], ['/watch-later', 'Watchlist']];

export default function Header() {
  const { isAuthenticated } = useAuth();
  const { mode, toggleColorMode } = useColorMode();
  const { onToggleNav } = useNavigation();
  return (
    <Box component="header" sx={{ position: 'sticky', top: 0, zIndex: 1100, bgcolor: 'background.default', borderBottom: 1, borderColor: 'divider' }}>
      <Container maxWidth="xl">
        <Stack direction="row" alignItems="center" spacing={{ xs: 1, md: 4 }} sx={{ height: { xs: 64, md: 76 } }}>
          <Box component={Link} to="/" aria-label="Fliks home" sx={{ textDecoration: 'none', fontSize: 29, fontWeight: 800, letterSpacing: '-1.7px', display: 'flex', alignItems: 'baseline' }}>
            fliks<Box component="span" sx={{ color: 'primary.main' }}>.</Box>
          </Box>
          <Stack component="nav" aria-label="Main navigation" direction="row" spacing={3} sx={{ display: { xs: 'none', md: 'flex' }, alignSelf: 'stretch', alignItems: 'stretch' }}>
            {links.map(([to, label]) => <Box key={to} component={NavLink} to={to} end={to === '/'} sx={{ display: 'flex', alignItems: 'center', position: 'relative', textDecoration: 'none', color: 'text.secondary', fontSize: 13, fontWeight: 500, '&:hover': { color: 'text.primary' }, '&.active': { color: 'text.primary', '&::after': { content: '""', position: 'absolute', bottom: -1, left: 0, right: 0, height: 2, bgcolor: 'primary.main' } } }}>{label}</Box>)}
          </Stack>
          <Box sx={{ flex: 1 }} />
          <Stack direction="row" spacing={{ xs: 0.25, sm: 1 }} alignItems="center">
            <Tooltip title="Search films"><IconButton component={Link} to="/search" aria-label="Search films" sx={{ color: 'text.secondary', width: 40, height: 40 }}><HiSearch size={19} /></IconButton></Tooltip>
            <Tooltip title={mode === 'dark' ? 'Light mode' : 'Dark mode'}><IconButton onClick={toggleColorMode} aria-label="Toggle color mode" sx={{ color: 'text.secondary', width: 40, height: 40 }}>{mode === 'dark' ? <HiSun size={18} /> : <HiMoon size={18} />}</IconButton></Tooltip>
            <Button component={Link} to={isAuthenticated ? '/account' : '/signup'} variant="outlined" size="small" sx={{ color: 'text.primary', borderColor: 'divider', whiteSpace: 'nowrap', mx: 0.5 }}>{isAuthenticated ? 'My account' : 'Sign in'}</Button>
            <IconButton onClick={onToggleNav} aria-label="Open navigation menu" sx={{ color: 'text.primary', width: 40, height: 40 }}><HiMenu size={21} /></IconButton>
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
}
