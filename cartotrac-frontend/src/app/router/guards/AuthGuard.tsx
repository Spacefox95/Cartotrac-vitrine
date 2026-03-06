import { PropsWithChildren } from 'react';
import { Navigate } from 'react-router-dom';

import { useAppSelector } from 'app/store/hooks';

const AuthGuard = ({ children }: PropsWithChildren) => {
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default AuthGuard;