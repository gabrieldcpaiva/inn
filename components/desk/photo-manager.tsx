"use client";

import { useActionState } from "react";
import { uploadRoomPhotos } from "@/lib/actions/desk";
import { idleState } from "@/lib/validation";
import { FormMessage } from "@/components/booking/fields";

export function PhotoUpload({ roomId, storageLabel }: { roomId: number; storageLabel: string }) {
  const [state, action, pending] = useActionState(uploadRoomPhotos, idleState);

  return (
    <form action={action} className="border border-dashed border-line bg-paper/50 p-4">
      <input type="hidden" name="roomId" value={roomId} />
      <label className="block">
        <span className="field-label">Photographs</span>
        <input
          type="file"
          name="photos"
          accept="image/jpeg,image/png,image/webp,image/avif"
          multiple
          required
          className="block w-full text-[12px] file:mr-3 file:cursor-pointer file:border file:border-line file:bg-paper-deep/60 file:px-3 file:py-1.5 file:text-[10px] file:uppercase file:tracking-[0.12em] file:text-ink hover:file:border-ink"
        />
        <span className="field-hint">
          Up to six at a time, 12MB each. We resize and convert to JPEG automatically, then store
          them in {storageLabel}.
        </span>
      </label>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <button type="submit" disabled={pending} className="btn btn-outline btn-sm">
          {pending ? "Uploading…" : "Upload photographs"}
        </button>
        <div className="flex-1">
          <FormMessage status={state.status} message={state.message} />
        </div>
      </div>
    </form>
  );
}
