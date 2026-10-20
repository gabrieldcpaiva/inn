"use client";

import { useActionState } from "react";
import { submitGuestbookEntry } from "@/lib/actions/public";
import { FormMessage, TextField } from "@/components/booking/fields";
import { Honeypot } from "@/components/ui/honeypot";
import { idleState } from "@/lib/validation";

const MONTHS = [
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

export function GuestbookForm() {
  const [state, formAction, pending] = useActionState(submitGuestbookEntry, idleState);

  if (state.status === "success") {
    return (
      <div className="border border-moss/30 bg-sage-pale/40 p-6">
        <p className="label">Thank you</p>
        <p className="mt-2 font-display text-2xl leading-snug">
          Your note is on the hall table.
        </p>
        <p className="mt-2 max-w-md text-sm leading-relaxed text-ink-soft">
          {state.message}
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="card relative p-5 sm:p-6">
      <Honeypot />
      <p className="label">Add a note</p>
      <p className="mt-1.5 text-sm text-ink-soft">
        We read every entry before it goes up. Kind, honest, and no more than a few sentences —
        the way you’d write in a book by the door.
      </p>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <TextField
          label="Your name"
          name="guestName"
          required
          autoComplete="name"
          error={state.errors?.guestName}
        />
        <TextField
          label="Where you’re from"
          name="location"
          autoComplete="address-level2"
          placeholder="Settle, Manchester…"
        />
      </div>

      <label className="mt-4 block">
        <span className="field-label">When did you stay?</span>
        <select name="stayMonth" className="field cursor-pointer" defaultValue="">
          <option value="">Rather not say</option>
          {MONTHS.map((month) => (
            <option key={month} value={month}>
              {month}
            </option>
          ))}
          <option value="A few years ago">A few years ago</option>
        </select>
      </label>

      <label className="mt-4 block">
        <span className="field-label">Your note</span>
        <textarea
          name="message"
          rows={5}
          required
          className="field resize-y"
          placeholder="The fire was lit, the dog was welcome, the pie was enormous…"
          aria-invalid={state.errors?.message ? true : undefined}
        />
        {state.errors?.message ? (
          <span className="mt-1 block text-[11.5px] text-clay">{state.errors.message}</span>
        ) : null}
      </label>

      <div className="mt-4">
        <FormMessage status={state.status} message={state.message} />
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-[10.5px] text-muted">
          We only publish your first name, town and the month.
        </p>
        <button type="submit" disabled={pending} className="btn btn-primary">
          {pending ? "Sending…" : "Send to the innkeeper"}
        </button>
      </div>
    </form>
  );
}
