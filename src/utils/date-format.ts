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

export function formatMinutesToTime(minutes: number): string {
  if (minutes === 0) return '0m';
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins}m`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
}

export function formatDayLabel(date: Date): string {
  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const dayIndex = date.getDay() === 0 ? 6 : date.getDay() - 1;
  return days[dayIndex];
}

export function formatFullDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

export function formatDueDateLabel(
  date: Date | string,
  completed?: boolean
): string {
  const dueDate = new Date(date);
  dueDate.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const diffTime = dueDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    if (completed) {
      return dueDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
    }
    const absDays = Math.abs(diffDays);
    return absDays === 1 ? '1 day overdue' : `${absDays} days overdue`;
  }
  if (diffDays === 0) {
    return 'Today';
  }
  if (diffDays === 1) {
    return 'Tomorrow';
  }
  if (diffDays <= 7) {
    return `In ${diffDays} days`;
  }
  return dueDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}
