import { PropsWithChildren } from 'react';

import StoreProvider from './StoreProvider';
import ThemeProvider from './ThemeProvider';
import SnackbarProvider from './SnackbarProvider';

const AppProviders = ({ children }: PropsWithChildren) => {
  return (
    <StoreProvider>
      <ThemeProvider>
        <SnackbarProvider>{children}</SnackbarProvider>
      </ThemeProvider>
    </StoreProvider>
  );
};

export default AppProviders;