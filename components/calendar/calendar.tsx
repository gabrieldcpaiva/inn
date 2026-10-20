"use client";

import { useMemo, useState } from "react";
import {
  addMonths,
  formatLong,
  monthGrid,
  monthLabel,
  parseISO,
  type ISODate,
} from "@/lib/dates";
import { clsx } from "@/lib/clsx";

export type DayStatus = "free" | "booked" | "blocked" | "pending";

export type Selection = {
  checkIn: ISODate | null;
  checkOut: ISODate | null;
};

type CalendarProps = {
  today: ISODate;
  getStatus: (iso: ISODate) => DayStatus;
  selection: Selection;
  onSelect: (iso: ISODate) => void;
  months?: 1 | 2;
  initialMonth?: { year: number; month: number };
  legend?: boolean;
  legendLabels?: { pending?: string };
};

const HATCH_BOOKED =
  "repeating-linear-gradient(135deg, rgba(43,69,52,0.16) 0px, rgba(43,69,52,0.16) 1px, transparent 1px, transparent 5px)";
const HATCH_BLOCKED =
  "repeating-linear-gradient(45deg, rgba(169,85,47,0.15) 0px, rgba(169,85,47,0.15) 1px, transparent 1px, transparent 5px)";

export function Calendar({
  today,
  getStatus,
  selection,
  onSelect,
  months = 1,
  initialMonth,
  legend = true,
  legendLabels,
}: CalendarProps) {
  const todayParts = parseISO(today);
  const [offset, setOffset] = useState(() => {
    if (!initialMonth) return 0;
    const monthsApart =
      (initialMonth.year - todayParts.year) * 12 + (initialMonth.month - todayParts.month);
    return Math.max(0, monthsApart);
  });
  const [hovered, setHovered] = useState<ISODate | null>(null);

  const base = useMemo(() => {
    const { year, month } = addMonthsMonth(today, offset);
    return { year, month };
  }, [today, offset]);

  const visible = useMemo(() => {
    const list: { year: number; month: number; weeks: ReturnType<typeof monthGrid> }[] = [];
    for (let i = 0; i < months; i += 1) {
      const cursor = addMonthsMonth(today, offset + i);
      list.push({
        ...cursor,
        weeks: monthGrid(cursor.year, cursor.month, today),
      });
    }
    return list;
  }, [today, offset, months]);

  const canGoBack =
    base.year > todayParts.year ||
    (base.year === todayParts.year && base.month > todayParts.month);

  const previewEnd =
    selection.checkIn && !selection.checkOut ? hovered : selection.checkOut;

  function rangeState(iso: ISODate): "start" | "end" | "between" | "preview" | null {
    const { checkIn, checkOut } = selection;
    if (checkIn && iso === checkIn) return "start";
    if (checkOut && iso === checkOut) return "end";
    if (checkIn && previewEnd && iso > checkIn && iso < previewEnd) {
      return checkOut ? "between" : "preview";
    }
    return null;
  }

  return (
    <div className="select-none">
      <div className="mb-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setOffset((value) => Math.max(0, value - 1))}
            disabled={!canGoBack}
            className="flex h-8 w-8 items-center justify-center border border-line text-ink transition-colors hover:border-ink disabled:opacity-30"
            aria-label="Earlier month"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M15 5l-7 7 7 7" stroke="currentColor" strokeWidth="1.6" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => setOffset((value) => value + 1)}
            className="flex h-8 w-8 items-center justify-center border border-line text-ink transition-colors hover:border-ink"
            aria-label="Later month"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M9 5l7 7-7 7" stroke="currentColor" strokeWidth="1.6" />
            </svg>
          </button>
        </div>
        <p className="text-[11px] uppercase tracking-[0.18em] text-muted" aria-live="polite">
          {formatSelectionHint(selection)}
        </p>
      </div>

      <div className={clsx("grid gap-8", months === 2 && "md:grid-cols-2")}>
        {visible.map((month, monthIndex) => (
          <div
            key={`${month.year}-${month.month}`}
            className={clsx(monthIndex > 0 && "hidden md:block")}
          >
            <div className="mb-2 flex items-baseline justify-between">
              <p className="display-sm">{monthLabel(month.year, month.month)}</p>
              {monthIndex === 0 && months === 2 ? (
                <span className="text-[10px] uppercase tracking-[0.16em] text-muted md:hidden">
                  {monthLabel(month.year, month.month)}
                </span>
              ) : null}
            </div>
            <div className="grid grid-cols-7 border-l border-t border-line-soft">
              {["M", "T", "W", "T", "F", "S", "S"].map((day, index) => (
                <div
                  key={`${day}-${index}`}
                  className="border-b border-r border-line-soft py-1.5 text-center text-[9.5px] font-semibold uppercase tracking-[0.12em] text-muted"
                >
                  {day}
                </div>
              ))}
              {month.weeks.flat().map((cell) => {
                const status = cell.inMonth ? getStatus(cell.iso) : "free";
                const disabled = !cell.inMonth || cell.isPast || status === "booked" || status === "blocked";
                const state = cell.inMonth ? rangeState(cell.iso) : null;
                const isEdge = state === "start" || state === "end";
                return (
                  <button
                    key={cell.iso}
                    type="button"
                    disabled={disabled}
                    onClick={() => onSelect(cell.iso)}
                    onMouseEnter={() => cell.inMonth && !disabled && setHovered(cell.iso)}
                    onMouseLeave={() => setHovered(null)}
                    aria-label={describeDay(cell.iso, status, cell.isPast)}
                    aria-pressed={isEdge}
                    className={clsx(
                      "relative aspect-square border-b border-r border-line-soft text-[0.82rem] tabular-nums transition-colors",
                      !cell.inMonth && "bg-transparent text-transparent",
                      cell.inMonth && cell.isPast && "cursor-default text-muted/35",
                      cell.inMonth && !cell.isPast && !disabled && "text-ink hover:bg-sage-pale/60",
                      status === "booked" && cell.inMonth && "cursor-not-allowed text-ink/40",
                      status === "blocked" && cell.inMonth && "cursor-not-allowed text-clay/60",
                      cell.inMonth && status === "pending" && !isEdge && "font-medium",
                      state === "between" && "bg-sage/25",
                      state === "preview" && "bg-sage/15",
                      isEdge && "bg-moss font-semibold text-parchment hover:bg-moss",
                    )}
                    style={
                      cell.inMonth && status === "booked" && !isEdge
                        ? { backgroundImage: HATCH_BOOKED }
                        : cell.inMonth && status === "blocked" && !isEdge
                          ? { backgroundImage: HATCH_BLOCKED }
                          : undefined
                    }
                  >
                    <span className="absolute inset-0 flex items-center justify-center">
                      {cell.day}
                    </span>
                    {cell.isToday && !isEdge ? (
                      <span className="absolute inset-x-1.5 bottom-1 h-px bg-clay" />
                    ) : null}
                    {cell.inMonth && status === "pending" && !isEdge ? (
                      <span className="absolute bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full border border-gold" />
                    ) : null}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {legend ? (
        <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-[11px] text-muted">
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-3 w-3 border border-line bg-parchment" /> Free
          </span>
          <span className="flex items-center gap-1.5">
            <span
              className="inline-block h-3 w-3 border border-line"
              style={{ backgroundImage: HATCH_BOOKED }}
            />
            Taken
          </span>
          <span className="flex items-center gap-1.5">
            <span
              className="inline-block h-3 w-3 border border-line"
              style={{ backgroundImage: HATCH_BLOCKED }}
            />
            Closed by the inn
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-3 w-3 rounded-full border border-gold" />
            {legendLabels?.pending ?? "Another party has asked"}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-3 w-3 bg-moss" /> Your stay
          </span>
        </div>
      ) : null}
    </div>
  );
}

function formatSelectionHint(selection: Selection): string {
  if (!selection.checkIn) return "Choose your first night";
  if (!selection.checkOut) return "Choose your last night";
  return "Dates chosen";
}

function describeDay(iso: ISODate, status: DayStatus, isPast: boolean): string {
  const date = formatLong(iso);
  if (isPast) return `${date}, in the past`;
  switch (status) {
    case "booked":
      return `${date}, taken`;
    case "blocked":
      return `${date}, closed`;
    case "pending":
      return `${date}, free — another party has asked for it`;
    default:
      return `${date}, free`;
  }
}

function addMonthsMonth(iso: ISODate, months: number): { year: number; month: number } {
  const { year, month } = parseISO(iso);
  const date = new Date(Date.UTC(year, month - 1 + months, 1));
  return { year: date.getUTCFullYear(), month: date.getUTCMonth() + 1 };
}
