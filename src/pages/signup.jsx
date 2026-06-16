import { useState } from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Divider from '@mui/material/Divider';
import Alert from '@mui/material/Alert';
import PageShell from '../components/PageShell';
import Button from '../components/Button';
import { useAuth } from '../contexts/AuthContext';

function Signup({ onNavigate }) {
  const {
    signInWithGoogle,
    signInWithEmail,
    registerWithEmail,
    isAuthenticated,
    user,
    isFirebaseConfigured,
    getAuthErrorMessage,
  } = useAuth();

  const [mode, setMode] = useState('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setError(null);
  };

  const switchMode = (nextMode) => {
    setMode(nextMode);
    resetForm();
  };

  const handleContinueHome = () => onNavigate('home');

  const handleEmailSubmit = async (event) => {
    event.preventDefault();
    if (isAuthenticated) {
      handleContinueHome();
      return;
    }

    setError(null);

    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (mode === 'register' && password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (mode === 'register') {
        await registerWithEmail(email, password);
      } else {
        await signInWithEmail(email, password);
      }
      onNavigate('home');
    } catch (err) {
      console.error('Authentication error:', err);
      setError(getAuthErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    if (isAuthenticated) {
      handleContinueHome();
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      await signInWithGoogle();
      onNavigate('home');
    } catch (err) {
      console.error('Authentication error:', err);
      setError(getAuthErrorMessage(err));
    } finally {
      setIsSubmitting(false);
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
          }}
        >
          <Stack spacing={3} alignItems="center">
            <Box textAlign="center">
              <Typography variant="h4" fontWeight={700} letterSpacing="-0.02em">
                {isAuthenticated
                  ? `Welcome back${user?.displayName ? `, ${user.displayName}` : ''}`
                  : mode === 'register'
                    ? 'Create your account'
                    : 'Sign in to Fliks'}
              </Typography>
              <Typography color="text.secondary" mt={1}>
                {isAuthenticated
                  ? 'You’re signed in and ready to rate movies.'
                  : 'Access full rating features. Your data syncs with your account.'}
              </Typography>
            </Box>

            {!isFirebaseConfigured && (
              <Alert severity="warning" sx={{ width: '100%' }}>
                Firebase is not configured. Copy <strong>.env.example</strong> to <strong>.env</strong>,
                add your Firebase keys, then restart <strong>npm run dev</strong>.
              </Alert>
            )}

            {error && (
              <Alert severity="error" sx={{ width: '100%' }}>
                {error}
              </Alert>
            )}

            {isAuthenticated ? (
              <Button variant="primary" size="md" onClick={handleContinueHome} sx={{ width: '100%', maxWidth: 320 }}>
                Continue to Home
              </Button>
            ) : (
              <>
                <Stack direction="row" spacing={1} sx={{ width: '100%', maxWidth: 320 }}>
                  <Button
                    variant={mode === 'signin' ? 'primary' : 'secondary'}
                    size="sm"
                    onClick={() => switchMode('signin')}
                    sx={{ flex: 1 }}
                  >
                    Sign in
                  </Button>
                  <Button
                    variant={mode === 'register' ? 'primary' : 'secondary'}
                    size="sm"
                    onClick={() => switchMode('register')}
                    sx={{ flex: 1 }}
                  >
                    Register
                  </Button>
                </Stack>

                <Box
                  component="form"
                  onSubmit={handleEmailSubmit}
                  sx={{ width: '100%', maxWidth: 320 }}
                >
                  <Stack spacing={2}>
                    <TextField
                      label="Email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      autoComplete="email"
                      required
                      fullWidth
                      disabled={isSubmitting || !isFirebaseConfigured}
                    />
                    <TextField
                      label="Password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
                      required
                      fullWidth
                      disabled={isSubmitting || !isFirebaseConfigured}
                      helperText={mode === 'register' ? 'At least 6 characters' : undefined}
                    />
                    {mode === 'register' && (
                      <TextField
                        label="Confirm password"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        autoComplete="new-password"
                        required
                        fullWidth
                        disabled={isSubmitting || !isFirebaseConfigured}
                      />
                    )}
                    <Button
                      type="submit"
                      variant="primary"
                      size="md"
                      disabled={isSubmitting || !isFirebaseConfigured}
                      sx={{ width: '100%' }}
                    >
                      {isSubmitting
                        ? mode === 'register'
                          ? 'Creating account…'
                          : 'Signing in…'
                        : mode === 'register'
                          ? 'Create account'
                          : 'Sign in with email'}
                    </Button>
                  </Stack>
                </Box>

                <Stack direction="row" alignItems="center" spacing={2} sx={{ width: '100%', maxWidth: 320 }}>
                  <Divider sx={{ flex: 1 }} />
                  <Typography variant="caption" color="text.secondary">
                    or
                  </Typography>
                  <Divider sx={{ flex: 1 }} />
                </Stack>

                <Button
                  variant="secondary"
                  size="md"
                  onClick={handleGoogleSignIn}
                  disabled={isSubmitting || !isFirebaseConfigured}
                  sx={{ width: '100%', maxWidth: 320 }}
                >
                  Continue with Google
                </Button>
              </>
            )}
          </Stack>
        </Box>
      </Container>
    </PageShell>
  );
}

export default Signup;
