import { requestPasswordReset } from '@/lib/auth-client';
import { handleAuthError } from '@/utils/auth-error';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';

interface RequestPasswordResetParams {
  email: string;
  redirectTo: string;
}

export function useRequestPasswordReset() {
  return useMutation({
    mutationFn: async ({ email, redirectTo }: RequestPasswordResetParams) => {
      return await requestPasswordReset(
        {
          email,
          redirectTo,
        },
        {
          onError: handleAuthError,
        }
      );
    },
    onSuccess: () => {
      toast.success('Password reset link sent to your email.');
    },
  });
}
