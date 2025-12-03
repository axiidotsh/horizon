import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components';

interface PasswordResetSuccessEmailProps {
  userName: string;
}

export const PasswordResetSuccessEmail = ({
  userName,
}: PasswordResetSuccessEmailProps) => {
  return (
    <Html lang="en">
      <Head>
        <meta name="color-scheme" content="light" />
        <meta name="supported-color-schemes" content="light" />
      </Head>
      <Preview>Your password has been successfully reset</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={content}>
            <Heading style={heading}>Password Changed</Heading>

            <Text style={greeting}>Hi {userName},</Text>

            <Text style={paragraph}>
              Your password has been successfully reset. You can now sign in to
              your account using your new password.
            </Text>

            <Hr style={divider} />

            <Text style={securityNote}>
              If you did not make this change, please contact our support team
              immediately and secure your account.
            </Text>
          </Section>

          <Section style={footer}>
            <Text style={footerText}>
              This is an automated security notification.
            </Text>
            <Text style={footerText}>Please do not reply to this email.</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

const main = {
  backgroundColor: '#f4f4f5',
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Ubuntu, sans-serif',
  padding: '40px 0',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  maxWidth: '600px',
  borderRadius: '8px',
  overflow: 'hidden',
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
};

const content = {
  padding: '48px 40px',
};

const heading = {
  color: '#18181b',
  fontSize: '28px',
  fontWeight: '600',
  lineHeight: '36px',
  margin: '0 0 24px',
  padding: '0',
};

const greeting = {
  color: '#18181b',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '0 0 16px',
};

const paragraph = {
  color: '#52525b',
  fontSize: '15px',
  lineHeight: '24px',
  margin: '0 0 32px',
};

const divider = {
  borderColor: '#e4e4e7',
  margin: '32px 0',
};

const securityNote = {
  color: '#71717a',
  fontSize: '13px',
  lineHeight: '20px',
  margin: '0',
};

const footer = {
  backgroundColor: '#fafafa',
  padding: '32px 40px',
  borderTop: '1px solid #e4e4e7',
};

const footerText = {
  color: '#a1a1aa',
  fontSize: '12px',
  lineHeight: '18px',
  margin: '0 0 8px',
  textAlign: 'center' as const,
};
