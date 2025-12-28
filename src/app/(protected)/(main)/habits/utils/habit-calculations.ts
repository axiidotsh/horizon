import type { CompletionRecord, Habit, HabitWithMetrics } from '../hooks/types';

function getDateKey(date: Date): string {
  const d = new Date(date);
  const year = d.getUTCFullYear();
  const month = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
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
  const todayUTC = new Date(
    Date.UTC(today.getFullYear(), today.getMonth(), today.getDate())
  );

  let streak = 0;
  let checkDate = new Date(todayUTC);

  for (const completion of sorted) {
    const compDate = new Date(completion.date);
    const compDateUTC = new Date(
      Date.UTC(
        compDate.getUTCFullYear(),
        compDate.getUTCMonth(),
        compDate.getUTCDate()
      )
    );

    if (compDateUTC.getTime() === checkDate.getTime()) {
      streak++;
      checkDate = new Date(checkDate.getTime() - 24 * 60 * 60 * 1000);
    } else if (compDateUTC.getTime() < checkDate.getTime()) {
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
    const compDate = new Date(completion.date);
    const currentDate = new Date(
      Date.UTC(
        compDate.getUTCFullYear(),
        compDate.getUTCMonth(),
        compDate.getUTCDate()
      )
    );

    if (previousDate === null) {
      currentStreak = 1;
    } else {
      const expectedDate = new Date(
        previousDate.getTime() + 24 * 60 * 60 * 1000
      );

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
  const now = new Date();
  const today = new Date(
    Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())
  );

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
