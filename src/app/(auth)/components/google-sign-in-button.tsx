'use client';

import { GoogleIcon } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { signIn } from '@/lib/auth-client';
import { Loader2Icon } from 'lucide-react';
import { useState } from 'react';

interface GoogleSignInButtonProps {
  disabled?: boolean;
}

export function GoogleSignInButton({ disabled }: GoogleSignInButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  async function handleGoogleSignIn() {
    setIsLoading(true);

    await signIn.social({
      provider: 'google',
      callbackURL: '/dashboard',
    });
  }

  return (
    <Button
      variant="outline"
      className="w-full"
      onClick={handleGoogleSignIn}
      disabled={disabled || isLoading}
    >
      {isLoading ? (
        <Loader2Icon className="size-4 animate-spin" />
      ) : (
        <GoogleIcon className="size-4" />
      )}
      Continue with Google
    </Button>
  );
}
