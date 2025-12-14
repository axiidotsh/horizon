import type { FocusSession } from '../hooks/types';

export function formatSessionTime(dateString: string): string {
  return new Date(dateString).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

export function formatSessionDateTime(dateString: string): string {
  const date = new Date(dateString);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const isToday = date.toDateString() === today.toDateString();
  const isYesterday = date.toDateString() === yesterday.toDateString();

  const time = date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  if (isToday) {
    return `Today at ${time}`;
  }
  if (isYesterday) {
    return `Yesterday at ${time}`;
  }

  const dateStr = date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
  return `${dateStr} at ${time}`;
}

export function formatMinutesToTime(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

function getDateKey(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getTodaysCompletedSessions(
  sessions: FocusSession[]
): FocusSession[] {
  const now = new Date();
  const todayKey = getDateKey(now);
  return sessions.filter((session) => {
    const sessionDate = new Date(session.startedAt);
    const sessionKey = getDateKey(sessionDate);
    return sessionKey === todayKey && session.status === 'COMPLETED';
  });
}

export function getTotalFocusTime(sessions: FocusSession[]): string {
  const todaysSessions = getTodaysCompletedSessions(sessions);
  const totalMinutes = todaysSessions.reduce(
    (acc, session) => acc + session.durationMinutes,
    0
  );
  return formatMinutesToTime(totalMinutes);
}

export function getYesterdaysFocusMinutes(sessions: FocusSession[]): number {
  const now = new Date();
  const yesterday = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - 1)
  );
  const yesterdayKey = getDateKey(yesterday);

  return sessions
    .filter((session) => {
      if (session.status !== 'COMPLETED') return false;
      const sessionDate = new Date(session.startedAt);
      const sessionKey = getDateKey(sessionDate);
      return sessionKey === yesterdayKey;
    })
    .reduce((acc, session) => acc + session.durationMinutes, 0);
}

export function generateChartData(sessions: FocusSession[], days = 7) {
  const now = new Date();
  const chartData = [];

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - i)
    );
    const dateKey = getDateKey(date);

    const daySessions = sessions.filter((session) => {
      if (session.status !== 'COMPLETED') return false;
      const sessionDate = new Date(session.startedAt);
      const sessionKey = getDateKey(sessionDate);
      return sessionKey === dateKey;
    });

    const totalDuration = daySessions.reduce(
      (acc, session) => acc + session.durationMinutes,
      0
    );

    const dateLabel =
      days <= 7
        ? date.toLocaleDateString('en-US', { weekday: 'short' })
        : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    chartData.push({
      date: dateLabel,
      duration: totalDuration,
    });
  }

  return chartData;
}
