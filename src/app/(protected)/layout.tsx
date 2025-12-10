import { AppHeader } from '@/components/app-header';
import { AppSidebar } from '@/components/app-sidebar';
import { LogoutDialog } from '@/components/logout-dialog';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { authFailureRedirect } from '@/lib/config/redirects.config';
import { auth } from '@/server/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect(authFailureRedirect);
  }

  return (
    <SidebarProvider defaultOpen={false} open={false}>
      <AppSidebar />
      <SidebarInset className="flex flex-col">
        <AppHeader />
        <main className="flex-1">{children}</main>
      </SidebarInset>
      <LogoutDialog />
    </SidebarProvider>
  );
}
