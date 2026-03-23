import { PropsWithChildren } from 'react';
import { Navigate } from 'react-router-dom';

import { useAppSelector } from 'app/store/hooks';
import { hasPermission } from 'shared/auth/permissions';

const AdminGuard = ({ children }: PropsWithChildren) => {
  const currentUser = useAppSelector((state) => state.auth.currentUser);

  if (hasPermission(currentUser?.permissions, 'users:manage') === false) {
    return <Navigate to="/app/dashboard" replace />;
  }

  return <>{children}</>;
};

export default AdminGuard;
