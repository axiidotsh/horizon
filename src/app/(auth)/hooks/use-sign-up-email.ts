import { signUp } from '@/lib/auth-client';
import { handleAuthError } from '@/utils/auth-error';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';

interface SignUpEmailParams {
  name: string;
  email: string;
  password: string;
}

export function useSignUpEmail() {
  return useMutation({
    mutationFn: async ({ name, email, password }: SignUpEmailParams) => {
      return await signUp.email(
        {
          name,
          email,
          password,
        },
        {
          onError: handleAuthError,
        }
      );
    },
    onSuccess: () => {
      toast.success('Account created! Please check your email to verify.');
    },
  });
}
