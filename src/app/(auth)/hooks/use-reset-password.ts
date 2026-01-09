import { resetPassword } from '@/lib/auth-client';
import { passwordResetRedirect } from '@/lib/config/redirects.config';
import { handleAuthError } from '@/utils/auth-error';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface ResetPasswordParams {
  newPassword: string;
  token: string;
}

export function useResetPassword() {
  const router = useRouter();

  return useMutation({
    mutationFn: async ({ newPassword, token }: ResetPasswordParams) => {
      return await resetPassword(
        {
          newPassword,
          token,
        },
        {
          onError: handleAuthError,
        }
      );
    },
    onSuccess: () => {
      toast.success('Password reset successfully');
      router.push(passwordResetRedirect);
    },
  });
}
