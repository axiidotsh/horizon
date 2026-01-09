import { ErrorContext } from 'better-auth/react';
import { toast } from 'sonner';

export function getAuthErrorMessage(
  error: { status?: number; message?: string },
  fallbackMessage: string = 'An unexpected error occurred. Please try again.'
): string {
  if (error.status === 429) {
    return 'Too many requests, please try again later.';
  }
  return error.message || fallbackMessage;
}

export function handleAuthError(
  ctx: ErrorContext,
  fallbackMessage: string = 'An unexpected error occurred. Please try again.'
) {
  const errorMessage = getAuthErrorMessage(ctx.error, fallbackMessage);
  toast.error(errorMessage);
}
