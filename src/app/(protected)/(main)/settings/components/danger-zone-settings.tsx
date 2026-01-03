'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  ResponsiveDialog,
  ResponsiveDialogClose,
  ResponsiveDialogContent,
  ResponsiveDialogDescription,
  ResponsiveDialogFooter,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
  ResponsiveDialogTrigger,
} from '@/components/ui/responsive-dialog';
import { useDeleteAccount } from '@/hooks/use-delete-account';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { SettingSection } from './setting-section';

export const DangerZoneSettings = () => {
  const router = useRouter();
  const deleteAccount = useDeleteAccount();
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  function handleDeleteAccount() {
    if (deleteConfirmation !== 'DELETE') {
      toast.error('Please type DELETE to confirm');
      return;
    }

    deleteAccount.mutate(
      {},
      {
        onSuccess: () => {
          toast.success('Account deleted successfully');
          router.push('/sign-in');
        },
        onError: () => {
          toast.error('Failed to delete account');
        },
      }
    );
  }

  function handleOpenChange(open: boolean) {
    setIsOpen(open);
    if (!open) {
      setDeleteConfirmation('');
    }
  }

  return (
    <SettingSection
      title="Delete Account"
      description="Permanently delete your account and all associated data"
    >
      <ResponsiveDialog open={isOpen} onOpenChange={handleOpenChange}>
        <ResponsiveDialogTrigger asChild>
          <Button variant="destructive">Delete Account</Button>
        </ResponsiveDialogTrigger>
        <ResponsiveDialogContent>
          <ResponsiveDialogHeader>
            <ResponsiveDialogTitle>
              Are you absolutely sure?
            </ResponsiveDialogTitle>
            <ResponsiveDialogDescription>
              This action cannot be undone. This will permanently delete your
              account and remove all your data from our servers.
            </ResponsiveDialogDescription>
          </ResponsiveDialogHeader>
          <div className="space-y-3 pb-2">
            <Label htmlFor="delete-confirmation">
              Type <span className="font-mono font-semibold">DELETE</span> to
              confirm
            </Label>
            <Input
              id="delete-confirmation"
              value={deleteConfirmation}
              onChange={(e) => setDeleteConfirmation(e.target.value)}
              placeholder="Type DELETE here"
            />
          </div>
          <ResponsiveDialogFooter>
            <ResponsiveDialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </ResponsiveDialogClose>
            <Button
              variant="destructive"
              onClick={handleDeleteAccount}
              disabled={
                deleteConfirmation !== 'DELETE' || deleteAccount.isPending
              }
              isLoading={deleteAccount.isPending}
              loadingContent="Deleting..."
            >
              Delete Account
            </Button>
          </ResponsiveDialogFooter>
        </ResponsiveDialogContent>
      </ResponsiveDialog>
    </SettingSection>
  );
};
