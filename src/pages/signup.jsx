import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import PageShell from '../components/PageShell';
import Button from '../components/Button';
import { useAuth } from '../contexts/AuthContext';

function Signup({ onNavigate }) {
  const { signInWithGoogle, isAuthenticated, user } = useAuth();

  const handleSignIn = async () => {
    const loggedInUser = await signInWithGoogle();
    if (loggedInUser) {
      onNavigate('home');
    }
  };

  return (
    <PageShell>
      <Container maxWidth="sm" sx={{ py: { xs: 6, md: 10 } }}>
        <Box
          sx={{
            bgcolor: 'background.paper',
            border: 1,
            borderColor: 'divider',
            borderRadius: 3,
            p: { xs: 3, md: 5 },
            textAlign: 'center',
          }}
        >
          <Stack spacing={3}>
            <Typography variant="h4" fontWeight={700} letterSpacing="-0.02em">
              {isAuthenticated ? `Welcome back, ${user?.displayName}` : 'Sign in to Movie Meter'}
            </Typography>
            <Typography color="text.secondary">
              Access full rating features after authentication. Your data is synced with your account.
            </Typography>
            <Button
              variant="primary"
              size="md"
              onClick={handleSignIn}
              sx={{ width: '100%', maxWidth: 350, mx: 'auto' }}
            >
              {isAuthenticated ? 'Continue to Home' : 'Sign in with Google'}
            </Button>
          </Stack>
        </Box>
      </Container>
    </PageShell>
  );
}

export default Signup;
