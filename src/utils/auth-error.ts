import { ErrorContext } from 'better-auth/react';

export function getAuthErrorMessage(
  ctx: ErrorContext,
  fallbackMessage: string = 'An unexpected error occurred. Please try again.'
) {
  if (ctx.error.status === 429) {
    return 'Too many requests, please try again later.';
  }
  return ctx.error.message || fallbackMessage;
}
