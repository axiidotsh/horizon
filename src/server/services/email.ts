import { env } from '@/lib/config/env/server';
import type React from 'react';
import { Resend } from 'resend';
import { z } from 'zod';
import { logger } from '../logger';
import { PasswordResetEmail } from '../templates/emails/password-reset';
import { PasswordResetSuccessEmail } from '../templates/emails/password-reset-success';
import { VerificationEmail } from '../templates/emails/verification';

export const resend = new Resend(env.RESEND_API_KEY);
const FROM = `${env.EMAIL_FROM_NAME} <${env.EMAIL_FROM}>`;

type EmailType = 'verification' | 'password_reset' | 'password_reset_success';

const baseEmailSchema = {
  to: z.string().email('Invalid email address'),
  userName: z.string().min(1).max(100),
};

const verificationEmailSchema = z.object({
  ...baseEmailSchema,
  verificationUrl: z.string().url(),
});

const passwordResetEmailSchema = z.object({
  ...baseEmailSchema,
  resetUrl: z.string().url(),
});

const passwordResetSuccessEmailSchema = z.object({
  ...baseEmailSchema,
});

interface SendEmailParams {
  to: string;
  subject: string;
  react: React.ReactElement;
}

interface EmailMetadata {
  emailType: EmailType;
  userId?: string;
  recipientEmail: string;
}

const sendEmail = async (params: SendEmailParams, metadata: EmailMetadata) => {
  const { data, error } = await resend.emails.send({
    from: FROM,
    to: params.to,
    subject: params.subject,
    react: params.react,
    tags: [
      { name: 'type', value: metadata.emailType },
      ...(metadata.userId ? [{ name: 'user_id', value: metadata.userId }] : []),
    ],
  });

  if (error) {
    logger.error({
      event: 'email_send_error',
      emailType: metadata.emailType,
      to: metadata.recipientEmail,
      error: { name: error.name, message: error.message },
    });

    throw new Error(`Failed to send email: ${error.message}`);
  }

  return data;
};

export const emailService = {
  async sendVerificationEmail(
    to: string,
    userName: string,
    verificationUrl: string,
    userId?: string
  ) {
    const input = verificationEmailSchema.parse({
      to,
      userName,
      verificationUrl,
    });

    return sendEmail(
      {
        to: input.to,
        subject: 'Verify your email address',
        react: VerificationEmail({
          userName: input.userName,
          verificationUrl: input.verificationUrl,
        }),
      },
      {
        emailType: 'verification',
        recipientEmail: input.to,
        userId,
      }
    );
  },
  async sendPasswordResetEmail(
    to: string,
    userName: string,
    resetUrl: string,
    userId?: string
  ) {
    const input = passwordResetEmailSchema.parse({
      to,
      userName,
      resetUrl,
    });

    return sendEmail(
      {
        to: input.to,
        subject: 'Reset your password',
        react: PasswordResetEmail({
          userName: input.userName,
          resetUrl: input.resetUrl,
        }),
      },
      {
        emailType: 'password_reset',
        recipientEmail: input.to,
        userId,
      }
    );
  },
  async sendPasswordResetSuccessEmail(
    to: string,
    userName: string,
    userId?: string
  ) {
    const input = passwordResetSuccessEmailSchema.parse({
      to,
      userName,
    });

    return sendEmail(
      {
        to: input.to,
        subject: 'Your password has been reset',
        react: PasswordResetSuccessEmail({
          userName: input.userName,
        }),
      },
      {
        emailType: 'password_reset_success',
        recipientEmail: input.to,
        userId,
      }
    );
  },
};
