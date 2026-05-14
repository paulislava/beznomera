import { OAuthProvider } from '@paulislava/shared/auth/auth.types';

export interface OAuthProfileData {
  provider: OAuthProvider;
  providerUserId: string;
  email: string | null;
  displayName: string | null;
  avatarUrl: string | null;
}
