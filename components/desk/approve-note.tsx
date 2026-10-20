import { moderateGuestbook } from "@/lib/actions/desk";

export function ApproveNote({ entryId }: { entryId: number }) {
  return (
    <div className="mt-2 flex gap-3">
      <form action={moderateGuestbook}>
        <input type="hidden" name="entryId" value={entryId} />
        <input type="hidden" name="moderation" value="approve" />
        <button type="submit" className="btn btn-primary btn-sm">
          Approve
        </button>
      </form>
      <form action={moderateGuestbook}>
        <input type="hidden" name="entryId" value={entryId} />
        <input type="hidden" name="moderation" value="hide" />
        <button type="submit" className="btn btn-ghost btn-sm">
          Hide
        </button>
      </form>
    </div>
  );
}
