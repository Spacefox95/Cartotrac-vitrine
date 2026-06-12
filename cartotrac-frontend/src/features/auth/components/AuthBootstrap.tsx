import { PropsWithChildren, useEffect } from 'react';

import { useAppDispatch, useAppSelector } from 'app/store/hooks';
import { bootstrapSession } from 'app/store/thunks/authThunks';

const AuthBootstrap = ({ children }: PropsWithChildren) => {
  const dispatch = useAppDispatch();
  const accessToken = useAppSelector((state) => state.auth.accessToken);

  useEffect(() => {
    if (!accessToken) {
      return;
    }

    void dispatch(bootstrapSession());
  }, [accessToken, dispatch]);

  return <>{children}</>;
};

export default AuthBootstrap;
