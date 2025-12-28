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
  return new Date(utcMidnight.getTime() + days * 24 * 60 * 60 * 1000);
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
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
  ).toISOString();
}
