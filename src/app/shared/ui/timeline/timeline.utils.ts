export function parseLocalDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export interface TimelineColumn {
  colNumber: number;
  label: string;
  start: Date;
  end: Date;
  isCurrent: boolean;
}

export interface TimelineRange {
  start: Date;
  count: number;
}

export function getDayRange(today: Date): TimelineRange {
  const start = new Date(today);
  start.setDate(start.getDate() - 32);
  return { start, count: 59 };
}

export function getWeekRange(today: Date): TimelineRange {
  const dayOfWeek = today.getDay();
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const currentMonday = new Date(today);
  currentMonday.setDate(currentMonday.getDate() + mondayOffset);

  const start = new Date(currentMonday);
  start.setMonth(start.getMonth() - 2);
  const startDow = start.getDay();
  start.setDate(start.getDate() + (startDow === 0 ? 1 : startDow === 1 ? 0 : 8 - startDow));

  const end = new Date(currentMonday);
  end.setMonth(end.getMonth() + 2);

  const count = Math.floor((end.getTime() - start.getTime()) / (7 * 24 * 60 * 60 * 1000)) + 1;
  return { start, count };
}

export function getMonthRange(today: Date): TimelineRange {
  const start = new Date(today.getFullYear(), today.getMonth() - 6, 1);
  return { start, count: 13 };
}

export function generateDayColumns(start: Date, count: number, today: Date): TimelineColumn[] {
  const columns: TimelineColumn[] = [];

  for (let i = 0; i < count; i++) {
    const colStart = new Date(start);
    colStart.setDate(start.getDate() + i);
    colStart.setHours(0, 0, 0, 0);

    const colEnd = new Date(colStart);
    colEnd.setDate(colEnd.getDate() + 1);
    colEnd.setTime(colEnd.getTime() - 1);

    const isCurrent =
      colStart.getFullYear() === today.getFullYear() &&
      colStart.getMonth() === today.getMonth() &&
      colStart.getDate() === today.getDate();

    columns.push({
      colNumber: i + 1,
      label: colStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      start: colStart,
      end: colEnd,
      isCurrent,
    });
  }
  return columns;
}

export function generateWeekColumns(start: Date, count: number, today: Date): TimelineColumn[] {
  const columns: TimelineColumn[] = [];

  for (let i = 0; i < count; i++) {
    const weekStart = new Date(start);
    weekStart.setDate(start.getDate() + i * 7);
    weekStart.setHours(0, 0, 0, 0);

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);
    weekEnd.setTime(weekEnd.getTime() - 1);

    const labelEnd = new Date(weekStart);
    labelEnd.setDate(labelEnd.getDate() + 6);

    const startLabel = weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const endLabel =
      weekStart.getMonth() === labelEnd.getMonth()
        ? `${labelEnd.getDate()}`
        : labelEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    const todayTime = today.getTime();
    const isCurrent = todayTime >= weekStart.getTime() && todayTime <= weekEnd.getTime();

    columns.push({
      colNumber: i + 1,
      label: `${startLabel}-${endLabel}`,
      start: weekStart,
      end: weekEnd,
      isCurrent,
    });
  }
  return columns;
}

export function generateMonthColumns(start: Date, count: number, today: Date): TimelineColumn[] {
  const columns: TimelineColumn[] = [];

  for (let i = 0; i < count; i++) {
    const colStart = new Date(start.getFullYear(), start.getMonth() + i, 1);

    const colEnd = new Date(start.getFullYear(), start.getMonth() + i + 1, 1);
    colEnd.setTime(colEnd.getTime() - 1);

    const isCurrent =
      colStart.getFullYear() === today.getFullYear() &&
      colStart.getMonth() === today.getMonth();

    columns.push({
      colNumber: i + 1,
      label: colStart.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      start: colStart,
      end: colEnd,
      isCurrent,
    });
  }
  return columns;
}
