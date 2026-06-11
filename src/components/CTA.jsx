import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Button from './Button';

function CTA({ title, description, buttonText = 'Get Started', onButtonClick }) {
  return (
    <Box
      component="section"
      sx={{ py: 8, borderTop: 1, borderColor: 'divider' }}
    >
      <Container maxWidth="sm">
        <Stack spacing={2.5} alignItems="center" textAlign="center">
          <Typography
            variant="h4"
            sx={{ fontSize: { xs: '1.5rem', md: '1.85rem' }, fontWeight: 700, letterSpacing: '-0.02em' }}
          >
            {title}
          </Typography>
          {description && (
            <Typography variant="body1" color="text.secondary">
              {description}
            </Typography>
          )}
          <Button variant="primary" size="lg" onClick={onButtonClick}>
            {buttonText}
          </Button>
        </Stack>
      </Container>
    </Box>
  );
}

export default CTA;
