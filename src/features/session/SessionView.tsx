import { Card } from "@/components/Card";
import { Pill } from "@/components/Pill";
import { getNextWeightSuggestion } from "@/lib/recommendations/daily";
import { sessionTypePillTone, sessionTypeSurfaceClass } from "@/lib/ui/sessionAppearance";
import type { DailyRecommendation, Session } from "@/types/app";

type SessionViewProps = {
  session?: Session;
  recommendation: DailyRecommendation;
  onUpdateStatus: (date: string, status: Session["status"]) => void;
  onUpdateField: (
    date: string,
    payload: Partial<Pick<Session, "actualRPE" | "note">>,
  ) => void;
  onUpdateExercise: (date: string, exerciseIndex: number, patch: Partial<Session["exercises"][number]>) => void;
};

const statusOptions: Session["status"][] = ["planned", "completed", "skipped", "blocked"];
const statusLabelMap: Record<Session["status"], string> = {
  planned: "planned",
  completed: "hecho",
  skipped: "sin actividad",
  blocked: "rest",
};

export const SessionView = ({
  session,
  recommendation,
  onUpdateStatus,
  onUpdateField,
  onUpdateExercise,
}: SessionViewProps) => {
  if (!session) {
    return (
      <Card title="Sesión" subtitle="Selecciona una fecha del plan para registrar la carga">
        <p className="text-sm text-muted">Aún no hay una sesión asociada a este día.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-2.5">
      <Card
        title="Sesión"
        subtitle={`${session.date} · Día ${session.planDayNumber} · ${session.title}`}
        action={<Pill tone={recommendation.kind === "hard" ? "success" : recommendation.kind === "recovery" ? "warning" : "neutral"}>{recommendation.title}</Pill>}
      >
        <div className="grid gap-2.5 lg:grid-cols-[minmax(0,1.05fr)_minmax(240px,0.95fr)]">
          <div className={`rounded-[22px] border p-4 text-sm text-muted ${sessionTypeSurfaceClass[session.type]}`}>
            <div className="flex flex-wrap gap-2">
              <Pill tone={sessionTypePillTone[session.type]}>{session.type}</Pill>
              <Pill tone="sky">{Math.round(session.plannedIntensity * 100)}%</Pill>
              <Pill tone="neutral">{statusLabelMap[session.status]}</Pill>
            </div>
            <p className="mt-3 text-[25px] font-semibold tracking-[-0.04em] text-ink sm:text-[27px]">{session.title}</p>
            <p className="mt-1.5 text-[13px] leading-5 sm:text-sm">{session.objective}</p>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              <button
                className="rounded-2xl bg-ink px-3.5 py-2.5 text-sm font-semibold text-white"
                onClick={() => onUpdateStatus(session.date, "completed")}
              >
                Marcar hecho
              </button>
              <button
                className="rounded-2xl border border-line bg-white/85 px-3.5 py-2.5 text-sm font-semibold text-ink"
                onClick={() => onUpdateStatus(session.date, "blocked")}
              >
                Pasar a rest
              </button>
            </div>
          </div>

            <div className="space-y-2.5">
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
                {statusOptions.map((status) => (
                  <button
                    key={status}
                    className={`rounded-[20px] px-3.5 py-2.5 text-left text-sm font-semibold capitalize ${
                      session.status === status ? "bg-ink text-white" : "border border-line bg-white/82 text-ink"
                    }`}
                  onClick={() => onUpdateStatus(session.date, status)}
                >
                  {statusLabelMap[status]}
                </button>
              ))}
            </div>
            <div className="rounded-[20px] border border-white/80 bg-[#f7faf7] p-3.5">
              <p className="text-[11px] uppercase tracking-[0.22em] text-muted">Guía rápida</p>
              <p className="mt-1.5 text-[13px] leading-5 text-muted sm:text-sm">
                Si RPE queda bajo, la próxima sesión puede subir. Si terminas pasado de esfuerzo o sueño bajo, baja carga y prioriza técnica.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-2.5 grid gap-2.5 md:grid-cols-3">
          <label className="rounded-[20px] border border-line bg-white/76 p-3.5">
            <span className="text-sm font-semibold text-ink">RPE real</span>
            <input
              type="number"
              min="1"
              max="10"
              step="0.5"
              value={session.actualRPE ?? ""}
              onChange={(event) =>
                onUpdateField(session.date, {
                  actualRPE: event.target.value ? Number(event.target.value) : undefined,
                })
              }
              className="mt-2.5 w-full rounded-2xl border border-line bg-white px-3 py-2"
            />
          </label>
          <label className="rounded-[20px] border border-line bg-white/76 p-3.5">
            <span className="text-sm font-semibold text-ink">Sueño (horas)</span>
            <input
              type="number"
              min="0"
              max="12"
              step="0.5"
              value={session.note?.sleepHours ?? ""}
              onChange={(event) =>
                onUpdateField(session.date, {
                  note: {
                    sleepHours: event.target.value ? Number(event.target.value) : undefined,
                  },
                })
              }
              className="mt-2.5 w-full rounded-2xl border border-line bg-white px-3 py-2"
            />
          </label>
          <label className="rounded-[20px] border border-line bg-white/76 p-3.5">
            <span className="text-sm font-semibold text-ink">Energía (1-10)</span>
            <input
              type="number"
              min="1"
              max="10"
              step="1"
              value={session.note?.energy ?? ""}
              onChange={(event) =>
                onUpdateField(session.date, {
                  note: {
                    energy: event.target.value ? Number(event.target.value) : undefined,
                  },
                })
              }
              className="mt-2.5 w-full rounded-2xl border border-line bg-white px-3 py-2"
            />
          </label>
        </div>
      </Card>

      <Card title="Ejercicios" subtitle="Puedes ajustar pesos y RPE por ejercicio">
        <div className="space-y-2.5">
          {session.exercises.map((exercise, index) => {
            const nextWeight = getNextWeightSuggestion(exercise.weight, session.actualRPE);

            return (
              <div key={`${session.id}-${exercise.name}`} className="rounded-[20px] border border-line bg-white/78 p-3.5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-ink">{exercise.name}</p>
                    <p className="text-sm text-muted">
                      {exercise.sets} x {exercise.reps}
                    </p>
                  </div>
                  {nextWeight ? <Pill tone="accent">próxima: {nextWeight} kg</Pill> : null}
                </div>
                <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
                  <label>
                    <span className="text-sm text-muted">Peso (kg)</span>
                    <input
                      type="number"
                      min="0"
                      step="2.5"
                      value={exercise.weight ?? ""}
                      onChange={(event) =>
                        onUpdateExercise(session.date, index, {
                          weight: event.target.value ? Number(event.target.value) : undefined,
                        })
                      }
                      className="mt-2 w-full rounded-2xl border border-line px-3 py-2"
                    />
                  </label>
                  <label>
                    <span className="text-sm text-muted">RPE ejercicio</span>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      step="0.5"
                      value={exercise.rpe ?? ""}
                      onChange={(event) =>
                        onUpdateExercise(session.date, index, {
                          rpe: event.target.value ? Number(event.target.value) : undefined,
                        })
                      }
                      className="mt-2 w-full rounded-2xl border border-line px-3 py-2"
                    />
                  </label>
                </div>
              </div>
            );
          })}
        </div>
        <label className="mt-3 block">
          <span className="text-sm font-semibold text-ink">Notas</span>
          <textarea
            value={session.note?.notes ?? ""}
            onChange={(event) =>
              onUpdateField(session.date, {
                note: {
                  notes: event.target.value,
                },
              })
            }
            rows={4}
            className="mt-2 w-full rounded-[22px] border border-line px-4 py-3"
            placeholder="Cómo se sintió la sesión, molestias, ajustes..."
          />
        </label>
      </Card>
    </div>
  );
};
