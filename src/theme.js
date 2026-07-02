import { createTheme } from '@mui/material/styles';

const sharedTypography = {
  fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  h1: { fontFamily: "'Bebas Neue', sans-serif", fontWeight: 400, letterSpacing: '0.04em' },
  h2: { fontFamily: "'Bebas Neue', sans-serif", fontWeight: 400, letterSpacing: '0.04em' },
  h3: { fontFamily: "'Bebas Neue', sans-serif", fontWeight: 400, letterSpacing: '0.03em' },
  button: { textTransform: 'none', fontWeight: 600 },
};

function createAppTheme(mode = 'dark') {
  const isDark = mode === 'dark';

  return createTheme({
    palette: {
      mode,
      primary: {
        main: isDark ? '#6366f1' : '#4f46e5', // electric indigo
        contrastText: '#ffffff',
      },
      secondary: {
        main: isDark ? '#d946ef' : '#c084fc', // fuchsia / purple
      },
      background: {
        default: isDark ? '#070714' : '#f8fafc',
        paper: isDark ? '#0f0e26' : '#ffffff',
      },
      text: {
        primary: isDark ? '#f3f4f6' : '#0f172a',
        secondary: isDark ? '#9ca3af' : '#475569',
      },
      divider: isDark ? 'rgba(99, 102, 241, 0.12)' : 'rgba(0,0,0,0.06)',
    },
    typography: sharedTypography,
    shape: { borderRadius: 16 },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            backgroundColor: isDark ? '#070714' : '#f8fafc',
            backgroundImage: isDark
              ? 'radial-gradient(circle at 50% -20%, rgba(99, 102, 241, 0.15) 0%, rgba(217, 70, 239, 0.05) 50%, transparent 100%)'
              : 'radial-gradient(circle at 50% -20%, rgba(99, 102, 241, 0.05) 0%, rgba(217, 70, 239, 0.02) 50%, transparent 100%)',
            backgroundAttachment: 'fixed',
            minHeight: '100vh',
            fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            ...(isDark && {
              backgroundColor: 'rgba(15, 14, 38, 0.6)',
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(99, 102, 241, 0.12)',
            }),
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            fontWeight: 600,
            textTransform: 'none',
          },
        },
      },
    },
  });
}

export default createAppTheme;
