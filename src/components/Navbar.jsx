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
            bgcolor: 'rgba(3, 3, 10, 0.6)',
            backdropFilter: 'blur(6px)',
            WebkitBackdropFilter: 'blur(6px)',
            zIndex: 1150,
          }}
        />
      )}

      <Box
        sx={{
          position: 'fixed',
          top: { xs: 16, sm: 88 },
          left: isOpen ? { xs: 16, sm: 24 } : -320,
          height: { xs: 'calc(100vh - 32px)', sm: 'calc(100vh - 112px)' },
          width: { xs: 'calc(100% - 32px)', sm: 260 },
          maxWidth: 280,
          bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(15, 14, 38, 0.7)' : 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderRadius: 4,
          border: 1,
          borderColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(99, 102, 241, 0.15)' : 'rgba(0, 0, 0, 0.08)',
          zIndex: 1200,
          transition: 'left 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
          boxShadow: '0 16px 40px rgba(0, 0, 0, 0.5)',
          display: 'flex',
          flexDirection: 'column',
          pt: 3,
          pb: 2,
        }}
      >
        <Stack sx={{ p: 2, flexGrow: 1 }} spacing={0.5}>
          <Typography
            variant="overline"
            sx={{ px: 2, pb: 1.5, color: 'text.secondary', letterSpacing: '0.08em', fontWeight: 700 }}
          >
            Fliks Menu
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
                  px: 2.25,
                  py: 1.5,
                  borderRadius: 3,
                  border: 'none',
                  cursor: 'pointer',
                  bgcolor: isActive ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                  color: isActive ? '#818cf8' : 'text.secondary',
                  borderLeft: isActive ? '4px solid #6366f1' : '4px solid transparent',
                  pl: isActive ? 1.75 : 2.25,
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    bgcolor: isActive
                      ? 'rgba(99, 102, 241, 0.2)'
                      : (theme) => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.04)',
                    color: isActive ? '#818cf8' : 'text.primary',
                    transform: 'translateX(4px)',
                  },
                }}
              >
                <IconComponent size={18} style={{ color: isActive ? '#818cf8' : 'inherit' }} />
                <Typography component="span" fontWeight={isActive ? 700 : 500} fontSize="0.9rem">
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
