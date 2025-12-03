const REDIRECTS = {
  SIGN_IN: '/sign-in',
  SIGN_UP: '/sign-up',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  DASHBOARD: '/dashboard',
} as const;

export const authSuccessRedirect = REDIRECTS.DASHBOARD;
export const authFailureRedirect = REDIRECTS.SIGN_IN;
export const signInRedirect = REDIRECTS.DASHBOARD;
export const passwordResetRedirect = REDIRECTS.SIGN_IN;
export const passwordResetPageRedirect = REDIRECTS.RESET_PASSWORD;
