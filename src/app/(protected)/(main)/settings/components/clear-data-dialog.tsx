'use client';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  ResponsiveDialog,
  ResponsiveDialogBody,
  ResponsiveDialogClose,
  ResponsiveDialogContent,
  ResponsiveDialogDescription,
  ResponsiveDialogFooter,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
  ResponsiveDialogTrigger,
} from '@/components/ui/responsive-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { useClearData } from '@/hooks/use-clear-data';
import { useState } from 'react';
import { toast } from 'sonner';

interface ClearDataSelection {
  focusSessions: boolean;
  tasks: boolean;
  habits: boolean;
  chats: boolean;
}

const DATE_RANGES = [
  { value: '1d', label: '1 day' },
  { value: '7d', label: '7 days' },
  { value: '14d', label: '14 days' },
  { value: '1m', label: '1 month' },
  { value: '3m', label: '3 months' },
  { value: '6m', label: '6 months' },
  { value: '9m', label: '9 months' },
  { value: '1y', label: '1 year' },
  { value: 'all', label: 'All time' },
] as const;

export const ClearDataDialog = () => {
  const clearData = useClearData();
  const [isOpen, setIsOpen] = useState(false);
  const [dateRange, setDateRange] = useState<string>('1d');
  const [selection, setSelection] = useState<ClearDataSelection>({
    focusSessions: false,
    tasks: false,
    habits: false,
    chats: false,
  });

  function handleToggle(key: keyof ClearDataSelection) {
    setSelection((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  function handleClearData() {
    const hasSelection = Object.values(selection).some((value) => value);

    if (!hasSelection) {
      toast.error('Please select at least one data type to clear');
      return;
    }

    clearData.mutate(
      {
        json: {
          ...selection,
          dateRange,
        },
      },
      {
        onSuccess: () => {
          setIsOpen(false);
          resetForm();
        },
      }
    );
  }

  function resetForm() {
    setSelection({
      focusSessions: false,
      tasks: false,
      habits: false,
      chats: false,
    });
    setDateRange('1d');
  }

  function handleOpenChange(open: boolean) {
    setIsOpen(open);
    if (!open) {
      resetForm();
    }
  }

  const hasSelection = Object.values(selection).some((value) => value);

  return (
    <ResponsiveDialog open={isOpen} onOpenChange={handleOpenChange}>
      <ResponsiveDialogTrigger asChild>
        <Button variant="destructive">Clear Data</Button>
      </ResponsiveDialogTrigger>
      <ResponsiveDialogContent>
        <ResponsiveDialogHeader>
          <ResponsiveDialogTitle>Clear Your Data</ResponsiveDialogTitle>
          <ResponsiveDialogDescription>
            Select the data you want to delete and the time range. This action
            cannot be undone.
          </ResponsiveDialogDescription>
        </ResponsiveDialogHeader>
        <ResponsiveDialogBody className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="date-range">Date range</Label>
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger
                id="date-range"
                className="hover:bg-muted! border-0 bg-transparent! shadow-none transition-colors duration-300"
              >
                <SelectValue placeholder="Select date range" />
              </SelectTrigger>
              <SelectContent align="end">
                {DATE_RANGES.map((range) => (
                  <SelectItem key={range.value} value={range.value}>
                    {range.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Separator />
          <div className="mb-6 space-y-4">
            <Label>Select data to clear</Label>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label
                  htmlFor="focus-sessions"
                  className="cursor-pointer font-normal"
                >
                  Focus Sessions
                </Label>
                <Switch
                  id="focus-sessions"
                  checked={selection.focusSessions}
                  onCheckedChange={() => handleToggle('focusSessions')}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="tasks" className="cursor-pointer font-normal">
                  Tasks
                </Label>
                <Switch
                  id="tasks"
                  checked={selection.tasks}
                  onCheckedChange={() => handleToggle('tasks')}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="habits" className="cursor-pointer font-normal">
                  Habits
                </Label>
                <Switch
                  id="habits"
                  checked={selection.habits}
                  onCheckedChange={() => handleToggle('habits')}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="chats" className="cursor-pointer font-normal">
                  Chats
                </Label>
                <Switch
                  id="chats"
                  checked={selection.chats}
                  onCheckedChange={() => handleToggle('chats')}
                />
              </div>
            </div>
          </div>
        </ResponsiveDialogBody>
        <ResponsiveDialogFooter>
          <ResponsiveDialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </ResponsiveDialogClose>
          <Button
            variant="destructive"
            onClick={handleClearData}
            disabled={clearData.isPending || !hasSelection}
            isLoading={clearData.isPending}
            loadingContent="Clearing..."
          >
            Clear Selected Data
          </Button>
        </ResponsiveDialogFooter>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
};
