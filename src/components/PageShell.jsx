import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Header from './Header';

function PageShell({ children, loading = false }) {
  if (loading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          bgcolor: 'background.default',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <CircularProgress size={44} color="primary" thickness={4} />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: 'background.default',
        color: 'text.primary',
      }}
    >
      <Header />
      {children}
    </Box>
  );
}

export default PageShell;
