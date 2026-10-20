import { z } from "zod";
import { isValidISO, todayISO } from "@/lib/dates";

export type ActionState = {
  status: "idle" | "error" | "success";
  message?: string;
  errors?: Record<string, string>;
  reference?: string;
};

export const idleState: ActionState = { status: "idle" };

export function errorState(message: string, errors?: Record<string, string>): ActionState {
  return { status: "error", message, errors };
}

export function successState(message: string, reference?: string): ActionState {
  return { status: "success", message, reference };
}

export function zodErrors(error: z.ZodError): Record<string, string> {
  const result: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "form";
    if (!result[key]) result[key] = issue.message;
  }
  return result;
}

export function text(value: FormDataEntryValue | null, max = 5000): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

export function number(value: FormDataEntryValue | null, fallback = 0): number {
  const parsed = Number(text(value, 20));
  return Number.isFinite(parsed) ? parsed : fallback;
}

const isoDate = z
  .string()
  .refine((value) => isValidISO(value), "Choose a real date");

export const stayRequestSchema = z
  .object({
    roomId: z.coerce.number().int().positive("Choose a room"),
    guestName: z.string().trim().min(2, "Please tell us your name").max(80),
    guestEmail: z.string().trim().email("That email address doesn’t look right").max(160),
    guestPhone: z.string().trim().max(40).optional().default(""),
    checkIn: isoDate,
    checkOut: isoDate,
    adults: z.coerce.number().int().min(1, "At least one adult").max(12),
    children: z.coerce.number().int().min(0).max(12),
    message: z.string().trim().max(1200, "Please keep it under 1,200 characters").optional().default(""),
  })
  .refine((data) => data.checkOut > data.checkIn, {
    message: "The last night must be after the first",
    path: ["checkOut"],
  })
  .refine((data) => data.checkIn >= todayISO(), {
    message: "Please choose a date from today onwards",
    path: ["checkIn"],
  })
  .refine(
    (data) => {
      const nights =
        (Date.parse(`${data.checkOut}T00:00:00Z`) - Date.parse(`${data.checkIn}T00:00:00Z`)) /
        86_400_000;
      return nights <= 21;
    },
    { message: "For longer stays, please write to us directly", path: ["checkOut"] },
  );

export const guestbookSchema = z.object({
  guestName: z.string().trim().min(2, "Please add your name").max(80),
  location: z.string().trim().max(80).optional().default(""),
  stayMonth: z.string().trim().max(40).optional().default(""),
  message: z
    .string()
    .trim()
    .min(20, "A sentence or two, if you would — at least 20 characters")
    .max(1200, "Please keep it under 1,200 characters"),
});

export const signInSchema = z.object({
  email: z.string().trim().email("Enter the email address you sign in with"),
  password: z.string().min(1, "Enter your password"),
});

export const roomSchema = z.object({
  name: z.string().trim().min(2, "Give the room a name").max(80),
  slug: z
    .string()
    .trim()
    .min(2)
    .max(60)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lower-case letters, numbers and hyphens"),
  tagline: z.string().trim().max(180).optional().default(""),
  description: z.string().trim().max(4000).optional().default(""),
  capacity: z.coerce.number().int().min(1, "At least one guest").max(12),
  beds: z.string().trim().max(120).optional().default(""),
  sizeSqm: z.preprocess(
    (value) => (value === "" || value === undefined || value === null ? null : Number(value)),
    z.union([z.number().int().min(0).max(500), z.null()]),
  ),
  nightlyRate: z.coerce.number().int().min(0, "A rate of zero or more").max(5000),
  amenities: z.string().max(2000).optional().default(""),
  isListed: z.union([z.literal("on"), z.literal("off"), z.boolean()]).optional(),
});

export const blockSchema = z
  .object({
    roomId: z.coerce.number().int().positive("Choose a room"),
    startDate: isoDate,
    endDate: isoDate,
    reason: z.string().trim().max(200).optional().default(""),
  })
  .refine((data) => data.endDate > data.startDate, {
    message: "The end date must be after the start date",
    path: ["endDate"],
  });

export const decisionSchema = z.object({
  requestId: z.coerce.number().int().positive(),
  decision: z.enum(["confirm", "decline"]),
  note: z.string().trim().max(1000).optional().default(""),
});

export const menuSchema = z.object({
  menuId: z.coerce.number().int().positive(),
  title: z.string().trim().min(2, "Give the menu a title").max(120),
  intro: z.string().trim().max(1200).optional().default(""),
  isPublished: z.union([z.literal("on"), z.literal("off")]).optional(),
});

export const menuItemSchema = z.object({
  menuId: z.coerce.number().int().positive(),
  section: z.string().trim().min(1, "Add a section").max(60),
  name: z.string().trim().min(2, "Add a dish").max(120),
  description: z.string().trim().max(400).optional().default(""),
  dietary: z.string().trim().max(80).optional().default(""),
});

/** A hidden field only a bot would fill in. */
export function looksAutomated(formData: FormData): boolean {
  const trap = formData.get("company");
  return typeof trap === "string" && trap.trim().length > 0;
}

export function splitList(value: string): string[] {
  return value
    .split(/[,\n]/)
    .map((entry) => entry.trim())
    .filter(Boolean)
    .slice(0, 30);
}
