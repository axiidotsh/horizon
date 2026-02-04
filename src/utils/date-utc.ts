import { DAY_IN_MS } from '@/server/constants';

export function getUTCDateKey(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function createUTCDate(year: number, month: number, day: number): Date {
  return new Date(Date.UTC(year, month, day));
}

export function getUTCMidnight(date: Date): Date {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
  );
}

export function addUTCDays(date: Date, days: number): Date {
  const utcMidnight = getUTCMidnight(date);
  return new Date(utcMidnight.getTime() + days * DAY_IN_MS);
}

export function getUTCDaysDifference(date1: Date, date2: Date): number {
  const d1 = Date.UTC(
    date1.getUTCFullYear(),
    date1.getUTCMonth(),
    date1.getUTCDate()
  );
  const d2 = Date.UTC(
    date2.getUTCFullYear(),
    date2.getUTCMonth(),
    date2.getUTCDate()
  );
  return Math.floor((d1 - d2) / (1000 * 60 * 60 * 24));
}

export function normalizeToUTCMidnight(date: Date): string {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
  ).toISOString();
}

export function isSameDayUTC(date1: Date, date2: Date): boolean {
  return getUTCDateKey(date1) === getUTCDateKey(date2);
}

export function isTodayUTC(date: Date): boolean {
  const today = new Date();
  return isSameDayUTC(date, today);
}

export function getLast7DaysUTC(): Date[] {
  const days: Date[] = [];
  const now = new Date();
  const today = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
  );

  for (let i = 6; i >= 0; i--) {
    const date = new Date(today.getTime() - i * DAY_IN_MS);
    days.push(date);
  }

  return days;
}

export function getUTCStartOfDaysAgo(days: number): Date {
  const now = new Date();
  return new Date(
    Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate() - days,
      0,
      0,
      0,
      0
    )
  );
}
