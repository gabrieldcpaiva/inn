"use client";

import { useActionState } from "react";
import { addMenuItem, saveMenu } from "@/lib/actions/desk";
import { idleState } from "@/lib/validation";
import { FormMessage } from "@/components/booking/fields";
import type { Menu } from "@/lib/types";

export function MenuDetailsForm({ menu }: { menu: Menu }) {
  const [state, action, pending] = useActionState(saveMenu, idleState);

  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="menuId" value={menu.id} />
      <label className="block">
        <span className="field-label">Title</span>
        <input name="title" defaultValue={menu.title} required className="field" />
      </label>
      <label className="block">
        <span className="field-label">Introduction</span>
        <textarea name="intro" rows={4} defaultValue={menu.intro} className="field resize-y text-[13px]" />
      </label>
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          name="isPublished"
          defaultChecked={menu.isPublished}
          className="h-4 w-4 accent-[#2b4534]"
        />
        <span className="text-[12px]">Published on the website</span>
      </label>
      <div className="flex flex-wrap items-center gap-3">
        <button type="submit" disabled={pending} className="btn btn-primary btn-sm">
          {pending ? "Saving…" : "Save the menu"}
        </button>
        <div className="flex-1">
          <FormMessage status={state.status} message={state.message} />
        </div>
      </div>
    </form>
  );
}

export function AddDishForm({ menuId, sections }: { menuId: number; sections: string[] }) {
  const [state, action, pending] = useActionState(addMenuItem, idleState);

  return (
    <form action={action} className="space-y-3 border border-line bg-paper/50 p-3">
      <input type="hidden" name="menuId" value={menuId} />
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="field-label">Dish</span>
          <input name="name" required className="field" placeholder="Roast pumpkin soup" />
        </label>
        <label className="block">
          <span className="field-label">Section</span>
          <input
            name="section"
            list={`sections-${menuId}`}
            defaultValue={sections[0] ?? "Small things"}
            className="field"
          />
          <datalist id={`sections-${menuId}`}>
            {sections.map((section) => (
              <option key={section} value={section} />
            ))}
          </datalist>
        </label>
      </div>
      <label className="block">
        <span className="field-label">Description</span>
        <input name="description" className="field" placeholder="Brown butter, sage, crème fraîche." />
      </label>
      <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
        <label className="block">
          <span className="field-label">Dietary codes</span>
          <input name="dietary" className="field" placeholder="v, gf" />
        </label>
        <button type="submit" disabled={pending} className="btn btn-outline btn-sm">
          {pending ? "Adding…" : "Add to the menu"}
        </button>
      </div>
      <FormMessage status={state.status} message={state.message} />
    </form>
  );
}
