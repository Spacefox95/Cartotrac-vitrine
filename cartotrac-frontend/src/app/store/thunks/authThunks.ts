import { authActions } from 'app/store/slices/authSlice';
import { getStoredRefreshToken, setStoredAuthTokens } from 'shared/api/authStorage';
import { http } from 'shared/api/http';
import { apiRoutes } from 'shared/api/routes';
import type {
  AuthTokenResponse,
  CurrentUser,
  LoginCredentials,
} from 'features/auth/types/auth.types';

import type { AppThunk } from './types';

type BootstrapSessionResult = {
  currentUser: CurrentUser;
  tokens?: AuthTokenResponse;
};

export const bootstrapSession = (): AppThunk<BootstrapSessionResult> => {
  return async (dispatch) => {
    dispatch(authActions.setBootstrapping(true));

    try {
      const result = {
        currentUser: await getCurrentUser(),
      };

      dispatch(authActions.setCurrentUser(result.currentUser));
      return result;
    } catch (error) {
      const refreshTokenValue = getStoredRefreshToken();

      if (!refreshTokenValue) {
        dispatch(authActions.logout());
        throw error;
      }

      try {
        const tokens = await requestRefreshToken(refreshTokenValue);
        setStoredAuthTokens(tokens.access_token, tokens.refresh_token);

        const result = {
          currentUser: await getCurrentUser(),
          tokens,
        };

        dispatch(authActions.loginSuccess(tokens));
        dispatch(authActions.setCurrentUser(result.currentUser));
        return result;
      } catch (err) {
        dispatch(authActions.logout());
        console.error(err);
        throw err;
      }
    }
  };
};

export const login = (credentials: LoginCredentials): AppThunk<AuthTokenResponse> => {
  return async (dispatch) => {
    try {
      const response = await http.post<AuthTokenResponse>(apiRoutes.authLogin, credentials);
      dispatch(authActions.loginSuccess(response.data));
      return response.data;
    } catch (err) {
      console.error(err);
      throw err;
    }
  };
};

export const logout = (): AppThunk => {
  return async (dispatch) => {
    const refreshToken = getStoredRefreshToken();

    dispatch(authActions.logout());

    try {
      if (refreshToken) {
        await http.post(apiRoutes.authLogout, {
          refresh_token: refreshToken,
        });
      }
    } catch (err) {
      console.error(err);
    }
  };
};

async function getCurrentUser(): Promise<CurrentUser> {
  const response = await http.get<CurrentUser>(apiRoutes.authMe);
  return response.data;
}

async function requestRefreshToken(refreshTokenValue: string): Promise<AuthTokenResponse> {
  const response = await http.post<AuthTokenResponse>(apiRoutes.authRefresh, {
    refresh_token: refreshTokenValue,
  });

  return response.data;
}
