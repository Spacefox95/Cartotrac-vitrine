import { PropsWithChildren } from 'react';
import { SnackbarProvider as NotistackProvider } from 'notistack';

const SnackbarProvider = ({ children }: PropsWithChildren) => {
  return (
    <NotistackProvider maxSnack={3} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
      {children}
    </NotistackProvider>
  );
};

export default SnackbarProvider;