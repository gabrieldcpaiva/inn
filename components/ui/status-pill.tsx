import { clsx } from "@/lib/clsx";

const styles = {
  pending: "border-gold/50 bg-[#f6ecd6] text-[#7a5a1e]",
  confirmed: "border-moss/30 bg-sage-pale/70 text-moss",
  declined: "border-clay/30 bg-clay-pale/60 text-[#8a4326]",
  approved: "border-moss/30 bg-sage-pale/70 text-moss",
  hidden: "border-line bg-paper-deep/70 text-muted",
  rejected: "border-clay/30 bg-clay-pale/60 text-[#8a4326]",
} as const;

export type PillStatus = keyof typeof styles;

export function StatusPill({
  status,
  label,
  className,
}: {
  status: PillStatus;
  label?: string;
  className?: string;
}) {
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.12em]",
        styles[status],
        className,
      )}
    >
      <span className="status-dot bg-current" />
      {label ?? status}
    </span>
  );
}
