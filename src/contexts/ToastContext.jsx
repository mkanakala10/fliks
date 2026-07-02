import { createContext, useContext, useState, useCallback } from 'react';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toast, setToast] = useState({
    open: false,
    message: '',
    severity: 'info', // 'success', 'info', 'warning', 'error'
  });

  const showToast = useCallback((message, severity = 'info') => {
    setToast({
      open: true,
      message,
      severity,
    });
  }, []);

  const handleClose = useCallback((event, reason) => {
    if (reason === 'clickaway') return;
    setToast((prev) => ({ ...prev, open: false }));
  }, []);

  return (
    <ToastContext.Provider value={showToast}>
      {children}
      <Snackbar
        open={toast.open}
        autoHideDuration={4000}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        sx={{ bottom: { xs: 80, sm: 24 } }} // clear bottom nav if any
      >
        <Alert
          onClose={handleClose}
          severity={toast.severity}
          variant="filled"
          sx={{
            width: '100%',
            borderRadius: 3,
            fontWeight: 600,
            fontSize: '0.9rem',
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            boxShadow: '0 12px 32px rgba(0, 0, 0, 0.4)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            ...(toast.severity === 'success' && {
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            }),
            ...(toast.severity === 'info' && {
              background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
            }),
            ...(toast.severity === 'error' && {
              background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
            }),
            ...(toast.severity === 'warning' && {
              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
            }),
          }}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
