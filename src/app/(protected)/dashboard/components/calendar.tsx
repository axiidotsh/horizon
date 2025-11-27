'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useState } from 'react';
import { DashboardCard } from './card';

type View = 'daily' | 'weekly' | 'monthly';

export const DashboardCalendar = () => {
  const [view, setView] = useState<View>('daily');

  return (
    <DashboardCard
      title="Calendar"
      action={
        <Select
          defaultValue="daily"
          value={view}
          onValueChange={(value) => setView(value as View)}
        >
          <SelectTrigger className="hover:bg-accent! h-6! rounded-sm border-none bg-transparent! px-2 shadow-none transition-all duration-300">
            <SelectValue placeholder="View" />
          </SelectTrigger>
          <SelectContent align="end">
            <SelectItem value="daily">Daily</SelectItem>
            <SelectItem value="weekly">Weekly</SelectItem>
            <SelectItem value="monthly">Monthly</SelectItem>
          </SelectContent>
        </Select>
      }
      contentClassName="flex size-full items-center justify-center font-mono text-sm"
    >
      Calendar component goes here
    </DashboardCard>
  );
};
