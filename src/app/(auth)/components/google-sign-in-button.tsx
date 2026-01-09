'use client';

import { GoogleIcon } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Loader2Icon } from 'lucide-react';
import { useSignInSocial } from '../hooks/use-sign-in-social';

interface GoogleSignInButtonProps {
  disabled?: boolean;
}

export function GoogleSignInButton({ disabled }: GoogleSignInButtonProps) {
  const { mutate: signInSocial, isPending } = useSignInSocial();

  function handleGoogleSignIn() {
    signInSocial({
      provider: 'google',
      callbackURL: '/dashboard',
    });
  }

  return (
    <Button
      variant="outline"
      className="w-full"
      onClick={handleGoogleSignIn}
      disabled={disabled || isPending}
    >
      {isPending ? (
        <Loader2Icon className="size-4 animate-spin" />
      ) : (
        <GoogleIcon className="size-4" />
      )}
      Continue with Google
    </Button>
  );
}
