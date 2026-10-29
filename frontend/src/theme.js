import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: { main: '#16382f', dark: '#102e27' },
    secondary: { main: '#d2f277', contrastText: '#102e27' },
    background: { default: '#f5f8f4', paper: '#ffffff' },
  },
  shape: { borderRadius: 0 },
  typography: {
    fontFamily: '"Be Vietnam Pro", sans-serif',
    button: { fontWeight: 700, textTransform: 'none' },
  },
  components: {
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: { root: { borderRadius: 0 } },
    },
  },
});

export default theme;
