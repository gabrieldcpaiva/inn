"use client";

import { deleteMenuItem } from "@/lib/actions/desk";

export function DeleteDishButton({ itemId, name }: { itemId: number; name: string }) {
  return (
    <button
      type="submit"
      formAction={deleteMenuItem}
      onClick={(event) => {
        if (!window.confirm(`Remove “${name}” from the menu?`)) event.preventDefault();
      }}
      className="text-[10px] uppercase tracking-[0.12em] text-clay underline underline-offset-4 hover:text-ink"
    >
      Remove
    </button>
  );
}
