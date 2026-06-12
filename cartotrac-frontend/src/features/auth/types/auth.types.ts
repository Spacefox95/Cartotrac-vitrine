import type { components } from 'shared/api/generated/schema';

export type LoginCredentials = components['schemas']['LoginRequest'];
export type AuthTokenResponse = components['schemas']['TokenResponse'];
export type CurrentUser = components['schemas']['CurrentUserResponse'];
