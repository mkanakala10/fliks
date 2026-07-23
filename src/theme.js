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
        main: isDark ? '#3b82f6' : '#2563eb', // Solid Blue
        contrastText: '#ffffff',
      },
      secondary: {
        main: isDark ? '#10b981' : '#059669', // Solid Emerald
      },
      background: {
        default: isDark ? '#0b0f19' : '#f3f4f6', // Slate-950 / Cool Gray
        paper: isDark ? '#111827' : '#ffffff', // Slate-900 / White
      },
      text: {
        primary: isDark ? '#f9fafb' : '#111827', // High contrast primary text
        secondary: isDark ? '#9ca3af' : '#4b5563', // High contrast secondary text
      },
      divider: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)',
    },
    typography: sharedTypography,
    shape: { borderRadius: 16 },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            backgroundColor: isDark ? '#0b0f19' : '#f3f4f6',
            minHeight: '100vh',
            fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            backgroundColor: isDark ? 'rgba(17, 24, 39, 0.7)' : 'rgba(255, 255, 255, 0.85)',
            backdropFilter: 'blur(16px)',
            border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(0, 0, 0, 0.08)',
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
