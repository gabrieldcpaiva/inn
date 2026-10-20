"use client";

import { useActionState } from "react";
import { decideRequest, reopenRequest } from "@/lib/actions/desk";
import { idleState } from "@/lib/validation";
import { FormMessage } from "@/components/booking/fields";
import { clsx } from "@/lib/clsx";

type Props = {
  requestId: number;
  reference: string;
  existingNote: string | null;
  status: "pending" | "confirmed" | "declined";
};

export function RequestDecision({ requestId, existingNote, status }: Omit<Props, "reference">) {
  const [state, action, pending] = useActionState(decideRequest, idleState);

  return (
    <form action={action} className="space-y-2.5">
      <input type="hidden" name="requestId" value={requestId} />
      <label className="block">
        <span className="field-label">
          {status === "pending" ? "A note for the guest" : "Amend the note"}
        </span>
        <textarea
          name="note"
          rows={3}
          defaultValue={existingNote ?? ""}
          className="field resize-y text-[13px]"
          placeholder={
            status === "pending"
              ? "Lovely — the room is yours. The porch light will be on."
              : "Update what you told the guest…"
          }
        />
      </label>
      <div className="flex flex-wrap gap-2">
        <button
          type="submit"
          name="decision"
          value="confirm"
          disabled={pending}
          className="btn btn-primary btn-sm flex-1"
        >
          {pending ? "Saving…" : status === "confirmed" ? "Save note" : "Confirm the stay"}
        </button>
        <button
          type="submit"
          name="decision"
          value="decline"
          disabled={pending}
          className={clsx(
            "btn btn-sm flex-1",
            status === "declined" ? "btn-primary" : "btn-ghost",
          )}
        >
          {status === "declined" ? "Save note" : "Decline"}
        </button>
      </div>
      <FormMessage status={state.status} message={state.message} />
    </form>
  );
}

export function ReopenRequest({ requestId, label = "Return to the post" }: { requestId: number; label?: string }) {
  return (
    <form action={reopenRequest}>
      <input type="hidden" name="requestId" value={requestId} />
      <input type="hidden" name="returnTo" value="/desk/requests" />
      <button
        type="submit"
        className="text-[10px] uppercase tracking-[0.14em] text-muted underline underline-offset-4 transition-colors hover:text-clay"
      >
        {label}
      </button>
    </form>
  );
}
