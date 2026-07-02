import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import { HiMenu, HiMoon, HiSun, HiUser } from 'react-icons/hi';
import { useAuth } from '../contexts/AuthContext';
import { useColorMode } from '../contexts/ColorModeContext';
import { useNavigation } from '../contexts/NavigationContext';

function Header() {
  const { isAuthenticated, user, logout } = useAuth();
  const { mode, toggleColorMode } = useColorMode();
  const { onNavigate, onToggleNav } = useNavigation();

  const handleSignOut = async () => {
    await logout();
    onNavigate?.('home');
  };

  return (
    <Box
      component="header"
      sx={{
        position: 'sticky',
        top: 0,
        zIndex: 1100,
        bgcolor: 'rgba(7, 7, 20, 0.7)',
        borderBottom: 1,
        borderColor: 'rgba(99, 102, 241, 0.15)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
      }}
    >
      <Container maxWidth="xl">
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ minHeight: 64, gap: 2 }}
        >
          {/* Left: menu + brand */}
          <Stack direction="row" alignItems="center" spacing={1.5} sx={{ minWidth: 0 }}>
            <Tooltip title="Menu">
              <IconButton
                onClick={onToggleNav}
                aria-label="Open navigation menu"
                size="small"
                sx={{
                  border: 1,
                  borderColor: 'rgba(99, 102, 241, 0.25)',
                  borderRadius: 2,
                  color: '#818cf8',
                  bgcolor: 'rgba(99, 102, 241, 0.05)',
                  '&:hover': {
                    bgcolor: 'rgba(99, 102, 241, 0.15)',
                  },
                }}
              >
                <HiMenu size={20} />
              </IconButton>
            </Tooltip>
            <Typography
              variant="h6"
              onClick={() => onNavigate?.('home')}
              sx={{
                fontWeight: 900,
                letterSpacing: '-0.04em',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                fontSize: { xs: '1.25rem', sm: '1.45rem' },
                background: 'linear-gradient(135deg, #818cf8 0%, #c084fc 50%, #f472b6 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Fliks
            </Typography>
          </Stack>

          {/* Right: theme + auth */}
          <Stack direction="row" alignItems="center" spacing={1}>
            <Tooltip title={mode === 'dark' ? 'Light mode' : 'Dark mode'}>
              <IconButton
                onClick={toggleColorMode}
                aria-label="Toggle color mode"
                size="small"
                sx={{
                  border: 1,
                  borderColor: 'rgba(99, 102, 241, 0.25)',
                  borderRadius: 2.5,
                  color: '#818cf8',
                  bgcolor: 'rgba(99, 102, 241, 0.05)',
                  '&:hover': {
                    bgcolor: 'rgba(99, 102, 241, 0.15)',
                  },
                }}
              >
                {mode === 'dark' ? <HiSun size={18} /> : <HiMoon size={18} />}
              </IconButton>
            </Tooltip>

            {isAuthenticated ? (
              <Stack direction="row" alignItems="center" spacing={1.5}>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<HiUser size={16} />}
                  onClick={() => onNavigate?.('account')}
                  sx={{
                    display: { xs: 'none', sm: 'inline-flex' },
                    borderColor: 'rgba(99, 102, 241, 0.25)',
                    color: 'text.primary',
                    borderRadius: 2.5,
                    px: 2,
                    '&:hover': {
                      borderColor: 'rgba(99, 102, 241, 0.45)',
                      bgcolor: 'rgba(99, 102, 241, 0.05)',
                    },
                  }}
                >
                  Account
                </Button>
                <IconButton
                  onClick={() => onNavigate?.('account')}
                  aria-label="My account"
                  size="small"
                  sx={{
                    display: { xs: 'inline-flex', sm: 'none' },
                    border: 1,
                    borderColor: 'rgba(99, 102, 241, 0.25)',
                    borderRadius: 2.5,
                    color: '#818cf8',
                  }}
                >
                  <HiUser size={18} />
                </IconButton>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={handleSignOut}
                  sx={{
                    borderColor: 'rgba(217, 70, 239, 0.25)',
                    color: '#f472b6',
                    borderRadius: 2.5,
                    px: { xs: 1.25, sm: 2 },
                    minWidth: 0,
                    fontSize: { xs: '0.75rem', sm: '0.875rem' },
                    '&:hover': {
                      borderColor: 'rgba(217, 70, 239, 0.45)',
                      bgcolor: 'rgba(217, 70, 239, 0.05)',
                    },
                  }}
                >
                  Sign out
                </Button>
              </Stack>
            ) : (
              <Button
                variant="contained"
                size="small"
                onClick={() => onNavigate?.('signup')}
                sx={{
                  background: 'linear-gradient(135deg, #6366f1 0%, #d946ef 100%)',
                  color: '#ffffff',
                  borderRadius: 2.5,
                  px: { xs: 2, sm: 3 },
                  fontWeight: 700,
                  boxShadow: '0 4px 15px rgba(99, 102, 241, 0.3)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #4f46e5 0%, #c084fc 100%)',
                    boxShadow: '0 6px 20px rgba(99, 102, 241, 0.4)',
                  },
                }}
              >
                Sign in
              </Button>
            )}
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
}

export default Header;
