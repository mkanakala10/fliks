import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import {
  HiHome,
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
    <>
      {isOpen && (
        <Box
          onClick={onToggle}
          sx={{
            position: 'fixed',
            inset: 0,
            bgcolor: 'rgba(0,0,0,0.45)',
            zIndex: 1150,
          }}
        />
      )}

      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          height: '100vh',
          width: { xs: '100%', sm: 280 },
          maxWidth: 280,
          bgcolor: 'background.paper',
          borderRight: 1,
          borderColor: 'divider',
          zIndex: 1200,
          transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.25s ease',
          display: 'flex',
          flexDirection: 'column',
          pt: '64px',
        }}
      >
        <Stack sx={{ p: 2, flexGrow: 1 }} spacing={0.5}>
          <Typography
            variant="overline"
            sx={{ px: 1.5, pb: 1, color: 'text.secondary', letterSpacing: '0.08em' }}
          >
            Navigation
          </Typography>

          {navItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = currentPage === item.id;
            return (
              <Box
                key={item.id}
                component="button"
                onClick={() => {
                  onNavigate(item.id);
                  onToggle();
                }}
                sx={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  px: 1.5,
                  py: 1.25,
                  borderRadius: 2,
                  border: 'none',
                  cursor: 'pointer',
                  bgcolor: isActive ? 'action.selected' : 'transparent',
                  color: isActive ? 'text.primary' : 'text.secondary',
                  transition: 'background-color 0.15s',
                  '&:hover': {
                    bgcolor: isActive ? 'action.selected' : 'action.hover',
                  },
                }}
              >
                <IconComponent size={18} />
                <Typography component="span" fontWeight={isActive ? 600 : 500} fontSize="0.9rem">
                  {item.label}
                </Typography>
              </Box>
            );
          })}
        </Stack>
      </Box>
    </>
  );
}

export default Navbar;
