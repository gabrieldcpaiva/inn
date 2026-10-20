export const INN_TIME_ZONE = "Europe/London";
export const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
export const MONTHS = [
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

export type ISODate = string; // YYYY-MM-DD

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

/** Today's date at the inn, as YYYY-MM-DD. */
export function todayISO(now: Date = new Date()): ISODate {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: INN_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return formatter.format(now); // en-CA gives YYYY-MM-DD
}

export function toISO(year: number, month1: number, day: number): ISODate {
  return `${year}-${pad(month1)}-${pad(day)}`;
}

export function parseISO(iso: ISODate): { year: number; month: number; day: number } {
  const [year, month, day] = iso.split("-").map(Number);
  return { year, month, day };
}

export function isValidISO(iso: unknown): iso is ISODate {
  if (typeof iso !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(iso)) return false;
  const { year, month, day } = parseISO(iso);
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

function utc(iso: ISODate): Date {
  const { year, month, day } = parseISO(iso);
  return new Date(Date.UTC(year, month - 1, day));
}

export function addDays(iso: ISODate, days: number): ISODate {
  const date = utc(iso);
  date.setUTCDate(date.getUTCDate() + days);
  return toISO(date.getUTCFullYear(), date.getUTCMonth() + 1, date.getUTCDate());
}

export function addMonths(iso: ISODate, months: number): ISODate {
  const { year, month, day } = parseISO(iso);
  const date = new Date(Date.UTC(year, month - 1 + months, 1));
  const daysInMonth = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0),
  ).getUTCDate();
  return toISO(
    date.getUTCFullYear(),
    date.getUTCMonth() + 1,
    Math.min(day, daysInMonth),
  );
}

export function diffDays(from: ISODate, to: ISODate): number {
  return Math.round((utc(to).getTime() - utc(from).getTime()) / 86_400_000);
}

export function compareISO(a: ISODate, b: ISODate): number {
  return a < b ? -1 : a > b ? 1 : 0;
}

export function rangeDates(from: ISODate, toExclusive: ISODate): ISODate[] {
  const dates: ISODate[] = [];
  let cursor = from;
  let guard = 0;
  while (cursor < toExclusive && guard < 1000) {
    dates.push(cursor);
    cursor = addDays(cursor, 1);
    guard += 1;
  }
  return dates;
}

/** Inclusive list of dates for a stay: nights only, checkout day excluded. */
export function stayNights(checkIn: ISODate, checkOut: ISODate): ISODate[] {
  return rangeDates(checkIn, checkOut);
}

export function nightsBetween(checkIn: ISODate, checkOut: ISODate): number {
  return Math.max(0, diffDays(checkIn, checkOut));
}

const longFormatter = new Intl.DateTimeFormat("en-GB", {
  weekday: "long",
  day: "numeric",
  month: "long",
  timeZone: "UTC",
});

const shortFormatter = new Intl.DateTimeFormat("en-GB", {
  weekday: "short",
  day: "numeric",
  month: "short",
  timeZone: "UTC",
});

const dayMonthFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  timeZone: "UTC",
});

const monthYearFormatter = new Intl.DateTimeFormat("en-GB", {
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

export function formatLong(iso: ISODate): string {
  return longFormatter.format(utc(iso));
}

export function formatShort(iso: ISODate): string {
  return shortFormatter.format(utc(iso));
}

export function formatDayMonth(iso: ISODate): string {
  return dayMonthFormatter.format(utc(iso));
}

export function formatMonthYear(iso: ISODate): string {
  return monthYearFormatter.format(utc(iso));
}

export function monthLabel(year: number, month1: number): string {
  return `${MONTHS[month1 - 1]} ${year}`;
}

/** A readable stay range: "Fri 23 Oct → Sun 25 Oct · 2 nights". */
export function formatStay(checkIn: ISODate, checkOut: ISODate): string {
  const nights = nightsBetween(checkIn, checkOut);
  return `${formatShort(checkIn)} → ${formatShort(checkOut)} · ${nights} ${
    nights === 1 ? "night" : "nights"
  }`;
}

export function formatStayLong(checkIn: ISODate, checkOut: ISODate): string {
  return `${formatLong(checkIn)} to ${formatLong(checkOut)}`;
}

export type CalendarCell = {
  iso: ISODate;
  day: number;
  inMonth: boolean;
  isToday: boolean;
  isPast: boolean;
};

/** A Monday-first grid of 6 weeks covering the given month. */
export function monthGrid(
  year: number,
  month1: number,
  today: ISODate = todayISO(),
): CalendarCell[][] {
  const first = new Date(Date.UTC(year, month1 - 1, 1));
  const weekday = (first.getUTCDay() + 6) % 7; // Monday = 0
  const start = addDays(toISO(year, month1, 1), -weekday);
  const allWeeks: CalendarCell[][] = [];
  for (let week = 0; week < 6; week += 1) {
    const cells: CalendarCell[] = [];
    for (let day = 0; day < 7; day += 1) {
      const iso = addDays(start, week * 7 + day);
      const parsed = parseISO(iso);
      cells.push({
        iso,
        day: parsed.day,
        inMonth: parsed.month === month1 && parsed.year === year,
        isToday: iso === today,
        isPast: iso < today,
      });
    }
    allWeeks.push(cells);
  }
  // Trim weeks that hold no day of this month, so the grid doesn't end on a
  // lonely empty row.
  return allWeeks.filter((week) => week.some((cell) => cell.inMonth));
}

export function seasonForDate(iso: ISODate): "spring" | "summer" | "autumn" | "winter" {
  const { month } = parseISO(iso);
  if (month >= 3 && month <= 5) return "spring";
  if (month >= 6 && month <= 8) return "summer";
  if (month >= 9 && month <= 11) return "autumn";
  return "winter";
}

export function currentSeason(): "spring" | "summer" | "autumn" | "winter" {
  return seasonForDate(todayISO());
}

export function formatMoney(pence: number): string {
  return `£${pence.toLocaleString("en-GB")}`;
}
