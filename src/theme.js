import { createTheme } from '@mui/material/styles';

const sharedTypography = {
  fontFamily: "'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  h1: { fontWeight: 700, letterSpacing: '-0.03em' },
  h2: { fontWeight: 700, letterSpacing: '-0.02em' },
  h3: { fontWeight: 600, letterSpacing: '-0.02em' },
  button: { textTransform: 'none', fontWeight: 600 },
};

function createAppTheme(mode = 'dark') {
  const isDark = mode === 'dark';

  return createTheme({
    palette: {
      mode,
      primary: {
        main: isDark ? '#f5f5f5' : '#171717',
        contrastText: isDark ? '#0a0a0a' : '#ffffff',
      },
      secondary: {
        main: isDark ? '#a3a3a3' : '#525252',
      },
      background: {
        default: isDark ? '#0a0a0a' : '#fafafa',
        paper: isDark ? '#141414' : '#ffffff',
      },
      text: {
        primary: isDark ? '#f5f5f5' : '#171717',
        secondary: isDark ? '#a3a3a3' : '#525252',
      },
      divider: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
    },
    typography: sharedTypography,
    shape: { borderRadius: 10 },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            backgroundColor: isDark ? '#0a0a0a' : '#fafafa',
          },
        },
      },
    },
  });
}

export default createAppTheme;
