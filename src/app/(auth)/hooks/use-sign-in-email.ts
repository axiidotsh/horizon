import { signIn } from '@/lib/auth-client';
import { signInRedirect } from '@/lib/config/redirects.config';
import { getAuthErrorMessage } from '@/utils/auth-error';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface SignInEmailParams {
  email: string;
  password: string;
}

export function useSignInEmail() {
  const router = useRouter();

  return useMutation({
    mutationFn: async ({ email, password }: SignInEmailParams) => {
      const result = await signIn.email({
        email,
        password,
      });

      if (result.error) {
        const errorMessage = getAuthErrorMessage(result.error);
        throw new Error(errorMessage);
      }

      return result.data;
    },
    onSuccess: () => {
      router.push(signInRedirect);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
}
