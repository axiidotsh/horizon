'use client';

import { ContentCard } from '@/app/(protected)/(main)/components/content-card';
import { HabitListActions } from '../habit-list-actions';
import { HabitsList } from '../habits-list';

export const HabitListSection = () => {
  return (
    <ContentCard
      title="Habit Tracker"
      action={<HabitListActions />}
      headerClassName="max-sm:!flex-col max-sm:!items-start max-sm:!justify-start"
    >
      <HabitsList />
    </ContentCard>
  );
};
