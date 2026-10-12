/**
 * @maataa/ui/forms/dateUtils
 * Small internal date helpers shared by DatePicker, DateTimePicker, and
 * DateRangePicker. Not part of the public API — deliberately dependency-free
 * (no date library) since the calendar UI only needs month/day arithmetic.
 */

export const WEEKDAY_LABELS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const MONTH_NAMES_SHORT = MONTH_NAMES.map((m) => m.slice(0, 3));

export function isSameDay(a: Date | null, b: Date | null): boolean {
  if (!a || !b) return false;
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

/** Strips the time portion, returning a new Date at local midnight. */
export function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function addMonths(date: Date, count: number): Date {
  return new Date(date.getFullYear(), date.getMonth() + count, 1);
}

export function isBeforeDay(a: Date, b: Date): boolean {
  return startOfDay(a).getTime() < startOfDay(b).getTime();
}

export function isAfterDay(a: Date, b: Date): boolean {
  return startOfDay(a).getTime() > startOfDay(b).getTime();
}

export function isWithinRange(date: Date, min?: Date, max?: Date): boolean {
  if (min && isBeforeDay(date, min)) return false;
  if (max && isAfterDay(date, max)) return false;
  return true;
}

/** Deterministic, locale-independent display format: "Sep 9, 2026" */
export function formatDisplayDate(date: Date): string {
  return `${MONTH_NAMES_SHORT[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}

export function formatMonthYear(date: Date): string {
  return `${MONTH_NAMES[date.getMonth()]} ${date.getFullYear()}`;
}

/**
 * Builds a 6x7 (42-cell) grid of dates for the given month, including the
 * trailing days of the previous month and leading days of the next month
 * needed to fill complete weeks (Sunday-first).
 */
export function getMonthGrid(monthDate: Date): { date: Date; inMonth: boolean }[] {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const firstOfMonth = new Date(year, month, 1);
  const startWeekday = firstOfMonth.getDay();
  const gridStart = new Date(year, month, 1 - startWeekday);

  const cells: { date: Date; inMonth: boolean }[] = [];
  for (let i = 0; i < 42; i++) {
    const date = new Date(gridStart.getFullYear(), gridStart.getMonth(), gridStart.getDate() + i);
    cells.push({ date, inMonth: date.getMonth() === month });
  }
  return cells;
}

/** Formats a Date's time-of-day as "HH:MM" for use with <input type="time">. */
export function formatTimeValue(date: Date): string {
  const hh = String(date.getHours()).padStart(2, "0");
  const mm = String(date.getMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
}

/** Applies an "HH:MM" time string onto a date, returning a new Date. */
export function applyTimeValue(date: Date, time: string): Date {
  const [hh, mm] = time.split(":").map((n) => parseInt(n, 10));
  const next = new Date(date);
  next.setHours(Number.isFinite(hh) ? hh : 0, Number.isFinite(mm) ? mm : 0, 0, 0);
  return next;
}
