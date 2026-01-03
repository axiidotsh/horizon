'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useDeleteAccount } from '@/hooks/use-delete-account';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { SettingSection } from './setting-section';

export const DangerZoneSettings = () => {
  const router = useRouter();
  const deleteAccount = useDeleteAccount();
  const [deleteConfirmation, setDeleteConfirmation] = useState('');

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

  return (
    <SettingSection
      title="Delete Account"
      description="Permanently delete your account and all associated data"
    >
      <div className="max-w-md space-y-3">
        <Label htmlFor="delete-confirmation">
          Type <span className="font-mono font-semibold">DELETE</span> to
          confirm account deletion
        </Label>
        <Input
          id="delete-confirmation"
          value={deleteConfirmation}
          onChange={(e) => setDeleteConfirmation(e.target.value)}
          placeholder="Type DELETE here"
        />
        <Button
          variant="destructive"
          onClick={handleDeleteAccount}
          disabled={deleteConfirmation !== 'DELETE' || deleteAccount.isPending}
          isLoading={deleteAccount.isPending}
          loadingContent="Deleting..."
        >
          Delete Account
        </Button>
      </div>
    </SettingSection>
  );
};
