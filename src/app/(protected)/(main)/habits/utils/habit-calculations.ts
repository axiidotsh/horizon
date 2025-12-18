import type { CompletionRecord, Habit, HabitWithMetrics } from '../hooks/types';

function getDateKey(date: Date): string {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function isSameDay(date1: Date, date2: Date): boolean {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  return getDateKey(d1) === getDateKey(d2);
}

export function calculateCurrentStreak(
  completions: { date: Date | string }[]
): number {
  if (completions.length === 0) return 0;

  const sorted = [...completions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let streak = 0;
  const checkDate = new Date(today);

  for (const completion of sorted) {
    const compDate = new Date(completion.date);
    compDate.setHours(0, 0, 0, 0);

    if (compDate.getTime() === checkDate.getTime()) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else if (compDate.getTime() < checkDate.getTime()) {
      break;
    }
  }

  return streak;
}

export function calculateBestStreak(
  completions: { date: Date | string }[]
): number {
  if (completions.length === 0) return 0;

  const sorted = [...completions].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  let maxStreak = 0;
  let currentStreak = 0;
  let previousDate: Date | null = null;

  for (const completion of sorted) {
    const currentDate = new Date(completion.date);
    currentDate.setHours(0, 0, 0, 0);

    if (previousDate === null) {
      currentStreak = 1;
    } else {
      const expectedDate = new Date(previousDate);
      expectedDate.setDate(expectedDate.getDate() + 1);

      if (currentDate.getTime() === expectedDate.getTime()) {
        currentStreak++;
      } else {
        currentStreak = 1;
      }
    }

    maxStreak = Math.max(maxStreak, currentStreak);
    previousDate = currentDate;
  }

  return maxStreak;
}

export function enrichHabitsWithMetrics(habits: Habit[]): HabitWithMetrics[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return habits.map((habit) => {
    const completions = habit.completions || [];
    const currentStreak = calculateCurrentStreak(completions);
    const bestStreak = calculateBestStreak(completions);
    const totalCompletions = completions.length;

    const completedToday = completions.some((c) =>
      isSameDay(new Date(c.date), today)
    );

    const completionHistory: CompletionRecord[] = completions.map((c) => ({
      date: new Date(c.date),
      completed: true,
    }));

    return {
      ...habit,
      currentStreak,
      bestStreak,
      totalCompletions,
      completed: completedToday,
      completionHistory,
    };
  });
}

export function filterHabits(
  habits: HabitWithMetrics[],
  searchQuery: string,
  statusFilter: 'all' | 'completed' | 'pending'
): HabitWithMetrics[] {
  let filtered = habits;

  if (searchQuery.trim()) {
    const lowerQuery = searchQuery.toLowerCase();
    filtered = filtered.filter((habit) =>
      habit.title.toLowerCase().includes(lowerQuery)
    );
  }

  if (statusFilter === 'completed') {
    filtered = filtered.filter((habit) => habit.completed);
  } else if (statusFilter === 'pending') {
    filtered = filtered.filter((habit) => !habit.completed);
  }

  return filtered;
}

export function sortHabits(
  habits: HabitWithMetrics[],
  sortBy: 'streak' | 'title'
): HabitWithMetrics[] {
  return [...habits].sort((a, b) => {
    let comparison = 0;

    if (sortBy === 'streak') {
      comparison = b.currentStreak - a.currentStreak;
    } else if (sortBy === 'title') {
      comparison = a.title.localeCompare(b.title);
    }

    if (comparison === 0) {
      return a.id.localeCompare(b.id);
    }

    return comparison;
  });
}
