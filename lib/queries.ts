import { ensureDatabase } from "@/lib/db/bootstrap";
import { query, queryOne } from "@/lib/db";
import { addDays, todayISO, type ISODate } from "@/lib/dates";
import type {
  BlockedRange,
  GuestbookEntry,
  Menu,
  MenuItem,
  Occupancy,
  RequestStatus,
  Room,
  RoomPhoto,
  StayRequest,
} from "@/lib/types";
import { getOccupancy } from "@/lib/availability";

type RoomRow = {
  id: number;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  capacity: number;
  beds: string;
  size_sqm: number | null;
  nightly_rate: number;
  amenities: string[];
  is_listed: boolean;
  sort_order: number;
  photos: RoomPhoto[] | null;
};

function mapRoom(row: RoomRow): Room {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    tagline: row.tagline,
    description: row.description,
    capacity: row.capacity,
    beds: row.beds,
    sizeSqm: row.size_sqm,
    nightlyRate: row.nightly_rate,
    amenities: row.amenities ?? [],
    isListed: row.is_listed,
    sortOrder: row.sort_order,
    photos: row.photos ?? [],
  };
}

const ROOM_SELECT = `
  select r.id, r.slug, r.name, r.tagline, r.description, r.capacity, r.beds, r.size_sqm,
         r.nightly_rate, r.amenities, r.is_listed, r.sort_order,
         coalesce(
           (select json_agg(json_build_object('id', p.id, 'key', p.storage_key, 'alt', p.alt, 'sortOrder', p.sort_order)
                            order by p.sort_order, p.id)
              from room_photos p where p.room_id = r.id),
           '[]'::json
         ) as photos
    from rooms r
`;

export async function getRooms(options: { includeUnlisted?: boolean } = {}): Promise<Room[]> {
  await ensureDatabase();
  const rows = await query<RoomRow>(
    `${ROOM_SELECT} ${options.includeUnlisted ? "" : "where r.is_listed = true"} order by r.sort_order, r.id`,
  );
  return rows.map(mapRoom);
}

export async function getRoomBySlug(slug: string): Promise<Room | null> {
  await ensureDatabase();
  const rows = await query<RoomRow>(`${ROOM_SELECT} where r.slug = $1`, [slug]);
  return rows[0] ? mapRoom(rows[0]) : null;
}

export async function getRoomById(id: number): Promise<Room | null> {
  await ensureDatabase();
  const rows = await query<RoomRow>(`${ROOM_SELECT} where r.id = $1`, [id]);
  return rows[0] ? mapRoom(rows[0]) : null;
}

export async function getPhotoCount(): Promise<number> {
  const row = await queryOne<{ count: number }>(
    "select count(*)::int as count from room_photos",
  );
  return row?.count ?? 0;
}

// ---------------------------------------------------------------------------
// Menus
// ---------------------------------------------------------------------------

type MenuRow = {
  id: number;
  season: Menu["season"];
  title: string;
  intro: string;
  is_published: boolean;
  updated_at: string;
};

export async function getMenus(options: { includeUnpublished?: boolean } = {}): Promise<Menu[]> {
  await ensureDatabase();
  const order = "case season when 'spring' then 1 when 'summer' then 2 when 'autumn' then 3 else 4 end";
  const menus = await query<MenuRow>(
    `select id, season, title, intro, is_published, updated_at::text as updated_at
       from menus ${options.includeUnpublished ? "" : "where is_published = true"}
      order by ${order}`,
  );
  if (menus.length === 0) return [];
  const items = await query<{
    id: number;
    menu_id: number;
    section: string;
    name: string;
    description: string;
    dietary: string[];
    sort_order: number;
  }>(
    "select id, menu_id, section, name, description, dietary, sort_order from menu_items order by sort_order, id",
  );
  return menus.map((menu) => ({
    id: menu.id,
    season: menu.season,
    title: menu.title,
    intro: menu.intro,
    isPublished: menu.is_published,
    updatedAt: menu.updated_at,
    items: items
      .filter((item) => item.menu_id === menu.id)
      .map<MenuItem>((item) => ({
        id: item.id,
        section: item.section,
        name: item.name,
        description: item.description,
        dietary: item.dietary ?? [],
        sortOrder: item.sort_order,
      })),
  }));
}

export function groupMenuSections(menu: Menu): { section: string; items: MenuItem[] }[] {
  const sections: { section: string; items: MenuItem[] }[] = [];
  for (const item of menu.items) {
    const existing = sections.find((entry) => entry.section === item.section);
    if (existing) existing.items.push(item);
    else sections.push({ section: item.section, items: [item] });
  }
  return sections;
}

// ---------------------------------------------------------------------------
// Stay requests
// ---------------------------------------------------------------------------

type RequestRow = {
  id: number;
  reference: string;
  room_id: number;
  room_name: string;
  room_slug: string;
  nightly_rate: number;
  guest_name: string;
  guest_email: string;
  guest_phone: string;
  check_in: string;
  check_out: string;
  adults: number;
  children: number;
  message: string;
  status: RequestStatus;
  innkeeper_note: string | null;
  decided_at: string | null;
  created_at: string;
};

function mapRequest(row: RequestRow): StayRequest {
  return {
    id: row.id,
    reference: row.reference,
    roomId: row.room_id,
    roomName: row.room_name,
    roomSlug: row.room_slug,
    nightlyRate: row.nightly_rate,
    guestName: row.guest_name,
    guestEmail: row.guest_email,
    guestPhone: row.guest_phone,
    checkIn: row.check_in,
    checkOut: row.check_out,
    adults: row.adults,
    children: row.children,
    message: row.message,
    status: row.status,
    note: row.innkeeper_note,
    decidedAt: row.decided_at,
    createdAt: row.created_at,
  };
}

const REQUEST_SELECT = `
  select s.id, s.reference, s.room_id, r.name as room_name, r.slug as room_slug,
         r.nightly_rate,
         s.guest_name, s.guest_email, s.guest_phone,
         s.check_in::text as check_in, s.check_out::text as check_out,
         s.adults, s.children, s.message, s.status, s.innkeeper_note,
         s.decided_at::text as decided_at, s.created_at::text as created_at
    from stay_requests s join rooms r on r.id = s.room_id
`;

export async function getRequests(
  options: { status?: RequestStatus | "all"; roomId?: number; limit?: number } = {},
): Promise<StayRequest[]> {
  await ensureDatabase();
  const filters: string[] = [];
  const params: unknown[] = [];
  if (options.status && options.status !== "all") {
    params.push(options.status);
    filters.push(`s.status = $${params.length}`);
  }
  if (options.roomId) {
    params.push(options.roomId);
    filters.push(`s.room_id = $${params.length}`);
  }
  params.push(options.limit ?? 200);
  const where = filters.length ? `where ${filters.join(" and ")}` : "";
  const rows = await query<RequestRow>(
    `${REQUEST_SELECT} ${where}
     order by case s.status when 'pending' then 0 else 1 end, s.created_at desc
     limit $${params.length}`,
    params,
  );
  return rows.map(mapRequest);
}

export async function getRequestById(id: number): Promise<StayRequest | null> {
  await ensureDatabase();
  const rows = await query<RequestRow>(`${REQUEST_SELECT} where s.id = $1`, [id]);
  return rows[0] ? mapRequest(rows[0]) : null;
}

export async function getRequestByReference(reference: string): Promise<StayRequest | null> {
  await ensureDatabase();
  const rows = await query<RequestRow>(`${REQUEST_SELECT} where upper(s.reference) = upper($1)`, [
    reference,
  ]);
  return rows[0] ? mapRequest(rows[0]) : null;
}

export async function getUpcomingStays(days = 14): Promise<StayRequest[]> {
  await ensureDatabase();
  const today = todayISO();
  const rows = await query<RequestRow>(
    `${REQUEST_SELECT}
      where s.status = 'confirmed' and s.check_out >= $1 and s.check_in <= $2
      order by s.check_in`,
    [today, addDays(today, days)],
  );
  return rows.map(mapRequest);
}

// ---------------------------------------------------------------------------
// Blocked dates
// ---------------------------------------------------------------------------

type BlockRow = {
  id: number;
  room_id: number;
  room_name: string;
  start_date: string;
  end_date: string;
  reason: string;
  created_at: string;
};

export async function getBlockedRanges(options: { roomId?: number } = {}): Promise<BlockedRange[]> {
  await ensureDatabase();
  const params: unknown[] = [];
  let where = "";
  if (options.roomId) {
    params.push(options.roomId);
    where = "where b.room_id = $1";
  }
  const rows = await query<BlockRow>(
    `select b.id, b.room_id, r.name as room_name, b.start_date::text as start_date,
            b.end_date::text as end_date, b.reason, b.created_at::text as created_at
       from blocked_dates b join rooms r on r.id = b.room_id
       ${where}
      order by b.start_date`,
    params,
  );
  return rows.map((row) => ({
    id: row.id,
    roomId: row.room_id,
    roomName: row.room_name,
    startDate: row.start_date,
    endDate: row.end_date,
    reason: row.reason,
    createdAt: row.created_at,
  }));
}

// ---------------------------------------------------------------------------
// Guestbook
// ---------------------------------------------------------------------------

type GuestbookRow = {
  id: number;
  guest_name: string;
  location: string;
  stay_month: string;
  message: string;
  status: GuestbookEntry["status"];
  created_at: string;
  approved_at: string | null;
};

function mapGuestbook(row: GuestbookRow): GuestbookEntry {
  return {
    id: row.id,
    guestName: row.guest_name,
    location: row.location,
    stayMonth: row.stay_month,
    message: row.message,
    status: row.status,
    createdAt: row.created_at,
    approvedAt: row.approved_at,
  };
}

const GUESTBOOK_SELECT = `
  select id, guest_name, location, stay_month, message, status,
         created_at::text as created_at, approved_at::text as approved_at
    from guestbook_entries
`;

export async function getGuestbookEntries(
  status: GuestbookEntry["status"] | "all" = "approved",
  limit = 100,
): Promise<GuestbookEntry[]> {
  await ensureDatabase();
  if (status === "all") {
    const rows = await query<GuestbookRow>(
      `${GUESTBOOK_SELECT} order by case status when 'pending' then 0 else 1 end, created_at desc limit $1`,
      [limit],
    );
    return rows.map(mapGuestbook);
  }
  const rows = await query<GuestbookRow>(
    `${GUESTBOOK_SELECT} where status = $1 order by approved_at desc nulls last, created_at desc limit $2`,
    [status, limit],
  );
  return rows.map(mapGuestbook);
}

// ---------------------------------------------------------------------------
// The desk: a month at a glance
// ---------------------------------------------------------------------------

export type DeskMonth = {
  year: number;
  month: number;
  rooms: Room[];
  occupancy: Occupancy[];
  totals: {
    pending: number;
    confirmedNights: number;
    blockedNights: number;
    availableNights: number;
    occupancyRate: number;
    revenue: number;
  };
};

export async function getDeskMonth(year: number, month: number): Promise<DeskMonth> {
  const rooms = await getRooms({ includeUnlisted: true });
  const monthStart = `${year}-${String(month).padStart(2, "0")}-01`;
  const monthEnd = addDays(
    `${year}-${String(month).padStart(2, "0")}-${new Date(Date.UTC(year, month, 0)).getUTCDate()}`,
    1,
  );
  const occupancy = await getOccupancy(monthStart, monthEnd);
  const nights = new Date(Date.UTC(year, month, 0)).getUTCDate();
  let confirmedNights = 0;
  let blockedNights = 0;
  const counted = new Set<string>();
  for (const entry of occupancy) {
    for (let i = 0; i < 400; i += 1) {
      const date = addDays(entry.from, i);
      if (date >= entry.to || date < monthStart || date >= monthEnd) break;
      const key = `${entry.roomId}:${date}`;
      if (counted.has(key)) continue;
      counted.add(key);
      if (entry.kind === "confirmed") confirmedNights += 1;
      if (entry.kind === "blocked") blockedNights += 1;
    }
  }
  const rates = await query<{ id: number; nightly_rate: number }>(
    "select id, nightly_rate from rooms",
  );
  const rateFor = new Map(rates.map((room) => [room.id, room.nightly_rate]));
  let revenueTotal = 0;
  const perRoom = new Map<number, number>();
  for (const entry of occupancy) {
    if (entry.kind !== "confirmed") continue;
    const start = entry.from < monthStart ? monthStart : entry.from;
    const end = entry.to > monthEnd ? monthEnd : entry.to;
    const count = Math.max(0, dayDiff(start, end));
    perRoom.set(entry.roomId, (perRoom.get(entry.roomId) ?? 0) + count);
  }
  for (const [roomId, count] of perRoom) revenueTotal += count * (rateFor.get(roomId) ?? 0);

  const pending = await queryOne<{ count: number }>(
    "select count(*)::int as count from stay_requests where status = 'pending'",
  );
  const availableNights = Math.max(0, rooms.length * nights - blockedNights);
  return {
    year,
    month,
    rooms,
    occupancy,
    totals: {
      pending: pending?.count ?? 0,
      confirmedNights,
      blockedNights,
      availableNights,
      occupancyRate: availableNights > 0 ? confirmedNights / availableNights : 0,
      revenue: revenueTotal,
    },
  };
}

function dayDiff(a: ISODate, b: ISODate): number {
  return Math.round((Date.parse(`${b}T00:00:00Z`) - Date.parse(`${a}T00:00:00Z`)) / 86_400_000);
}

export type DeskSummary = {
  pendingRequests: number;
  pendingGuestbook: number;
  arrivals: StayRequest[];
  departures: StayRequest[];
  upcoming: StayRequest[];
  month: DeskMonth;
};

export async function getDeskSummary(): Promise<DeskSummary> {
  await ensureDatabase();
  const today = todayISO();
  const [pendingRequests, pendingGuestbook, upcoming] = await Promise.all([
    queryOne<{ count: number }>("select count(*)::int as count from stay_requests where status = 'pending'"),
    queryOne<{ count: number }>("select count(*)::int as count from guestbook_entries where status = 'pending'"),
    getUpcomingStays(10),
  ]);
  const { year, month } = { year: Number(today.slice(0, 4)), month: Number(today.slice(5, 7)) };
  const deskMonth = await getDeskMonth(year, month);
  return {
    pendingRequests: pendingRequests?.count ?? 0,
    pendingGuestbook: pendingGuestbook?.count ?? 0,
    arrivals: upcoming.filter((stay) => stay.checkIn === today),
    departures: upcoming.filter((stay) => stay.checkOut === today),
    upcoming,
    month: deskMonth,
  };
}
