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
        bgcolor: 'background.paper',
        borderBottom: 1,
        borderColor: 'divider',
        backdropFilter: 'blur(12px)',
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
                  borderColor: 'divider',
                  borderRadius: 2,
                }}
              >
                <HiMenu size={20} />
              </IconButton>
            </Tooltip>
            <Typography
              variant="h6"
              onClick={() => onNavigate?.('home')}
              sx={{
                fontWeight: 700,
                letterSpacing: '-0.03em',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                fontSize: { xs: '1rem', sm: '1.15rem' },
              }}
            >
              Movie Meter
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
                  borderColor: 'divider',
                  borderRadius: 2,
                }}
              >
                {mode === 'dark' ? <HiSun size={18} /> : <HiMoon size={18} />}
              </IconButton>
            </Tooltip>

            {isAuthenticated ? (
              <Stack direction="row" alignItems="center" spacing={1}>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<HiUser size={16} />}
                  onClick={() => onNavigate?.('account')}
                  sx={{
                    display: { xs: 'none', sm: 'inline-flex' },
                    borderColor: 'divider',
                    color: 'text.primary',
                    borderRadius: 2,
                    px: 2,
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
                    borderColor: 'divider',
                    borderRadius: 2,
                  }}
                >
                  <HiUser size={18} />
                </IconButton>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={handleSignOut}
                  sx={{
                    borderColor: 'divider',
                    color: 'text.primary',
                    borderRadius: 2,
                    px: { xs: 1.25, sm: 2 },
                    minWidth: 0,
                    fontSize: { xs: '0.75rem', sm: '0.875rem' },
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
                  bgcolor: 'primary.main',
                  color: 'primary.contrastText',
                  borderRadius: 2,
                  px: { xs: 1.5, sm: 2.5 },
                  boxShadow: 'none',
                  '&:hover': {
                    bgcolor: 'primary.main',
                    opacity: 0.9,
                    boxShadow: 'none',
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
