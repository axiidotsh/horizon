import { env } from '@/lib/config/env/client';
import { getAuthErrorMessage } from '@/utils/auth-error';
import { adminClient, lastLoginMethodClient } from 'better-auth/client/plugins';
import { createAuthClient } from 'better-auth/react';
import { toast } from 'sonner';

export const authClient = createAuthClient({
  baseURL: env.NEXT_PUBLIC_APP_URL,
  basePath: '/api/auth',
  plugins: [lastLoginMethodClient(), adminClient()],
  fetchOptions: {
    onError: (ctx) => {
      const errorMessage = getAuthErrorMessage(ctx, 'Failed to sign in');
      toast.error(errorMessage);
    },
  },
});

export const {
  signIn,
  signUp,
  signOut,
  requestPasswordReset,
  resetPassword,
  useSession,
  isLastUsedLoginMethod,
} = authClient;
