import dayjs from "dayjs";
import { Card } from "@/components/Card";
import { Pill } from "@/components/Pill";
import { StatTile } from "@/components/StatTile";
import { sessionTypeLabel, sessionTypePillTone, sessionTypeSurfaceClass } from "@/lib/ui/sessionAppearance";
import type { DailyRecommendation, Session, WeeklyMetrics } from "@/types/app";

type DashboardViewProps = {
  date: string;
  trainingTime: string;
  session?: Session;
  recommendation: DailyRecommendation;
  weeklyMetrics: WeeklyMetrics;
  habitCompletion: number;
  streak: number;
  onJump: (tab: "session" | "habits" | "plan") => void;
};

const recommendationTone = {
  hard: "success",
  moderate: "accent",
  recovery: "warning",
  rest: "danger",
} as const;

export const DashboardView = ({
  date,
  trainingTime,
  session,
  recommendation,
  weeklyMetrics,
  habitCompletion,
  streak,
  onJump,
}: DashboardViewProps) => (
  <div className="space-y-2.5">
    <Card
      title="Hoy"
      subtitle={`${dayjs(date).format("dddd D [de] MMMM")} · rutina ${trainingTime}`}
      action={<Pill tone={recommendationTone[recommendation.kind]}>{recommendation.title}</Pill>}
      className="overflow-hidden"
    >
      <div className="grid gap-2.5 lg:grid-cols-[minmax(0,1.15fr)_minmax(240px,0.85fr)]">
        <div className={`rounded-[24px] border p-4 ${session ? sessionTypeSurfaceClass[session.type] : "border-white/80 bg-white/80"}`}>
          <div className="flex flex-wrap gap-2">
            <Pill tone={session ? sessionTypePillTone[session.type] : "neutral"}>
              {session ? sessionTypeLabel[session.type] : recommendation.suggestedSessionType}
            </Pill>
            <Pill tone="sky">intensidad {session ? Math.round(session.plannedIntensity * 100) : 0}%</Pill>
            <Pill tone="neutral">estado {session?.status ?? "pendiente"}</Pill>
          </div>
          <p className="mt-3 text-[26px] font-semibold leading-tight tracking-[-0.05em] text-ink sm:text-[30px]">
            {session ? session.title : "Aún no empieza el plan"}
          </p>
          <p className="mt-2 max-w-2xl text-[13px] leading-5 text-muted sm:text-sm">{recommendation.reason}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              className="rounded-2xl bg-ink px-3.5 py-2.5 text-sm font-semibold text-white"
              onClick={() => onJump("session")}
            >
              Registrar sesión
            </button>
            <button
              className="rounded-2xl border border-line bg-white/85 px-3.5 py-2.5 text-sm font-semibold text-ink"
              onClick={() => onJump("habits")}
            >
              Registrar hábitos
            </button>
          </div>
        </div>

        <div className="grid gap-2.5 sm:grid-cols-3 lg:grid-cols-1">
          <div className="rounded-[22px] border border-white/80 bg-[#f7faf7] p-3.5">
            <p className="text-[11px] uppercase tracking-[0.22em] text-muted">Checklist</p>
            <p className="mt-1.5 text-[26px] font-semibold tracking-[-0.04em] text-ink">
              {Math.round(habitCompletion * 100)}%
            </p>
            <p className="mt-1 text-[13px] text-muted sm:text-sm">Completa lo mínimo aunque el día quede bloqueado.</p>
          </div>
          <div className="rounded-[22px] border border-white/80 bg-[#f6faf8] p-3.5">
            <p className="text-[11px] uppercase tracking-[0.22em] text-muted">Lectura rápida</p>
            <p className="mt-1.5 text-[15px] font-semibold text-ink">
              {recommendation.kind === "hard"
                ? "Empuja con control"
                : recommendation.kind === "moderate"
                  ? "Suma una sesión útil"
                  : recommendation.kind === "recovery"
                    ? "Baja carga y recupera"
                    : "Descansa con intención"}
            </p>
            <p className="mt-1 text-[13px] text-muted sm:text-sm">La prioridad sigue siendo continuidad, no heroísmo.</p>
          </div>
          <div className="rounded-[22px] border border-white/80 bg-[#fbf7f5] p-3.5">
            <p className="text-[11px] uppercase tracking-[0.22em] text-muted">Ruta</p>
            <p className="mt-1.5 text-[15px] font-semibold text-ink">Plan flexible, secuencia progresiva</p>
            <button
              className="mt-2.5 rounded-2xl border border-line bg-white px-3 py-2 text-sm font-semibold text-ink"
              onClick={() => onJump("plan")}
            >
              Abrir calendario
            </button>
          </div>
        </div>
      </div>
    </Card>

    <div className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-4">
      <StatTile
        label="Fatiga"
        value={recommendation.fatigueScore.toFixed(1)}
        hint="0-10"
        tone={recommendation.fatigueScore >= 7.5 ? "danger" : recommendation.fatigueScore >= 6 ? "warning" : "success"}
      />
      <StatTile
        label="Carga 7d"
        value={recommendation.loadScore.toFixed(0)}
        hint="score acumulado"
        tone="sky"
      />
      <StatTile
        label="Adherencia"
        value={`${weeklyMetrics.adherence}%`}
        hint={`${weeklyMetrics.completed}/${weeklyMetrics.planned} sesiones`}
        tone={weeklyMetrics.adherence >= 70 ? "success" : "warning"}
      />
      <StatTile label="Streak" value={`${streak}d`} hint="hábitos >= 75%" tone="peach" />
    </div>

    <div className="grid gap-2.5 lg:grid-cols-[minmax(0,1fr)_minmax(240px,0.8fr)]">
      <Card title="Qué mantiene el día útil" subtitle="Reducimos pasos y dejamos solo lo importante">
        <div className="grid gap-2.5 sm:grid-cols-3">
          <div className="rounded-[20px] border border-gym/35 bg-gym/18 p-3.5">
            <p className="text-sm font-semibold text-ink">Registro mínimo</p>
            <p className="mt-1 text-[13px] text-muted sm:text-sm">Sueño, proteína, hidratación y movilidad sostienen la racha.</p>
          </div>
          <div className="rounded-[20px] border border-crossfit/35 bg-crossfit/18 p-3.5">
            <p className="text-sm font-semibold text-ink">Carga con criterio</p>
            <p className="mt-1 text-[13px] text-muted sm:text-sm">Si vienes cansado, una sesión moderada también cuenta.</p>
          </div>
          <div className="rounded-[20px] border border-recovery/40 bg-recovery/26 p-3.5">
            <p className="text-sm font-semibold text-ink">Recovery no es retroceso</p>
            <p className="mt-1 text-[13px] text-muted sm:text-sm">Cuando el cuerpo lo pide, recuperar protege la consistencia.</p>
          </div>
        </div>
      </Card>

      <Card title="Guardrails" subtitle="Pequeñas reglas que evitan pasarte">
        <div className="space-y-2.5 text-sm text-muted">
          <div className="rounded-[20px] bg-recovery/28 p-3.5">
            <p className="font-semibold text-ink">Máximo 2 días intensos seguidos</p>
            <p className="mt-1">Si acumulas 3 días, la app empuja recovery automáticamente.</p>
          </div>
          <div className="rounded-[20px] bg-rest/22 p-3.5">
            <p className="font-semibold text-ink">Bloquear no rompe el hábito</p>
            <p className="mt-1">Un día bloqueado sigue pidiendo check-in mínimo para no cortar la cadena.</p>
          </div>
        </div>
      </Card>
    </div>
  </div>
);
