import { Providers } from '@/components/providers';
import { Toaster } from '@/components/ui/sonner';
import '@/styles/globals.css';
import { cn } from '@/utils/utils';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

const fontSans = Inter({
  variable: '--font-sans',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Horizon',
  description: 'A productivity app.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          fontSans.variable,
          process.env.NODE_ENV === 'development' && 'debug-screens',
          'antialiased'
        )}
      >
        <Providers>{children}</Providers>
        <Toaster />
      </body>
    </html>
  );
}
