import { createTheme } from '@mui/material/styles';

import { palette } from './palette';
import { typography } from './typography';

const theme = createTheme({
  palette,
  typography,
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          color: palette.text.primary,
        },
        '::selection': {
          backgroundColor: 'rgba(200, 181, 157, 0.22)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          border: '1px solid rgba(85, 96, 111, 0.1)',
          boxShadow: '0 16px 34px rgba(67, 76, 89, 0.06)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          paddingInline: 18,
          paddingBlock: 10,
          boxShadow: 'none',
        },
        contained: {
          background: 'linear-gradient(135deg, #55606f 0%, #6d7887 100%)',
          boxShadow: '0 12px 24px rgba(85, 96, 111, 0.16)',
        },
        outlined: {
          borderColor: 'rgba(85, 96, 111, 0.18)',
          backgroundColor: 'rgba(253, 250, 245, 0.88)',
        },
        text: {
          color: '#4c5562',
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 5,
        },
        standardInfo: {
          backgroundColor: 'rgba(221, 231, 239, 0.78)',
          color: '#334252',
        },
        standardSuccess: {
          backgroundColor: 'rgba(228, 234, 227, 0.86)',
          color: '#365044',
        },
      },
    },
    MuiContainer: {
      styleOverrides: {
        root: {
          paddingLeft: 24,
          paddingRight: 24,
        },
      },
    },
  },
});

export default theme;
