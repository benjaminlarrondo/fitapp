import type { PropsWithChildren } from "react";

type PillProps = PropsWithChildren<{
  tone?: "neutral" | "success" | "warning" | "danger" | "accent" | "crossfit" | "gym" | "recovery" | "rest" | "sky";
  className?: string;
}>;

const toneMap: Record<NonNullable<PillProps["tone"]>, string> = {
  neutral: "bg-ink/6 text-ink",
  success: "bg-success/16 text-[#2e6154]",
  warning: "bg-warning/22 text-[#846118]",
  danger: "bg-danger/16 text-[#8a5160]",
  accent: "bg-accent/24 text-[#315846]",
  crossfit: "bg-crossfit/95 text-[#6a4923]",
  gym: "bg-gym/90 text-[#24584e]",
  recovery: "bg-recovery/95 text-[#536126]",
  rest: "bg-rest/90 text-[#844d5c]",
  sky: "bg-sky/85 text-[#35577c]",
};

export const Pill = ({ tone = "neutral", className = "", children }: PillProps) => (
  <span
    className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold tracking-[-0.01em] sm:text-xs ${toneMap[tone]} ${className}`}
  >
    {children}
  </span>
);
