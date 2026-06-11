import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import {
  HiHome,
  HiTrendingUp,
  HiSparkles,
  HiBookmark,
  HiUsers,
  HiFilm,
  HiMenu,
  HiLogout,
  HiSearch,
  HiLightningBolt,
} from 'react-icons/hi';
import { useAuth } from '../contexts/AuthContext';

const navItems = [
  { id: 'home', label: 'Home', icon: HiHome },
  { id: 'trending', label: 'Trending', icon: HiTrendingUp },
  { id: 'search', label: 'Search', icon: HiSearch },
  { id: 'recommendations', label: 'For You', icon: HiLightningBolt },
  { id: 'ai-assistant', label: 'AI Assistant', icon: HiSparkles },
  { id: 'watch-later', label: 'Watch Later', icon: HiBookmark },
  { id: 'actors', label: 'Actors', icon: HiUsers },
  { id: 'all-movies', label: 'All Movies', icon: HiFilm },
];

function Navbar({ isOpen, onToggle, currentPage, onNavigate }) {
  const { logout, isAuthenticated, user } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      if (onToggle) onToggle();
      onNavigate('signup');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <>
      {!isOpen && (
        <IconButton
          onClick={onToggle}
          aria-label="Toggle menu"
          sx={{
            position: 'fixed',
            top: 16,
            left: 16,
            zIndex: 50,
            backgroundColor: '#000',
            color: '#fff',
            borderRadius: '6px',
            '&:hover': { backgroundColor: '#222' },
          }}
        >
          <HiMenu size={24} />
        </IconButton>
      )}

      {isOpen && (
        <Box
          onClick={onToggle}
          sx={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            zIndex: 30,
          }}
        />
      )}

      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          height: '100vh',
          width: { xs: '100%', sm: '300px' },
          maxWidth: '300px',
          backgroundColor: '#fff',
          borderRight: '2px solid #000',
          zIndex: 40,
          transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.3s ease',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Stack sx={{ p: 4, pt: 5, flexGrow: 1 }} spacing={0}>
          <Typography
            variant="h6"
            fontWeight="bold"
            mb={4}
            textAlign="center"
            sx={{ color: '#000' }}
          >
            Movie Meter
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
                  justifyContent: 'flex-start',
                  gap: 1.5,
                  px: 3,
                  py: 1.5,
                  borderRadius: '6px',
                  border: 'none',
                  cursor: 'pointer',
                  backgroundColor: isActive ? '#000' : 'transparent',
                  color: isActive ? '#fff' : '#000',
                  transition: 'all 0.2s',
                  '&:hover': {
                    backgroundColor: isActive ? '#000' : '#f0f0f0',
                  },
                }}
              >
                <IconComponent size={20} />
                <Typography component="span" fontWeight={500} fontSize="0.95rem">
                  {item.label}
                </Typography>
              </Box>
            );
          })}
        </Stack>

        {isAuthenticated && (
          <Box sx={{ p: 3, borderTop: '1px solid #eee' }}>
            <Stack spacing={2}>
              <Box sx={{ px: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Signed in as
                </Typography>
                <Typography variant="body1" fontWeight="bold">
                  {user?.displayName || 'User'}
                </Typography>
              </Box>

              <Box
                component="button"
                onClick={handleLogout}
                sx={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  px: 2,
                  py: 1.5,
                  borderRadius: '6px',
                  border: '1px solid #ff4444',
                  cursor: 'pointer',
                  backgroundColor: 'transparent',
                  color: '#ff4444',
                  transition: 'all 0.2s',
                  '&:hover': { backgroundColor: '#fff5f5' },
                }}
              >
                <HiLogout size={20} />
                <Typography component="span" fontWeight={600} fontSize="0.95rem">
                  Sign Out
                </Typography>
              </Box>
            </Stack>
          </Box>
        )}
      </Box>
    </>
  );
}

export default Navbar;
