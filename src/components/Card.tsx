import type { PropsWithChildren, ReactNode } from "react";

type CardProps = PropsWithChildren<{
  title?: string;
  subtitle?: string;
  action?: ReactNode;
  className?: string;
}>;

export const Card = ({ title, subtitle, action, className = "", children }: CardProps) => (
  <section
    className={`glass rounded-[26px] border border-white/75 bg-white/88 p-3.5 shadow-card sm:p-4 ${className}`}
  >
    {(title || subtitle || action) && (
      <div className="mb-3 flex flex-wrap items-start justify-between gap-2.5">
        <div className="min-w-0">
          {title ? <h2 className="text-[19px] font-semibold tracking-[-0.02em] text-ink">{title}</h2> : null}
          {subtitle ? <p className="mt-1 text-[13px] text-muted sm:text-sm">{subtitle}</p> : null}
        </div>
        {action}
      </div>
    )}
    {children}
  </section>
);
