import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Header from './Header';

function PageShell({ children, loading = false }) {
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', color: 'text.primary' }}>
      <Box component="a" href="#main-content" sx={{ position: 'fixed', top: -60, left: 16, zIndex: 1400, bgcolor: 'background.paper', p: 1.5, '&:focus': { top: 8 } }}>Skip to content</Box>
      <Header />
      <Box component="main" id="main-content" tabIndex={-1}>
        {loading ? (
          <Box role="status" aria-label="Loading content" sx={{ minHeight: '60vh', display: 'grid', placeItems: 'center' }}>
            <CircularProgress size={28} thickness={3} />
          </Box>
        ) : children}
      </Box>
    </Box>
  );
}
export default PageShell;
