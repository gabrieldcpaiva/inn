"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import sharp from "sharp";
import { requireInnkeeper } from "@/lib/auth";
import { execute, query, queryOne } from "@/lib/db";
import { ensureDatabase } from "@/lib/db/bootstrap";
import {
  blockSchema,
  decisionSchema,
  menuItemSchema,
  menuSchema,
  number,
  roomSchema,
  splitList,
  text,
  zodErrors,
  type ActionState,
} from "@/lib/validation";
import { deleteObject, putObject } from "@/lib/storage";
import { formatShort, todayISO } from "@/lib/dates";
import { getRequestById } from "@/lib/queries";

function refresh(): void {
  revalidatePath("/", "layout");
}

function lastSegment(formData: FormData, fallback: string): string {
  const raw = text(formData.get("returnTo"), 300);
  return raw.startsWith("/desk") ? raw : fallback;
}

// ---------------------------------------------------------------------------
// Stay requests
// ---------------------------------------------------------------------------

export async function decideRequest(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireInnkeeper();
  await ensureDatabase();

  const parsed = decisionSchema.safeParse({
    requestId: number(formData.get("requestId")),
    decision: text(formData.get("decision"), 20),
    note: text(formData.get("note"), 1000),
  });
  if (!parsed.success) {
    return { status: "error", message: "That didn’t make sense. Please try again." };
  }

  const request = await getRequestById(parsed.data.requestId);
  if (!request) return { status: "error", message: "That request has gone." };

  if (parsed.data.decision === "confirm") {
    const overlap = await query<{ reference: string; check_in: string; check_out: string }>(
      `select reference, check_in::text as check_in, check_out::text as check_out
         from stay_requests
        where room_id = $1 and status = 'confirmed' and id <> $2
          and check_in < $4 and check_out > $3
        union all
       select 'blocked' as reference, start_date::text as check_in, end_date::text as check_out
         from blocked_dates
        where room_id = $1 and start_date < $4 and end_date > $3`,
      [request.roomId, request.id, request.checkIn, request.checkOut],
    );
    if (overlap.length > 0) {
      const clash = overlap[0];
      return {
        status: "error",
        message: `${request.roomName} is already held for ${formatShort(clash.check_in)} – ${formatShort(clash.check_out)} (${
          clash.reference === "blocked" ? "closed dates" : clash.reference
        }). Decline this request, or lift the other hold, before confirming.`,
      };
    }
  }

  await execute(
    `update stay_requests
        set status = $2,
            innkeeper_note = $3,
            decided_at = now(),
            updated_at = now()
      where id = $1`,
    [request.id, parsed.data.decision === "confirm" ? "confirmed" : "declined", parsed.data.note],
  );

  refresh();
  return {
    status: "success",
    message:
      parsed.data.decision === "confirm"
        ? `Confirmed ${request.reference}. The room is held; send the guest a note when you’re ready.`
        : `Declined ${request.reference}. A kind note goes a long way.`,
  };
}

export async function reopenRequest(formData: FormData): Promise<void> {
  await requireInnkeeper();
  const id = number(formData.get("requestId"));
  await execute(
    "update stay_requests set status = 'pending', decided_at = null, innkeeper_note = null, updated_at = now() where id = $1",
    [id],
  );
  refresh();
  redirect(lastSegment(formData, "/desk/requests"));
}

// ---------------------------------------------------------------------------
// Blocked dates
// ---------------------------------------------------------------------------

export async function blockDates(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireInnkeeper();
  await ensureDatabase();

  const parsed = blockSchema.safeParse({
    roomId: number(formData.get("roomId")),
    startDate: text(formData.get("startDate"), 10),
    endDate: text(formData.get("endDate"), 10),
    reason: text(formData.get("reason"), 200),
  });
  if (!parsed.success) {
    return { status: "error", message: "Check the dates and try again.", errors: zodErrors(parsed.error) };
  }
  const data = parsed.data;
  if (data.startDate < todayISO()) {
    return { status: "error", message: "Blocks can only be made from today onwards." };
  }

  const clashes = await query<{ reference: string; guest_name: string; check_in: string; check_out: string }>(
    `select reference, guest_name, check_in::text as check_in, check_out::text as check_out
       from stay_requests
      where room_id = $1 and status = 'confirmed' and check_in < $3 and check_out > $2`,
    [data.roomId, data.startDate, data.endDate],
  );
  if (clashes.length > 0) {
    const clash = clashes[0];
    return {
      status: "error",
      message: `There is a confirmed stay in that window (${clash.guest_name}, ${formatShort(clash.check_in)} – ${formatShort(clash.check_out)}).`,
    };
  }

  await execute(
    "insert into blocked_dates (room_id, start_date, end_date, reason) values ($1,$2,$3,$4)",
    [data.roomId, data.startDate, data.endDate, data.reason],
  );
  refresh();
  return { status: "success", message: "Those dates are now closed to new requests." };
}

export async function unblockDates(formData: FormData): Promise<void> {
  await requireInnkeeper();
  const id = number(formData.get("blockId"));
  await execute("delete from blocked_dates where id = $1", [id]);
  refresh();
}

// ---------------------------------------------------------------------------
// Rooms & photographs
// ---------------------------------------------------------------------------

export async function saveRoom(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireInnkeeper();
  await ensureDatabase();

  const id = number(formData.get("roomId"));
  const parsed = roomSchema.safeParse({
    name: text(formData.get("name"), 80),
    slug: text(formData.get("slug"), 60).toLowerCase(),
    tagline: text(formData.get("tagline"), 180),
    description: text(formData.get("description"), 4000),
    capacity: number(formData.get("capacity"), 2),
    beds: text(formData.get("beds"), 120),
    sizeSqm: text(formData.get("sizeSqm"), 6),
    nightlyRate: number(formData.get("nightlyRate"), 0),
    amenities: text(formData.get("amenities"), 2000),
    isListed: formData.get("isListed") ? "on" : "off",
  });
  if (!parsed.success) {
    return { status: "error", message: "A few things need another look.", errors: zodErrors(parsed.error) };
  }

  const data = parsed.data;
  const duplicate = await queryOne<{ id: number }>(
    "select id from rooms where slug = $1 and id <> $2",
    [data.slug, id || 0],
  );
  if (duplicate) {
    return {
      status: "error",
      message: "Another room already uses that address.",
      errors: { slug: "Already in use" },
    };
  }

  const values = [
    data.name,
    data.slug,
    data.tagline,
    data.description,
    data.capacity,
    data.beds,
    data.sizeSqm ?? null,
    data.nightlyRate,
    splitList(data.amenities),
    data.isListed === "on",
  ];

  if (id) {
    await execute(
      `update rooms set name=$1, slug=$2, tagline=$3, description=$4, capacity=$5, beds=$6,
              size_sqm=$7, nightly_rate=$8, amenities=$9, is_listed=$10, updated_at=now()
        where id=$11`,
      [...values, id],
    );
    refresh();
    return { status: "success", message: "Room saved." };
  }

  const order = await queryOne<{ next: number }>(
    "select coalesce(max(sort_order), 0) + 1 as next from rooms",
  );
  const created = await queryOne<{ id: number }>(
    `insert into rooms (name, slug, tagline, description, capacity, beds, size_sqm, nightly_rate, amenities, is_listed, sort_order)
     values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) returning id`,
    [...values, order?.next ?? 1],
  );
  refresh();
  redirect(`/desk/rooms/${created?.id ?? ""}`);
}

export async function toggleRoomListing(formData: FormData): Promise<void> {
  await requireInnkeeper();
  const id = number(formData.get("roomId"));
  await execute(
    "update rooms set is_listed = not is_listed, updated_at = now() where id = $1",
    [id],
  );
  refresh();
}

export async function deleteRoom(formData: FormData): Promise<void> {
  await requireInnkeeper();
  const id = number(formData.get("roomId"));
  const requests = await queryOne<{ count: number }>(
    "select count(*)::int as count from stay_requests where room_id = $1",
    [id],
  );
  if ((requests?.count ?? 0) > 0) {
    redirect("/desk/rooms?error=That+room+has+stays+in+its+history.+Unlist+it+instead.");
  }
  const photos = await query<{ storage_key: string }>(
    "select storage_key from room_photos where room_id = $1",
    [id],
  );
  await execute("delete from rooms where id = $1", [id]);
  for (const photo of photos) {
    if (!photo.storage_key.startsWith("seed/")) await deleteObject(photo.storage_key);
  }
  refresh();
  redirect("/desk/rooms");
}

const MAX_PHOTO_BYTES = 12 * 1024 * 1024;
const MAX_PHOTOS_PER_UPLOAD = 6;

export async function uploadRoomPhotos(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireInnkeeper();
  await ensureDatabase();

  const roomId = number(formData.get("roomId"));
  const room = await queryOne<{ id: number; name: string }>(
    "select id, name from rooms where id = $1",
    [roomId],
  );
  if (!room) return { status: "error", message: "That room has gone." };

  const files = formData.getAll("photos").filter((entry): entry is File => entry instanceof File);
  const usable = files.filter((file) => file.size > 0);
  if (usable.length === 0) {
    return { status: "error", message: "Choose at least one photograph." };
  }
  if (usable.length > MAX_PHOTOS_PER_UPLOAD) {
    return { status: "error", message: `Up to ${MAX_PHOTOS_PER_UPLOAD} photographs at a time, please.` };
  }

  const created: number[] = [];
  for (const file of usable) {
    if (!file.type.startsWith("image/")) {
      return { status: "error", message: `${file.name} is not an image.` };
    }
    if (file.size > MAX_PHOTO_BYTES) {
      return { status: "error", message: `${file.name} is over 12MB. Please shrink it first.` };
    }
    let jpeg: Buffer;
    try {
      jpeg = await sharp(Buffer.from(await file.arrayBuffer()))
        .rotate()
        .resize({ width: 1800, height: 1800, fit: "inside", withoutEnlargement: true })
        .jpeg({ quality: 82, mozjpeg: true, progressive: true })
        .toBuffer();
    } catch {
      return { status: "error", message: `${file.name} could not be read as a photograph.` };
    }
    const key = `rooms/${room.id}/${randomUUID()}.jpg`;
    await putObject(key, jpeg, "image/jpeg");
    const inserted = await queryOne<{ id: number }>(
      `insert into room_photos (room_id, storage_key, alt, sort_order)
       values ($1,$2,$3,(select coalesce(max(sort_order), 0) + 1 from room_photos where room_id = $1))
       returning id`,
      [room.id, key, `${room.name}, photograph added by the innkeeper`],
    );
    if (inserted) created.push(inserted.id);
  }

  refresh();
  return {
    status: "success",
    message: `${created.length} photograph${created.length === 1 ? "" : "s"} added to ${room.name}.`,
  };
}

export async function deleteRoomPhoto(formData: FormData): Promise<void> {
  await requireInnkeeper();
  const id = number(formData.get("photoId"));
  const photo = await queryOne<{ storage_key: string }>(
    "select storage_key from room_photos where id = $1",
    [id],
  );
  if (!photo) return;
  await execute("delete from room_photos where id = $1", [id]);
  if (!photo.storage_key.startsWith("seed/")) await deleteObject(photo.storage_key);
  refresh();
}

export async function moveRoomPhoto(formData: FormData): Promise<void> {
  await requireInnkeeper();
  const id = number(formData.get("photoId"));
  const direction = text(formData.get("direction"), 8) === "up" ? -1 : 1;
  const photo = await queryOne<{ id: number; room_id: number; sort_order: number }>(
    "select id, room_id, sort_order from room_photos where id = $1",
    [id],
  );
  if (!photo) return;
  const neighbour = await queryOne<{ id: number; sort_order: number }>(
    direction < 0
      ? `select id, sort_order from room_photos where room_id = $1 and (sort_order < $2 or (sort_order = $2 and id < $3)) order by sort_order desc, id desc limit 1`
      : `select id, sort_order from room_photos where room_id = $1 and (sort_order > $2 or (sort_order = $2 and id > $3)) order by sort_order asc, id asc limit 1`,
    [photo.room_id, photo.sort_order, photo.id],
  );
  if (!neighbour) return;
  await execute("update room_photos set sort_order = $2 where id = $1", [photo.id, neighbour.sort_order]);
  await execute("update room_photos set sort_order = $2 where id = $1", [neighbour.id, photo.sort_order]);
  refresh();
}

export async function savePhotoAlt(formData: FormData): Promise<void> {
  await requireInnkeeper();
  const id = number(formData.get("photoId"));
  const alt = text(formData.get("alt"), 300);
  await execute("update room_photos set alt = $2 where id = $1", [id, alt]);
  refresh();
}

// ---------------------------------------------------------------------------
// Menus
// ---------------------------------------------------------------------------

export async function saveMenu(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireInnkeeper();
  await ensureDatabase();

  const parsed = menuSchema.safeParse({
    menuId: number(formData.get("menuId")),
    title: text(formData.get("title"), 120),
    intro: text(formData.get("intro"), 1200),
    isPublished: formData.get("isPublished") ? "on" : "off",
  });
  if (!parsed.success) {
    return { status: "error", message: "A few things need another look.", errors: zodErrors(parsed.error) };
  }

  await execute(
    "update menus set title = $2, intro = $3, is_published = $4, updated_at = now() where id = $1",
    [parsed.data.menuId, parsed.data.title, parsed.data.intro, parsed.data.isPublished === "on"],
  );

  for (const [key, value] of formData.entries()) {
    const match = key.match(/^item\.(\d+)\.(name|description|dietary|section)$/);
    if (!match || typeof value !== "string") continue;
    const [, itemId, field] = match;
    if (field === "dietary") {
      await execute("update menu_items set dietary = $2 where id = $1 and menu_id = $3", [
        Number(itemId),
        splitList(value),
        parsed.data.menuId,
      ]);
    } else {
      const column = field;
      await execute(`update menu_items set ${column} = $2 where id = $1 and menu_id = $3`, [
        Number(itemId),
        value.trim(),
        parsed.data.menuId,
      ]);
    }
  }

  refresh();
  return { status: "success", message: "Menu saved." };
}

export async function addMenuItem(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireInnkeeper();
  const parsed = menuItemSchema.safeParse({
    menuId: number(formData.get("menuId")),
    section: text(formData.get("section"), 60) || "Small things",
    name: text(formData.get("name"), 120),
    description: text(formData.get("description"), 400),
    dietary: text(formData.get("dietary"), 80),
  });
  if (!parsed.success) {
    return { status: "error", message: "Add a dish name at the very least.", errors: zodErrors(parsed.error) };
  }
  await execute(
    `insert into menu_items (menu_id, section, name, description, dietary, sort_order)
     values ($1,$2,$3,$4,$5,(select coalesce(max(sort_order), 0) + 1 from menu_items where menu_id = $1))`,
    [
      parsed.data.menuId,
      parsed.data.section,
      parsed.data.name,
      parsed.data.description,
      splitList(parsed.data.dietary),
    ],
  );
  refresh();
  return { status: "success", message: "Dish added." };
}

export async function deleteMenuItem(formData: FormData): Promise<void> {
  await requireInnkeeper();
  const id = number(formData.get("itemId"));
  await execute("delete from menu_items where id = $1", [id]);
  refresh();
}

// ---------------------------------------------------------------------------
// Guestbook
// ---------------------------------------------------------------------------

export async function moderateGuestbook(formData: FormData): Promise<void> {
  await requireInnkeeper();
  const id = number(formData.get("entryId"));
  const action = text(formData.get("moderation"), 20);
  const status =
    action === "approve"
      ? "approved"
      : action === "hide"
        ? "hidden"
        : action === "reject"
          ? "rejected"
          : "pending";
  await execute(
    `update guestbook_entries
        set status = $2,
            approved_at = case when $2 = 'approved' then now() else approved_at end
      where id = $1`,
    [id, status],
  );
  refresh();
}

export async function updateMenuItem(formData: FormData): Promise<void> {
  await requireInnkeeper();
  const id = number(formData.get("itemId"));
  const menuId = number(formData.get("menuId"));
  const name = text(formData.get("name"), 120);
  if (!id || !name) return;
  await execute(
    `update menu_items
        set section = $3, name = $4, description = $5, dietary = $6
      where id = $1 and menu_id = $2`,
    [
      id,
      menuId,
      text(formData.get("section"), 60) || "Small things",
      name,
      text(formData.get("description"), 400),
      splitList(text(formData.get("dietary"), 80)),
    ],
  );
  refresh();
}
