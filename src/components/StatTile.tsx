type StatTileProps = {
  label: string;
  value: string;
  hint?: string;
  tone?: "neutral" | "success" | "warning" | "danger" | "sky" | "peach";
};

const toneMap: Record<NonNullable<StatTileProps["tone"]>, string> = {
  neutral: "bg-white/80",
  success: "bg-success/16",
  warning: "bg-warning/20",
  danger: "bg-danger/16",
  sky: "bg-sky/72",
  peach: "bg-peach/72",
};

export const StatTile = ({ label, value, hint, tone = "neutral" }: StatTileProps) => (
  <div className={`rounded-[22px] border border-white/75 p-3.5 ${toneMap[tone]}`}>
    <p className="text-[11px] uppercase tracking-[0.22em] text-muted">{label}</p>
    <p className="mt-1.5 text-[25px] font-semibold tracking-[-0.03em] text-ink sm:text-[27px]">{value}</p>
    {hint ? <p className="mt-1 text-[13px] text-muted sm:text-sm">{hint}</p> : null}
  </div>
);
