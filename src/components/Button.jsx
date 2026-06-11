import MuiButton from '@mui/material/Button';

function Button({ children, variant = 'primary', size = 'medium', onClick, sx, ...props }) {
  const muiSize =
    size === 'md' ? 'medium' : size === 'lg' ? 'large' : size === 'sm' ? 'small' : size;

  const variantStyles =
    variant === 'secondary'
      ? {
          bgcolor: 'transparent',
          color: 'text.primary',
          border: 1,
          borderColor: 'divider',
          boxShadow: 'none',
          '&:hover': {
            bgcolor: 'action.hover',
            borderColor: 'text.secondary',
            boxShadow: 'none',
          },
        }
      : {
          bgcolor: 'primary.main',
          color: 'primary.contrastText',
          border: 1,
          borderColor: 'primary.main',
          boxShadow: 'none',
          '&:hover': {
            bgcolor: 'primary.main',
            opacity: 0.9,
            boxShadow: 'none',
          },
        };

  return (
    <MuiButton
      variant="contained"
      size={muiSize}
      onClick={onClick}
      disableElevation
      sx={{
        textTransform: 'none',
        fontWeight: 600,
        borderRadius: 2,
        transition: 'opacity 0.15s, background-color 0.15s',
        ...variantStyles,
        ...sx,
      }}
      {...props}
    >
      {children}
    </MuiButton>
  );
}

export default Button;
