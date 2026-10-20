import type { Metadata } from "next";
import Link from "next/link";
import { queryOne } from "@/lib/db";
import { getRequests } from "@/lib/queries";
import { RequestCard } from "@/components/desk/request-card";
import { clsx } from "@/lib/clsx";
import type { RequestStatus } from "@/lib/types";

export const metadata: Metadata = { title: "Requests" };

type Tab = RequestStatus | "all";
const TABS: { key: Tab; label: string }[] = [
  { key: "pending", label: "To answer" },
  { key: "confirmed", label: "Confirmed" },
  { key: "declined", label: "Declined" },
  { key: "all", label: "Everything" },
];

export default async function RequestsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const query = await searchParams;
  const status = TABS.some((tab) => tab.key === query.status)
    ? (query.status as Tab)
    : "pending";

  const [requests, counts] = await Promise.all([
    getRequests({ status, limit: 120 }),
    Promise.all([
      queryOne<{ count: number }>("select count(*)::int as count from stay_requests where status = 'pending'"),
      queryOne<{ count: number }>("select count(*)::int as count from stay_requests where status = 'confirmed'"),
      queryOne<{ count: number }>("select count(*)::int as count from stay_requests where status = 'declined'"),
      queryOne<{ count: number }>("select count(*)::int as count from stay_requests"),
    ]),
  ]);

  const numbers: Record<Tab, number> = {
    pending: counts[0]?.count ?? 0,
    confirmed: counts[1]?.count ?? 0,
    declined: counts[2]?.count ?? 0,
    all: counts[3]?.count ?? 0,
  };

  return (
    <div className="mx-auto max-w-[1180px]">
      <header>
        <p className="label">The post</p>
        <h1 className="display-lg mt-2">Requests for a room.</h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-soft">
          Every request waits here until you answer it. Confirming holds the room in the book;
          declining leaves a note the guest can read. Nothing is charged either way.
        </p>
      </header>

      <nav className="mt-6 flex flex-wrap gap-2 border-b border-line pb-3" aria-label="Filter requests">
        {TABS.map((tab) => (
          <Link
            key={tab.key}
            href={tab.key === "pending" ? "/desk/requests" : `/desk/requests?status=${tab.key}`}
            className={clsx(
              "border px-3 py-1.5 text-[11.5px] transition-colors",
              status === tab.key
                ? "border-ink bg-ink text-paper"
                : "border-line text-ink-soft hover:border-ink",
            )}
            aria-current={status === tab.key ? "page" : undefined}
          >
            {tab.label}
            <span className={clsx("ml-1.5 text-[10px]", status === tab.key ? "text-paper/60" : "text-muted")}>
              {numbers[tab.key]}
            </span>
          </Link>
        ))}
      </nav>

      {requests.length === 0 ? (
        <div className="mt-6 border border-line bg-parchment p-8 text-center">
          <p className="font-display text-xl">
            {status === "pending" ? "Nothing waiting — the tray is empty." : "Nothing here yet."}
          </p>
          <p className="mt-1.5 text-sm text-ink-soft">
            {status === "pending"
              ? "New requests appear here the moment a guest sends one."
              : "Once you answer a request it will be filed here."}
          </p>
        </div>
      ) : (
        <div className="mt-5 grid gap-4 xl:grid-cols-2">
          {requests.map((request) => (
            <RequestCard key={request.id} request={request} />
          ))}
        </div>
      )}
    </div>
  );
}
