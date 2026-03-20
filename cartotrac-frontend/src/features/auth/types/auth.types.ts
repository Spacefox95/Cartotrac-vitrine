export type LoginCredentials = {
  email: string;
  password: string;
};

export type AuthTokenResponse = {
  access_token: string;
  token_type: string;
};

export type CurrentUser = {
  email: string;
  full_name: string | null;
};
