import { ensureDatabase } from "@/lib/db/bootstrap";
import { query } from "@/lib/db";
import { addDays, rangeDates, type ISODate } from "@/lib/dates";
import { formatShort } from "@/lib/dates";
import type { Occupancy, OccupancyKind } from "@/lib/types";

export type DayMark = { kind: OccupancyKind; label: string };
export type AvailabilityMap = Map<number, Map<ISODate, DayMark>>;

/**
 * Everything that stands in the way of a booking between two dates: confirmed
 * stays, dates the innkeeper has blocked, and requests still waiting for an
 * answer. The calendar shows all three; only confirmed and blocked dates
 * actually stop a booking.
 */
export async function getOccupancy(
  from: ISODate,
  to: ISODate,
  roomIds?: number[],
): Promise<Occupancy[]> {
  await ensureDatabase();
  const filter = roomIds && roomIds.length > 0 ? roomIds : null;
  const roomFilter = filter ? "and room_id = any($3::int[])" : "";
  const params: unknown[] = [from, to];
  if (filter) params.push(filter);

  const requests = await query<{
    id: number;
    room_id: number;
    check_in: string;
    check_out: string;
    status: "pending" | "confirmed";
    guest_name: string;
    reference: string;
    adults: number;
    children: number;
  }>(
    `select id, room_id, check_in::text as check_in, check_out::text as check_out, status,
            guest_name, reference, adults, children
       from stay_requests
      where status in ('confirmed', 'pending')
        and check_in < $2 and check_out > $1
        ${roomFilter}
      order by check_in`,
    params,
  );

  const blocks = await query<{
    id: number;
    room_id: number;
    start_date: string;
    end_date: string;
    reason: string;
  }>(
    `select id, room_id, start_date::text as start_date, end_date::text as end_date, reason
       from blocked_dates
      where start_date < $2 and end_date > $1
        ${roomFilter}
      order by start_date`,
    params,
  );

  const occupancy: Occupancy[] = [];

  for (const request of requests) {
    const party = `${request.adults} ${request.adults === 1 ? "guest" : "guests"}${
      request.children > 0 ? ` + ${request.children} ${request.children === 1 ? "child" : "children"}` : ""
    }`;
    occupancy.push({
      roomId: request.room_id,
      from: request.check_in,
      to: request.check_out,
      kind: request.status,
      label:
        request.status === "confirmed"
          ? request.guest_name
          : `Request · ${request.guest_name}`,
      detail:
        request.status === "confirmed"
          ? `${request.reference} · ${party}`
          : `${request.reference} · awaiting your answer`,
      requestId: request.id,
    });
  }

  for (const block of blocks) {
    occupancy.push({
      roomId: block.room_id,
      from: block.start_date,
      to: block.end_date,
      kind: "blocked",
      label: "Blocked",
      detail: block.reason || "Closed by the innkeeper",
      blockId: block.id,
    });
  }

  return occupancy;
}

const PRIORITY: Record<OccupancyKind, number> = {
  blocked: 3,
  confirmed: 2,
  pending: 1,
};

/** Expands occupancy intervals into a per-room, per-night lookup. */
export function buildAvailabilityMap(
  occupancy: Occupancy[],
  from: ISODate,
  to: ISODate,
): AvailabilityMap {
  const map: AvailabilityMap = new Map();
  for (const stay of occupancy) {
    const start = stay.from < from ? from : stay.from;
    const end = stay.to > to ? to : stay.to;
    if (start >= end) continue;
    let roomMap = map.get(stay.roomId);
    if (!roomMap) {
      roomMap = new Map();
      map.set(stay.roomId, roomMap);
    }
    for (const date of rangeDates(start, end)) {
      const current = roomMap.get(date);
      if (!current || PRIORITY[stay.kind] > PRIORITY[current.kind]) {
        roomMap.set(date, { kind: stay.kind, label: stay.label });
      }
    }
  }
  return map;
}

export function markFor(map: AvailabilityMap, roomId: number, date: ISODate): DayMark | null {
  return map.get(roomId)?.get(date) ?? null;
}

/**
 * Whether a set of rooms is free for every night of a stay. Pending requests
 * are shown to guests but do not hold a room.
 */
export async function findConflicts(
  checkIn: ISODate,
  checkOut: ISODate,
  rooms: { id: number; name: string; capacity: number }[],
  partySize: number,
): Promise<{ conflicts: { roomId: number; name: string; reason: string }[]; tooSmall: number[] }> {
  const occupancy = await getOccupancy(checkIn, checkOut, rooms.map((room) => room.id));
  const conflicts: { roomId: number; name: string; reason: string }[] = [];
  const tooSmall: number[] = [];
  for (const room of rooms) {
    if (room.capacity < partySize) {
      tooSmall.push(room.id);
      continue;
    }
    const clash = occupancy.find(
      (entry) =>
        entry.roomId === room.id &&
        entry.kind !== "pending" &&
        entry.from < checkOut &&
        entry.to > checkIn,
    );
    if (clash) {
      conflicts.push({
        roomId: room.id,
        name: room.name,
        reason:
          clash.kind === "blocked"
            ? `closed from ${formatShort(maxISODate(clash.from, checkIn))}`
            : `taken from ${formatShort(maxISODate(clash.from, checkIn))}`,
      });
    }
  }
  return { conflicts, tooSmall };
}

function maxISODate(a: ISODate, b: ISODate): ISODate {
  return a > b ? a : b;
}

/** A compact "free / taken" strip used on room cards. */
export async function nextFreeNight(
  roomId: number,
  from: ISODate,
  span = 60,
): Promise<ISODate | null> {
  const occupancy = await getOccupancy(from, addDays(from, span), [roomId]);
  const blocked = new Set<ISODate>();
  for (const entry of occupancy) {
    if (entry.kind === "pending") continue;
    for (const date of rangeDates(entry.from, entry.to)) blocked.add(date);
  }
  for (const date of rangeDates(from, addDays(from, span))) {
    if (!blocked.has(date)) return date;
  }
  return null;
}

/**
 * Compacts occupancy intervals into the small map the calendars need:
 * `{ [roomId]: { [date]: 'c' | 'b' | 'p' } }`.
 */
export function toMarks(occupancy: Occupancy[]): Record<string, Record<string, "c" | "b" | "p">> {
  const marks: Record<string, Record<string, "c" | "b" | "p">> = {};
  const priority: Record<string, number> = { p: 1, c: 2, b: 3 };
  for (const entry of occupancy) {
    const code = entry.kind === "confirmed" ? "c" : entry.kind === "blocked" ? "b" : "p";
    const roomMarks = (marks[String(entry.roomId)] ??= {});
    for (const date of rangeDates(entry.from, entry.to)) {
      const current = roomMarks[date];
      if (!current || priority[code] > priority[current]) roomMarks[date] = code;
    }
  }
  return marks;
}
