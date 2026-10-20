"use server";

import { randomInt } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ensureDatabase } from "@/lib/db/bootstrap";
import { query, queryOne } from "@/lib/db";
import {
  guestbookSchema,
  looksAutomated,
  number,
  stayRequestSchema,
  text,
  zodErrors,
  type ActionState,
} from "@/lib/validation";
import { getRoomById } from "@/lib/queries";
import { findConflicts } from "@/lib/availability";

const REFERENCE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function newReference(): string {
  let out = "LH-";
  for (let i = 0; i < 6; i += 1) out += REFERENCE_ALPHABET[randomInt(REFERENCE_ALPHABET.length)];
  return out;
}

async function uniqueReference(): Promise<string> {
  for (let attempt = 0; attempt < 6; attempt += 1) {
    const reference = newReference();
    const existing = await queryOne<{ id: number }>(
      "select id from stay_requests where reference = $1",
      [reference],
    );
    if (!existing) return reference;
  }
  return `LH-${Date.now().toString(36).toUpperCase().slice(-6)}`;
}

export async function submitStayRequest(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await ensureDatabase();

  // Bots fill in the hidden field; people never see it.
  if (looksAutomated(formData)) {
    return { status: "error", message: "Something in that form looked automated. Please try again." };
  }

  const parsed = stayRequestSchema.safeParse({
    roomId: number(formData.get("roomId")),
    guestName: text(formData.get("guestName"), 80),
    guestEmail: text(formData.get("guestEmail"), 160),
    guestPhone: text(formData.get("guestPhone"), 40),
    checkIn: text(formData.get("checkIn"), 10),
    checkOut: text(formData.get("checkOut"), 10),
    adults: number(formData.get("adults"), 2),
    children: number(formData.get("children"), 0),
    message: text(formData.get("message"), 1200),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "A few things need another look.",
      errors: zodErrors(parsed.error),
    };
  }

  const data = parsed.data;
  const room = await getRoomById(data.roomId);
  if (!room || !room.isListed) {
    return { status: "error", message: "That room isn’t available to request. Please pick another." };
  }

  const party = data.adults + data.children;
  if (party > room.capacity) {
    return {
      status: "error",
      message: `${room.name} sleeps ${room.capacity}. For ${party} guests, please choose a larger room or write to us.`,
      errors: { adults: `This room sleeps ${room.capacity}` },
    };
  }

  const { conflicts } = await findConflicts(data.checkIn, data.checkOut, [room], party);
  if (conflicts.length > 0) {
    return {
      status: "error",
      message:
        "Those dates have been taken while you were looking. Please choose another night or another room — nothing has been sent.",
      errors: { checkIn: "Dates no longer free" },
    };
  }

  const reference = await uniqueReference();
  await query(
    `insert into stay_requests
       (reference, room_id, guest_name, guest_email, guest_phone, check_in, check_out, adults, children, message)
     values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
    [
      reference,
      data.roomId,
      data.guestName,
      data.guestEmail,
      data.guestPhone,
      data.checkIn,
      data.checkOut,
      data.adults,
      data.children,
      data.message,
    ],
  );

  revalidatePath("/desk");
  revalidatePath("/desk/requests");
  revalidatePath("/rooms");
  redirect(`/stay/received/${reference}`);
}

export async function submitGuestbookEntry(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await ensureDatabase();
  if (looksAutomated(formData)) {
    return { status: "error", message: "Something in that form looked automated. Please try again." };
  }
  const parsed = guestbookSchema.safeParse({
    guestName: text(formData.get("guestName"), 80),
    location: text(formData.get("location"), 80),
    stayMonth: text(formData.get("stayMonth"), 40),
    message: text(formData.get("message"), 1200),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "A few things need another look.",
      errors: zodErrors(parsed.error),
    };
  }

  await query(
    `insert into guestbook_entries (guest_name, location, stay_month, message)
     values ($1,$2,$3,$4)`,
    [parsed.data.guestName, parsed.data.location, parsed.data.stayMonth, parsed.data.message],
  );

  revalidatePath("/guestbook");
  revalidatePath("/desk/guestbook");
  revalidatePath("/desk");
  return {
    status: "success",
    message:
      "Thank you — your note is with us. We read every one before it goes up, so it may take a day or two to appear.",
  };
}
