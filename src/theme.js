import { createTheme } from '@mui/material/styles';

const fontFamily = "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";

export default function createAppTheme(mode = 'dark') {
  const dark = mode === 'dark';
  return createTheme({
    palette: {
      mode,
      primary: { main: dark ? '#e9a06e' : '#9c4927', contrastText: dark ? '#191715' : '#ffffff' },
      secondary: { main: dark ? '#b8c7b6' : '#476447' },
      background: { default: dark ? '#141514' : '#f7f6f2', paper: dark ? '#1c1d1b' : '#ffffff' },
      text: { primary: dark ? '#f0efe9' : '#242621', secondary: dark ? '#a5a79f' : '#62675d' },
      divider: dark ? '#30322e' : '#dddfd6',
    },
    typography: {
      fontFamily,
      h1: { fontWeight: 600, letterSpacing: '-0.045em' },
      h2: { fontWeight: 600, letterSpacing: '-0.035em' },
      h3: { fontWeight: 600, letterSpacing: '-0.025em' },
      h4: { fontWeight: 600, letterSpacing: '-0.025em' },
      h5: { fontWeight: 600, letterSpacing: '-0.02em' },
      h6: { fontWeight: 600, letterSpacing: '-0.02em' },
      body1: { lineHeight: 1.65 },
      body2: { lineHeight: 1.65 },
      button: { textTransform: 'none', fontWeight: 600 },
    },
    shape: { borderRadius: 8 },
    components: {
      MuiCssBaseline: { styleOverrides: { body: { minHeight: '100vh', fontFamily } } },
      MuiContainer: { styleOverrides: { maxWidthXl: { '@media (min-width: 1536px)': { maxWidth: 1328 } }, root: { '@media (min-width: 900px)': { paddingLeft: 48, paddingRight: 48 } } } },
      MuiPaper: { styleOverrides: { root: { backgroundImage: 'none', boxShadow: 'none' } } },
      MuiButton: { defaultProps: { disableElevation: true }, styleOverrides: { root: { borderRadius: 6, textTransform: 'none', minHeight: 40, paddingInline: 18 } } },
      MuiIconButton: { styleOverrides: { root: { borderRadius: 6 } } },
      MuiChip: { styleOverrides: { root: { borderRadius: 4 } } },
    },
  });
}
