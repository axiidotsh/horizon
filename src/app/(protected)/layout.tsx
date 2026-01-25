import { CustomDurationSettingsDialog } from '@/app/(protected)/(main)/focus/components/dialogs/custom-duration-settings-dialog';
import { FocusSessionCancelDialog } from '@/app/(protected)/(main)/focus/components/dialogs/focus-session-cancel-dialog';
import { FocusSessionCreateDialog } from '@/app/(protected)/(main)/focus/components/dialogs/focus-session-create-dialog';
import { FocusSessionDeleteDialog } from '@/app/(protected)/(main)/focus/components/dialogs/focus-session-delete-dialog';
import { FocusSessionDiscardDialog } from '@/app/(protected)/(main)/focus/components/dialogs/focus-session-discard-dialog';
import { FocusSessionEditDialog } from '@/app/(protected)/(main)/focus/components/dialogs/focus-session-edit-dialog';
import { FocusSessionEndEarlyDialog } from '@/app/(protected)/(main)/focus/components/dialogs/focus-session-end-early-dialog';
import { CreateHabitDialog } from '@/app/(protected)/(main)/habits/components/dialogs/create-habit-dialog';
import { DeleteHabitDialog } from '@/app/(protected)/(main)/habits/components/dialogs/delete-habit-dialog';
import { EditHabitDialog } from '@/app/(protected)/(main)/habits/components/dialogs/edit-habit-dialog';
import { BulkAddTasksSheet } from '@/app/(protected)/(main)/tasks/components/dialogs/bulk-add-tasks-sheet';
import { CreateProjectDialog } from '@/app/(protected)/(main)/tasks/components/dialogs/create-project-dialog';
import { CreateTaskDialog } from '@/app/(protected)/(main)/tasks/components/dialogs/create-task-dialog';
import { DeleteProjectDialog } from '@/app/(protected)/(main)/tasks/components/dialogs/delete-project-dialog';
import { DeleteTaskDialog } from '@/app/(protected)/(main)/tasks/components/dialogs/delete-task-dialog';
import { EditProjectDialog } from '@/app/(protected)/(main)/tasks/components/dialogs/edit-project-dialog';
import { EditTaskDialog } from '@/app/(protected)/(main)/tasks/components/dialogs/edit-task-dialog';
import { AppHeader } from '@/components/app-header';
import { AppSidebar } from '@/components/app-sidebar';
import { LogoutDialog } from '@/components/logout-dialog';
import { MobileDock } from '@/components/mobile-dock';
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
    <>
      <SidebarProvider defaultOpen={false} open={false}>
        <AppSidebar />
        <SidebarInset className="flex flex-col">
          <AppHeader />
          <main className="flex-1">{children}</main>
        </SidebarInset>
      </SidebarProvider>

      <MobileDock />
      <LogoutDialog />

      {/* Focus Session Dialogs */}
      <FocusSessionCancelDialog />
      <FocusSessionEndEarlyDialog />
      <FocusSessionDiscardDialog />
      <FocusSessionEditDialog />
      <FocusSessionDeleteDialog />
      <FocusSessionCreateDialog />
      <CustomDurationSettingsDialog />

      {/* Task Dialogs */}
      <CreateTaskDialog />
      <EditTaskDialog />
      <DeleteTaskDialog />
      <BulkAddTasksSheet />

      {/* Project Dialogs */}
      <CreateProjectDialog />
      <EditProjectDialog />
      <DeleteProjectDialog />

      {/* Habit Dialogs */}
      <CreateHabitDialog />
      <EditHabitDialog />
      <DeleteHabitDialog />
    </>
  );
}
