import { PropsWithChildren } from 'react';

import AuthBootstrap from 'features/auth/components/AuthBootstrap';

import StoreProvider from './StoreProvider';
import ThemeProvider from './ThemeProvider';
import SnackbarProvider from './SnackbarProvider';

const AppProviders = ({ children }: PropsWithChildren) => {
  return (
    <StoreProvider>
      <AuthBootstrap>
        <ThemeProvider>
          <SnackbarProvider>{children}</SnackbarProvider>
        </ThemeProvider>
      </AuthBootstrap>
    </StoreProvider>
  );
};

export default AppProviders;
