import { PlaceholderLogo } from '@/components/icons';
import { authSuccessRedirect } from '@/lib/config/redirects.config';
import { auth } from '@/server/auth';
import { headers } from 'next/headers';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session) {
    redirect(authSuccessRedirect);
  }

  return (
    <div className="bg-background flex min-h-svh flex-col items-center justify-center px-4 py-12">
      <Link href="/" className="mb-8">
        <PlaceholderLogo className="size-12" />
      </Link>
      {children}
    </div>
  );
}
