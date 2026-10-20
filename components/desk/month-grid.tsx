import Link from "next/link";
import type { Occupancy, Room } from "@/lib/types";
import { addDays, formatLong, formatShort, type ISODate, WEEKDAYS } from "@/lib/dates";
import { clsx } from "@/lib/clsx";

type DeskMonthGridProps = {
  year: number;
  month: number;
  rooms: Room[];
  occupancy: Occupancy[];
};

type Cell = {
  kind: "confirmed" | "pending" | "blocked";
  label: string;
  detail: string;
  requestId?: number;
};

export function DeskMonthGrid({ year, month, rooms, occupancy }: DeskMonthGridProps) {
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const firstWeekday = (new Date(Date.UTC(year, month - 1, 1)).getUTCDay() + 6) % 7;
  const monthStart = `${year}-${String(month).padStart(2, "0")}-01`;

  const map = new Map<string, Cell>();
  for (const entry of occupancy) {
    for (let offset = 0; offset < 60; offset += 1) {
      const date = addDays(entry.from, offset);
      if (date >= entry.to) break;
      if (date < monthStart) continue;
      const parsed = Number(date.slice(5, 7));
      if (parsed !== month) break;
      const key = `${entry.roomId}:${date}`;
      const existing = map.get(key);
      const rank = entry.kind === "blocked" ? 3 : entry.kind === "confirmed" ? 2 : 1;
      const existingRank = existing ? (existing.kind === "blocked" ? 3 : existing.kind === "confirmed" ? 2 : 1) : 0;
      if (rank > existingRank) {
        map.set(key, {
          kind: entry.kind,
          label: entry.kind === "blocked" ? "Closed" : initials(entry.label.replace(/^Request · /, "")),
          detail: entry.detail,
          requestId: entry.requestId,
        });
      }
    }
  }

  return (
    <div className="overflow-x-auto border border-line bg-parchment">
      <table className="w-full min-w-[840px] border-collapse">
        <caption className="sr-only">
          Stays, requests and closed dates for each room, {monthName(month)} {year}
        </caption>
        <thead>
          <tr>
            <th className="sticky left-0 z-10 border-b border-r border-line bg-paper px-2 py-1.5 text-left text-[9px] uppercase tracking-[0.14em] text-muted">
              Room
            </th>
            {Array.from({ length: daysInMonth }, (_, index) => {
              const date = `${year}-${String(month).padStart(2, "0")}-${String(index + 1).padStart(2, "0")}`;
              const weekday = (((firstWeekday + index) % 7) + 7) % 7;
              return (
                <th
                  key={date}
                  className={clsx(
                    "border-b border-line px-0.5 py-1 text-center text-[9px] font-medium text-muted",
                    weekday >= 5 && "bg-paper-deep/50",
                  )}
                  title={formatLong(date)}
                >
                  <span className="block text-[8px] uppercase tracking-[0.08em] opacity-70">
                    {WEEKDAYS[weekday].slice(0, 1)}
                  </span>
                  {index + 1}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {rooms.map((room) => (
            <tr key={room.id}>
              <th className="sticky left-0 z-10 border-b border-r border-line bg-paper px-2 py-1.5 text-left align-middle">
                <span className="block text-[11.5px] font-medium leading-tight">{room.name}</span>
                {!room.isListed ? (
                  <span className="text-[8.5px] uppercase tracking-[0.1em] text-clay">unlisted</span>
                ) : null}
              </th>
              {Array.from({ length: daysInMonth }, (_, index) => {
                const date = `${year}-${String(month).padStart(2, "0")}-${String(index + 1).padStart(2, "0")}`;
                const cell = map.get(`${room.id}:${date}`);
                const freeHref = `?year=${year}&month=${month}&room=${room.slug}&date=${date}#close-dates`;
                const content = cell ? (
                  cell.kind === "confirmed" ? (
                    <span className="text-[8.5px] font-semibold leading-none text-parchment">
                      {cell.label}
                    </span>
                  ) : cell.kind === "pending" ? (
                    <span className="text-[9px] font-semibold text-[#8a6a24]">?</span>
                  ) : (
                    <span className="text-[8px] text-clay">✕</span>
                  )
                ) : null;
                return (
                  <td
                    key={date}
                    className={clsx(
                      "border-b border-l border-line-soft p-0 text-center",
                      cell?.kind === "confirmed" && "bg-moss",
                      cell?.kind === "pending" && "bg-[#f6ecd6]",
                      cell?.kind === "blocked" && "bg-clay-pale",
                    )}
                    title={`${formatLong(date)} · ${room.name}${
                      cell
                        ? ` · ${cell.kind === "confirmed" ? "stay" : cell.kind === "pending" ? "request" : "closed"} — ${cell.detail}`
                        : " · free"
                    }`}
                  >
                    <Link
                      href={
                        cell?.requestId
                          ? `/desk/requests${cell.kind === "pending" ? "" : "?status=confirmed"}#request-${cell.requestId}`
                          : cell?.kind === "blocked"
                            ? "#closed-dates"
                            : freeHref
                      }
                      className="flex h-7 w-full items-center justify-center hover:ring-1 hover:ring-inset hover:ring-ink/30"
                      aria-label={`${formatShort(date)}, ${room.name}, ${
                        cell
                          ? cell.kind === "confirmed"
                            ? "stay"
                            : cell.kind === "pending"
                              ? "request awaiting answer"
                              : "closed"
                          : "free — close these dates"
                      }`}
                    >
                      {content}
                    </Link>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function monthName(month: number): string {
  return ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"][month - 1];
}
