import { PropsWithChildren } from 'react';
import {
  ThemeProvider as MuiThemeProvider,
  CssBaseline,
} from '@mui/material';

import theme from 'app/theme';

const ThemeProvider = ({ children }: PropsWithChildren) => {
  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </MuiThemeProvider>
  );
};

export default ThemeProvider;