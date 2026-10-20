import { addDays, rangeDates, type ISODate } from "@/lib/dates";

/** 'c' = confirmed, 'b' = blocked by the inn, 'p' = a request is pending. */
export type MarkCode = "c" | "b" | "p";
export type Marks = Record<string, Record<string, MarkCode>>;

export type BookableRoom = {
  id: number;
  slug: string;
  name: string;
  capacity: number;
  nightlyRate: number;
  beds: string;
  tagline: string;
  photo: { key: string; alt: string } | null;
};

export function markFor(marks: Marks, roomId: number, iso: ISODate): MarkCode | undefined {
  return marks[String(roomId)]?.[iso];
}

export function roomDayStatus(marks: Marks, roomId: number, iso: ISODate) {
  const mark = markFor(marks, roomId, iso);
  if (mark === "c") return "booked" as const;
  if (mark === "b") return "blocked" as const;
  if (mark === "p") return "pending" as const;
  return "free" as const;
}

export function rangeHasHold(marks: Marks, roomId: number, checkIn: ISODate, checkOut: ISODate) {
  for (const iso of rangeDates(checkIn, checkOut)) {
    const mark = markFor(marks, roomId, iso);
    if (mark === "c" || mark === "b") return true;
  }
  return false;
}

export function roomIsFree(
  marks: Marks,
  roomId: number,
  checkIn: ISODate,
  checkOut: ISODate,
): boolean {
  return !rangeHasHold(marks, roomId, checkIn, checkOut);
}

export function partySize(adults: number, children: number): number {
  return Math.max(1, adults) + Math.max(0, children);
}

export function nights(checkIn: ISODate, checkOut: ISODate): number {
  return rangeDates(checkIn, checkOut).length;
}

export function total(rate: number, checkIn: ISODate, checkOut: ISODate): number {
  return rate * nights(checkIn, checkOut);
}

/** For the "all rooms" calendar: what the house as a whole looks like. */
export function houseDayStatus(
  marks: Marks,
  rooms: { id: number }[],
  iso: ISODate,
): "free" | "booked" | "blocked" | "pending" {
  let free = 0;
  let pending = 0;
  let blocked = 0;
  for (const room of rooms) {
    const mark = markFor(marks, room.id, iso);
    if (mark === "c") continue;
    if (mark === "b") {
      blocked += 1;
      continue;
    }
    free += 1;
    if (mark === "p") pending += 1;
  }
  if (free === 0) return blocked === rooms.length ? "blocked" : "booked";
  if (pending === free) return "pending";
  return "free";
}

export function maxCheckOut(checkIn: ISODate, limit = 21): ISODate {
  return addDays(checkIn, limit);
}
