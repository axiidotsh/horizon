'use client';

import { type CommandMenuPosition, settingsAtom } from '@/atoms/settings-atoms';
import { PageHeading } from '@/components/page-heading';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useChangePassword } from '@/hooks/use-change-password';
import { useDeleteAccount } from '@/hooks/use-delete-account';
import { isLastUsedLoginMethod } from '@/lib/auth-client';
import type { TaskPriority } from '@/server/db/generated/client';
import { cn } from '@/utils/utils';
import { useAtom } from 'jotai';
import {
  ClockIcon,
  ListTodoIcon,
  MonitorIcon,
  MoonIcon,
  PaletteIcon,
  ShieldAlertIcon,
  SunIcon,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

interface OptionCardProps {
  title: string;
  description: string;
  selected: boolean;
  onSelect: () => void;
}

const OptionCard = ({
  title,
  description,
  selected,
  onSelect,
}: OptionCardProps) => (
  <button
    type="button"
    onClick={onSelect}
    className={cn(
      'flex cursor-pointer flex-col gap-1 rounded-lg border p-4 text-left transition-colors duration-300',
      selected
        ? 'bg-primary/5 border-primary/15'
        : 'border-input hover:bg-muted/50'
    )}
  >
    <span className="text-sm font-medium">{title}</span>
    <span className="text-muted-foreground text-xs">{description}</span>
  </button>
);

const DURATION_OPTIONS = [
  { value: 25, label: '25 minutes' },
  { value: 45, label: '45 minutes' },
  { value: 60, label: '1 hour' },
  { value: 90, label: '1.5 hours' },
];

const PRIORITY_OPTIONS = [
  { value: 'LOW', label: 'Low' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'HIGH', label: 'High' },
];

const THEME_OPTIONS = [
  { value: 'light', label: 'Light', icon: SunIcon },
  { value: 'dark', label: 'Dark', icon: MoonIcon },
  { value: 'system', label: 'System', icon: MonitorIcon },
];

interface SettingSectionProps {
  title: string;
  description: string;
  children: React.ReactNode;
}

const SettingSection = ({
  title,
  description,
  children,
}: SettingSectionProps) => (
  <div className="space-y-4">
    <div className="space-y-1">
      <h3 className="text-base font-medium">{title}</h3>
      <p className="text-muted-foreground text-sm">{description}</p>
    </div>
    {children}
  </div>
);

export default function SettingsPage() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [settings, setSettings] = useAtom(settingsAtom);
  const changePassword = useChangePassword();
  const deleteAccount = useDeleteAccount();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [deleteConfirmation, setDeleteConfirmation] = useState('');

  const isPasswordAuth = isLastUsedLoginMethod('email-password');

  const handlePositionChange = (position: CommandMenuPosition) => {
    setSettings((prev) => ({ ...prev, commandMenuPosition: position }));
  };

  const handleFocusDurationChange = (duration: string) => {
    setSettings((prev) => ({
      ...prev,
      defaultFocusDuration: parseInt(duration, 10),
    }));
  };

  const handleTaskPriorityChange = (priority: string) => {
    setSettings((prev) => ({
      ...prev,
      defaultTaskPriority: priority as TaskPriority,
    }));
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    changePassword.mutate(
      {
        json: {
          currentPassword,
          newPassword,
        },
      },
      {
        onSuccess: () => {
          toast.success('Password changed successfully');
          setCurrentPassword('');
          setNewPassword('');
          setConfirmPassword('');
        },
        onError: () => {
          toast.error(
            'Failed to change password. Check your current password.'
          );
        },
      }
    );
  };

  const handleDeleteAccount = async () => {
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
  };

  return (
    <div className="flex flex-col">
      <PageHeading>Settings</PageHeading>
      <Tabs
        defaultValue="appearance"
        className="mt-4 flex flex-col md:flex-row md:items-start"
      >
        <TabsList className="h-full w-full shrink-0 flex-col items-stretch justify-start gap-1 rounded-lg bg-transparent md:w-48">
          {[
            {
              value: 'appearance',
              icon: PaletteIcon,
              label: 'Appearance',
            },
            {
              value: 'focus',
              icon: ClockIcon,
              label: 'Focus',
            },
            {
              value: 'tasks',
              icon: ListTodoIcon,
              label: 'Tasks',
            },
            {
              value: 'danger',
              icon: ShieldAlertIcon,
              label: 'Danger Zone',
            },
          ].map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="justify-start px-3 py-2"
            >
              <tab.icon />
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <Separator
          orientation="vertical"
          className="ml-10 hidden h-[calc(100vh-10rem)]! w-px md:block"
        />
        <Separator className="my-4 md:hidden" />

        <div className="min-w-0 flex-1 md:px-10">
          <TabsContent value="appearance" className="mt-0 space-y-6">
            <SettingSection
              title="Theme"
              description="Choose your preferred color theme"
            >
              <div className="grid gap-3 sm:grid-cols-3">
                {THEME_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setTheme(option.value)}
                    className={cn(
                      'flex cursor-pointer items-center gap-2 rounded-lg border p-4 text-left transition-colors duration-300',
                      theme === option.value
                        ? 'bg-primary/5 border-primary/15'
                        : 'border-input hover:bg-muted/50'
                    )}
                  >
                    <option.icon className="size-4" />
                    <span className="text-sm font-medium">{option.label}</span>
                  </button>
                ))}
              </div>
            </SettingSection>

            <Separator />

            <SettingSection
              title="Command Menu Position"
              description="Choose where the command menu appears"
            >
              <div className="grid gap-3 sm:grid-cols-2">
                <OptionCard
                  title="Top"
                  description="Opens as a dropdown below the search bar"
                  selected={settings.commandMenuPosition === 'top'}
                  onSelect={() => handlePositionChange('top')}
                />
                <OptionCard
                  title="Center"
                  description="Opens as a centered modal dialog"
                  selected={settings.commandMenuPosition === 'center'}
                  onSelect={() => handlePositionChange('center')}
                />
              </div>
            </SettingSection>
          </TabsContent>

          <TabsContent value="focus" className="mt-0">
            <SettingSection
              title="Default Session Duration"
              description="Set the default duration for new focus sessions"
            >
              <div className="max-w-xs space-y-2">
                <Label htmlFor="default-duration">Duration</Label>
                <Select
                  value={settings.defaultFocusDuration.toString()}
                  onValueChange={handleFocusDurationChange}
                >
                  <SelectTrigger id="default-duration" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DURATION_OPTIONS.map((option) => (
                      <SelectItem
                        key={option.value}
                        value={option.value.toString()}
                      >
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </SettingSection>
          </TabsContent>

          <TabsContent value="tasks" className="mt-0">
            <SettingSection
              title="Default Task Priority"
              description="Set the default priority for new tasks"
            >
              <div className="max-w-xs space-y-2">
                <Label htmlFor="default-priority">Priority</Label>
                <Select
                  value={settings.defaultTaskPriority}
                  onValueChange={handleTaskPriorityChange}
                >
                  <SelectTrigger id="default-priority" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PRIORITY_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </SettingSection>
          </TabsContent>

          {isPasswordAuth && (
            <TabsContent value="account" className="mt-0">
              <SettingSection
                title="Change Password"
                description="Update your password to keep your account secure"
              >
                <form
                  onSubmit={handleChangePassword}
                  className="max-w-md space-y-4"
                >
                  <div className="space-y-2">
                    <Label htmlFor="current-password">Current Password</Label>
                    <Input
                      id="current-password"
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-password">New Password</Label>
                    <Input
                      id="new-password"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">
                      Confirm New Password
                    </Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={changePassword.isPending}
                    isLoading={changePassword.isPending}
                    loadingContent="Changing..."
                  >
                    Change Password
                  </Button>
                </form>
              </SettingSection>
            </TabsContent>
          )}

          <TabsContent value="danger" className="mt-0">
            <SettingSection
              title="Delete Account"
              description="Permanently delete your account and all associated data"
            >
              <div className="max-w-md space-y-3">
                <Label htmlFor="delete-confirmation">
                  Type <span className="font-mono font-semibold">DELETE</span>{' '}
                  to confirm account deletion
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
                  disabled={
                    deleteConfirmation !== 'DELETE' || deleteAccount.isPending
                  }
                  isLoading={deleteAccount.isPending}
                  loadingContent="Deleting..."
                >
                  Delete Account
                </Button>
              </div>
            </SettingSection>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
