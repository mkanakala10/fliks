import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import PageShell from '../components/PageShell';
import { useAuth } from '../contexts/AuthContext';
import { useUserData } from '../contexts/UserDataContext';

function Settings() {
  const navigate = useNavigate();
  const { user, isAuthenticated, resetPassword } = useAuth();
  const { ratings, loading } = useUserData();
  const [status, setStatus] = useState(null);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const averageRating = useMemo(() => {
    const values = Object.values(ratings).filter((value) => Number(value) > 0);
    if (values.length === 0) return 0;
    return values.reduce((sum, value) => sum + Number(value), 0) / values.length;
  }, [ratings]);

  const handleResetPassword = async () => {
    setStatus(null);
    setError(null);
    setSubmitting(true);

    try {
      await resetPassword();
      setStatus('Password reset email sent. Check your inbox.');
    } catch (resetError) {
      setError(resetError.message || 'Unable to send reset email.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    navigate('/signup', { replace: true });
    return null;
  }

  return (
    <PageShell>
      <Container maxWidth="md">
        <Stack spacing={4} py={{ xs: 4, md: 6 }}>
          <Stack direction="row" alignItems="center" spacing={2} justifyContent="space-between">
            <Stack direction="row" alignItems="center" spacing={2}>
              <Avatar sx={{ width: 52, height: 52, bgcolor: 'primary.main', color: 'primary.contrastText' }}>
                {(user?.displayName || user?.email || 'U').charAt(0).toUpperCase()
              }</Avatar>
              <Box>
                <Typography variant="h5" fontWeight={700}>
                  Settings
                </Typography>
                <Typography color="text.secondary">{user?.email}</Typography>
              </Box>
            </Stack>
            <Button variant="outlined" onClick={() => navigate('/account')}>
              Back to Account
            </Button>
          </Stack>

          {error && <Alert severity="error">{error}</Alert>}
          {status && <Alert severity="success">{status}</Alert>}

          <Stack spacing={3}>
            <Box sx={{ p: 3, borderRadius: 2, bgcolor: 'background.paper', boxShadow: 1 }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Security
              </Typography>
              <Typography mb={2}>
                Send a password reset email to your account address.
              </Typography>
              <Button
                variant="contained"
                onClick={handleResetPassword}
                disabled={submitting || !user?.email}
              >
                {submitting ? 'Sending...' : 'Send Reset Email'}
              </Button>
            </Box>

            <Box sx={{ p: 3, borderRadius: 2, bgcolor: 'background.paper', boxShadow: 1 }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Rating summary
              </Typography>
              <Typography fontSize="2rem" fontWeight={700}>
                {loading ? '—' : averageRating.toFixed(1)} / 10
              </Typography>
              <Typography color="text.secondary">
                Average rating across {Object.values(ratings).filter((value) => Number(value) > 0).length} films.
              </Typography>
            </Box>
          </Stack>
        </Stack>
      </Container>
    </PageShell>
  );
}

export default Settings;
