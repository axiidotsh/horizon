import { signIn } from '@/lib/auth-client';
import { handleAuthError } from '@/utils/auth-error';
import { useMutation } from '@tanstack/react-query';

interface SignInSocialParams {
  provider: 'google';
  callbackURL?: string;
}

export function useSignInSocial() {
  return useMutation({
    mutationFn: async ({ provider, callbackURL }: SignInSocialParams) => {
      return await signIn.social(
        {
          provider,
          callbackURL,
        },
        {
          onError: handleAuthError,
        }
      );
    },
  });
}
