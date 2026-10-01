import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import {
  HiHome,
  HiX,
  HiTrendingUp,
  HiSparkles,
  HiUsers,
  HiFilm,
  HiSearch,
  HiChartBar,
  HiStar,
  HiBookmark,
} from 'react-icons/hi';

const navItems = [
  { id: 'home', label: 'Home', icon: HiHome },
  { id: 'trending', label: 'Trending', icon: HiTrendingUp },
  { id: 'ratings', label: 'My Ratings', icon: HiStar },
  { id: 'watch-later', label: 'Watchlist', icon: HiBookmark },
  { id: 'search', label: 'Search', icon: HiSearch },
  { id: 'all-movies', label: 'All Movies', icon: HiFilm },
  { id: 'box-office', label: 'Box Office', icon: HiChartBar },
  { id: 'actors', label: 'Actors', icon: HiUsers },
  { id: 'ai-assistant', label: 'AI Assistant', icon: HiSparkles },
];

function Navbar({ isOpen, onToggle, currentPage, onNavigate }) {
  return (
    <Drawer open={isOpen} onClose={onToggle} PaperProps={{ sx: { width: 280, borderRight: 1, borderColor: 'divider', p: 2 } }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3, px: 1 }}>
        <Typography fontSize={24} fontWeight={700} letterSpacing="-1px">fliks.</Typography>
        <IconButton aria-label="Close navigation menu" onClick={onToggle}><HiX size={20} /></IconButton>
      </Stack>
      <Box component="nav" aria-label="All pages">
        {navItems.map(({ id, label, icon }) => {
          const Icon = icon;
          return (
          <Box key={id} component="button" onClick={() => onNavigate(id)} aria-current={currentPage === id ? 'page' : undefined} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, width: '100%', px: 2, py: 1.5, mb: 0.5, border: 0, borderRadius: '6px', cursor: 'pointer', textAlign: 'left', bgcolor: currentPage === id ? 'action.selected' : 'transparent', color: currentPage === id ? 'primary.main' : 'text.secondary', '&:hover': { bgcolor: 'action.hover', color: 'text.primary' } }}>
            <Icon size={18} /><Typography component="span" fontSize={13}>{label}</Typography>
          </Box>
        ); })}
      </Box>
    </Drawer>
  );
}
export default Navbar;
