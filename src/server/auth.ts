import { env as clientEnv } from '@/lib/config/env/client';
import { env as serverEnv } from '@/lib/config/env/server';
import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { admin, lastLoginMethod } from 'better-auth/plugins';
import { db } from './db';
import { Role } from './db/generated/client';
import { emailService } from './services/email';

const RESET_PASSWORD_EXPIRY = 30 * 60; // 30 minutes
const EMAIL_VERIFICATION_EXPIRY = 24 * 60 * 60; // 24 hours

export const auth = betterAuth({
  plugins: [
    lastLoginMethod(),
    admin({
      defaultRole: Role.USER,
      adminRoles: [Role.ADMIN, Role.SUPER_ADMIN],
    }),
  ],
  baseURL: clientEnv.NEXT_PUBLIC_API_URL,
  basePath: '/api/auth',
  secret: serverEnv.BETTER_AUTH_SECRET,
  database: prismaAdapter(db, {
    provider: 'postgresql',
  }),
  socialProviders: {
    google: {
      clientId: serverEnv.GOOGLE_CLIENT_ID,
      clientSecret: serverEnv.GOOGLE_CLIENT_SECRET,
    },
  },
  user: {
    additionalFields: {
      commandMenuPosition: {
        type: ['top', 'center'],
        required: true,
        defaultValue: 'top',
        input: true,
      },
      defaultFocusDuration: {
        type: 'number',
        required: true,
        defaultValue: 45,
        input: true,
      },
      defaultTaskPriority: {
        type: ['LOW', 'MEDIUM', 'HIGH'],
        required: true,
        defaultValue: 'MEDIUM',
        input: true,
      },
    },
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    resetPasswordTokenExpiresIn: RESET_PASSWORD_EXPIRY,
    sendResetPassword: async ({ user, token }) => {
      const url = `${clientEnv.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`;
      await emailService.sendPasswordResetEmail(user.email, user.name, url);
    },
    onPasswordReset: async ({ user }) => {
      await emailService.sendPasswordResetSuccessEmail(
        user.email,
        user.name,
        user.id
      );
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    expiresIn: EMAIL_VERIFICATION_EXPIRY,
    sendVerificationEmail: async ({ user, url }) => {
      await emailService.sendVerificationEmail(user.email, user.name, url);
    },
  },
});
