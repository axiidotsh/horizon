'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useState } from 'react';

type View = 'daily' | 'weekly' | 'monthly';

export const DashboardCalendar = () => {
  const [view, setView] = useState<View>('daily');

  return (
    <div className="bg-dashboard-card rounded-sm border px-6 py-5">
      <div className="flex items-center justify-between">
        <h2 className="font-mono text-sm">Calendar</h2>
        <Select
          defaultValue="daily"
          value={view}
          onValueChange={(value) => setView(value as View)}
        >
          <SelectTrigger className="hover:bg-accent h-6! rounded-sm border-none bg-none px-2 shadow-none">
            <SelectValue placeholder="View" />
          </SelectTrigger>
          <SelectContent align="end">
            <SelectItem value="daily">Daily</SelectItem>
            <SelectItem value="weekly">Weekly</SelectItem>
            <SelectItem value="monthly">Monthly</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex size-full items-center justify-center font-mono text-sm">
        Calendar component goes here
      </div>
    </div>
  );
};
