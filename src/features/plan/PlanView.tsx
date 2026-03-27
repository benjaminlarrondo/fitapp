import { useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import { Card } from "@/components/Card";
import { Pill } from "@/components/Pill";
import { getDefaultTemplateForType, getTemplatesByType, getSessionTemplate } from "@/lib/planning/templates";
import { sessionTypeLabel, sessionTypePanelClass, sessionTypePillTone, sessionTypeSurfaceClass } from "@/lib/ui/sessionAppearance";
import type { Session, SessionType } from "@/types/app";

type PlanViewProps = {
  sessions: Session[];
  selectedDate: string;
  onSelectDate: (date: string) => void;
  onUpdateStatus: (date: string, status: Session["status"]) => void;
  onUpdateTemplate: (date: string, templateId: string) => void;
};

const statusToneMap = {
  planned: "neutral",
  completed: "success",
  skipped: "danger",
  blocked: "neutral",
} as const;

const statusLabelMap: Record<Session["status"], string> = {
  planned: "planned",
  completed: "hecho",
  blocked: "rest",
  skipped: "sin actividad",
};

const weekdays = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

const typeBadgeMap = {
  crossfit: "CF",
  gym: "GYM",
  recovery: "REC",
  rest: "RST",
} as const;

const typeOptions: SessionType[] = ["crossfit", "gym", "recovery", "rest"];

const getMondayWeekStart = (date: dayjs.Dayjs) => {
  const offset = (date.day() + 6) % 7;
  return date.subtract(offset, "day");
};

const getNextCalendarStatus = (status: Session["status"]): Session["status"] => {
  if (status === "planned") return "completed";
  if (status === "completed") return "blocked";
  if (status === "blocked") return "skipped";
  return "planned";
};

const getCalendarCellClass = (session: Session, isSelected: boolean) => {
  if (session.status === "completed") {
    return isSelected ? "bg-success/24 border-success/55 text-ink" : "bg-success/14 border-success/35 text-ink";
  }

  if (session.status === "blocked") {
    return isSelected ? "bg-[#edf0ec] border-[#cfd7cf] text-ink" : "bg-[#f4f6f3] border-[#d9dfda] text-ink";
  }

  if (session.status === "skipped") {
    return isSelected ? "bg-rest/38 border-rest/55 text-[#7a4a56]" : "bg-rest/24 border-rest/40 text-[#7a4a56]";
  }

  return isSelected
    ? `${sessionTypePanelClass[session.type]}`
    : `${sessionTypeSurfaceClass[session.type]}`;
};

export const PlanView = ({
  sessions,
  selectedDate,
  onSelectDate,
  onUpdateStatus,
  onUpdateTemplate,
}: PlanViewProps) => {
  const [monthCursor, setMonthCursor] = useState(dayjs(selectedDate).startOf("month"));
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const selectedSession = sessions.find((session) => session.date === selectedDate);
  const sessionMap = useMemo(
    () => new Map(sessions.map((session) => [session.date, session])),
    [sessions],
  );
  const availableTemplates = useMemo(
    () => (selectedSession ? getTemplatesByType(selectedSession.type) : []),
    [selectedSession],
  );
  const gridStart = getMondayWeekStart(monthCursor.startOf("month"));
  const days = Array.from({ length: 42 }, (_, index) => gridStart.add(index, "day"));
  const compactWeekStart = getMondayWeekStart(dayjs(selectedDate));
  const compactWeekDays = Array.from({ length: 7 }, (_, index) => compactWeekStart.add(index, "day"));
  const upcoming = sessions
    .filter((session) => dayjs(session.date).isSame(dayjs(selectedDate)) || dayjs(session.date).isAfter(dayjs(selectedDate)))
    .slice(0, 8);

  useEffect(() => {
    setMonthCursor(dayjs(selectedDate).startOf("month"));
  }, [selectedDate]);

  return (
    <div className="space-y-2.5">
      <div className="grid gap-2.5 xl:grid-cols-[minmax(0,1.05fr)_minmax(300px,0.95fr)]">
        <Card
          title="Calendario"
          subtitle="Compacto, táctil y alineado a la secuencia del plan"
          action={
            <div className="flex items-center gap-1.5">
              <button
                className="rounded-2xl border border-line px-3 py-2 text-sm text-ink"
                onClick={() => setMonthCursor((current) => current.subtract(1, "month"))}
              >
                ←
              </button>
              <button
                className="rounded-2xl border border-line px-3 py-2 text-sm text-ink"
                onClick={() => setMonthCursor((current) => current.add(1, "month"))}
              >
                →
              </button>
              <button
                className="rounded-2xl bg-ink px-3 py-2 text-sm font-semibold text-white"
                onClick={() => setIsCalendarOpen((current) => !current)}
              >
                {isCalendarOpen ? "Ocultar mes" : "Ver mes"}
              </button>
            </div>
          }
        >
          <div className="mx-auto w-full max-w-[720px]">
            <div className="mb-2.5 flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-lg font-semibold capitalize tracking-[-0.02em] text-ink">
                {monthCursor.format("MMMM YYYY")}
              </h3>
              <div className="flex flex-wrap gap-2">
                <Pill tone="sky">día {selectedSession?.planDayNumber ?? "-"}</Pill>
                <Pill tone="neutral">click: hecho → rest → sin actividad</Pill>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-1 text-center text-[10px] uppercase tracking-[0.18em] text-muted">
              {weekdays.map((label) => (
                <span key={label} className="py-1">
                  {label}
                </span>
              ))}
            </div>
            <div className="mt-1.5 grid grid-cols-7 gap-1">
              {(isCalendarOpen ? days : compactWeekDays).map((day) => {
                const isoDate = day.format("YYYY-MM-DD");
                const session = sessionMap.get(isoDate);
                const isSelected = selectedDate === isoDate;
                const isCurrentMonth = day.month() === monthCursor.month();

                return (
                  <button
                    key={isoDate}
                    disabled={!session}
                    className={`aspect-[0.92] rounded-[14px] border p-1.5 text-left transition ${
                      session ? getCalendarCellClass(session, isSelected) : "border-line bg-white/75 text-ink"
                    } ${isCalendarOpen ? "min-h-[62px]" : "min-h-[66px]"} ${
                      !isCurrentMonth && isCalendarOpen ? "opacity-30" : ""
                    } ${!session ? "cursor-not-allowed" : ""}`}
                    onClick={() => {
                      if (!session) return;
                      onSelectDate(isoDate);
                      onUpdateStatus(isoDate, getNextCalendarStatus(session.status));
                    }}
                  >
                    <div className="flex h-full flex-col justify-between">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-semibold">{day.format("D")}</span>
                        {session ? (
                          <span className="text-[7px] font-semibold uppercase">
                            {typeBadgeMap[session.type]}
                          </span>
                        ) : null}
                      </div>
                      {session ? (
                        <div className="space-y-1">
                          <p className="text-[8px] font-semibold leading-none opacity-80">
                            D{session.cycleDay}
                          </p>
                          <div
                            className={`h-1 rounded-full ${
                              session.status === "completed"
                                ? "bg-success"
                                : session.status === "blocked"
                                  ? "bg-[#b9c4b8]"
                                  : session.status === "skipped"
                                    ? "bg-danger"
                                    : "bg-ink/25"
                            }`}
                          />
                        </div>
                      ) : null}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="mt-2.5 flex flex-wrap gap-2">
              <Pill tone="success">hecho</Pill>
              <Pill tone="neutral">rest</Pill>
              <Pill tone="danger">sin actividad</Pill>
              <Pill tone="crossfit">crossfit</Pill>
              <Pill tone="gym">gym</Pill>
              <Pill tone="recovery">recovery</Pill>
              <Pill tone="rest">descanso</Pill>
            </div>
          </div>
        </Card>

        <Card title="Día activo" subtitle={selectedSession ? dayjs(selectedSession.date).format("dddd D [de] MMMM") : "Selecciona una fecha"}>
          {selectedSession ? (
            <div className="space-y-3">
              <div className={`rounded-[22px] border p-3.5 ${sessionTypeSurfaceClass[selectedSession.type]}`}>
                <div className="flex flex-wrap items-center gap-2">
                  <Pill tone="sky">Día {selectedSession.planDayNumber}</Pill>
                  <Pill tone="sky">ciclo {selectedSession.cycleDay}/7</Pill>
                  <Pill tone={sessionTypePillTone[selectedSession.type]}>
                    {sessionTypeLabel[selectedSession.type]}
                  </Pill>
                  <Pill tone={statusToneMap[selectedSession.status]}>
                    {statusLabelMap[selectedSession.status]}
                  </Pill>
                  <Pill tone="neutral">
                    {Math.round(selectedSession.plannedIntensity * 100)}%
                  </Pill>
                </div>
                <p className="mt-2.5 text-[25px] font-semibold tracking-[-0.04em] text-ink sm:text-[27px]">{selectedSession.title}</p>
                <p className="mt-1.5 text-[13px] leading-5 text-muted sm:text-sm">{selectedSession.objective}</p>
              </div>

              <div>
                <p className="text-sm font-semibold text-ink">Tipo de día</p>
                <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {typeOptions.map((type) => (
                    <button
                      key={type}
                      className={`rounded-2xl px-3 py-2.5 text-sm font-semibold capitalize ${
                        selectedSession.type === type ? "bg-ink text-white" : "border border-line bg-white/85 text-ink"
                      }`}
                      onClick={() => onUpdateTemplate(selectedSession.date, getDefaultTemplateForType(type))}
                    >
                      {type === "crossfit" ? "Clase CF" : type}
                    </button>
                  ))}
                </div>
              </div>

              <label className="block">
                <span className="text-sm font-semibold text-ink">Plantilla del día</span>
                <select
                  className="mt-2 w-full rounded-2xl border border-line bg-white px-3 py-2.5"
                  value={selectedSession.templateId}
                  onChange={(event) => onUpdateTemplate(selectedSession.date, event.target.value)}
                >
                  {availableTemplates.map((template) => (
                    <option key={template.id} value={template.id}>
                      {template.title}
                    </option>
                  ))}
                </select>
              </label>

              <div className="flex flex-wrap gap-2">
                <button
                  className={`rounded-2xl px-4 py-2 text-sm font-semibold ${
                    selectedSession.status === "blocked" ? "bg-danger text-white" : "border border-line bg-white text-ink"
                  }`}
                  onClick={() =>
                    onUpdateStatus(
                      selectedSession.date,
                      selectedSession.status === "blocked" ? "planned" : "blocked",
                    )
                  }
                >
                  {selectedSession.status === "blocked" ? "Desbloquear" : "Bloquear día"}
                </button>
                <button
                  className="rounded-2xl border border-line bg-white px-4 py-2 text-sm font-semibold text-ink"
                  onClick={() => onUpdateStatus(selectedSession.date, "planned")}
                >
                  Resetear estado
                </button>
              </div>

              <div className="space-y-2 text-sm text-muted">
                {selectedSession.exercises.map((exercise) => (
                  <div
                    key={`${selectedSession.id}-${exercise.name}`}
                    className="rounded-[20px] border border-line bg-white/78 p-3"
                  >
                    <p className="font-semibold text-ink">{exercise.name}</p>
                    <p className="mt-1">
                      {exercise.sets} x {exercise.reps}
                      {exercise.weight ? ` @ ${exercise.weight} kg` : ""}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted">No hay una sesión planificada para esta fecha.</p>
          )}
        </Card>
      </div>

      <div className="grid gap-2.5 xl:grid-cols-[minmax(0,1.05fr)_minmax(300px,0.95fr)]">
        <Card title="Programación del día" subtitle="Ajusta el tipo y la plantilla sin romper la progresión">
          {selectedSession ? (
            <div className="space-y-2.5">
              <div className="rounded-[20px] border border-white/80 bg-[#f7faf7] p-3.5">
                <p className="text-[11px] uppercase tracking-[0.22em] text-muted">Resumen</p>
                <p className="mt-1.5 text-[15px] font-semibold text-ink">
                  {selectedSession.type === "crossfit"
                    ? "Clase de box con cargas controladas"
                    : selectedSession.type === "gym"
                      ? "Sesión estructurada para progresar fuerza"
                      : selectedSession.type === "recovery"
                        ? "Recuperación activa para sostener continuidad"
                        : "Descanso deliberado para absorber carga"}
                </p>
                <p className="mt-1 text-[13px] text-muted sm:text-sm">
                  El sistema mantiene la secuencia Día 1 → Día 7, pero puedes adaptar el tipo de estímulo según tu realidad.
                </p>
              </div>
              <div className="grid gap-2.5 sm:grid-cols-2">
                <div className="rounded-[20px] border border-gym/32 bg-gym/14 p-3.5">
                  <p className="text-sm font-semibold text-ink">Regla de carga</p>
                  <p className="mt-1 text-[13px] text-muted sm:text-sm">RPE &lt; 7 sube, 7-8 mantiene, &gt; 8.5 baja.</p>
                </div>
                <div className="rounded-[20px] border border-recovery/38 bg-recovery/20 p-3.5">
                  <p className="text-sm font-semibold text-ink">Regla de fatiga</p>
                  <p className="mt-1 text-[13px] text-muted sm:text-sm">Si llevas varios días duros o duermes poco, recovery gana prioridad.</p>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted">Selecciona una fecha para ver la lógica del día.</p>
          )}
        </Card>

        <Card title="Ruta cercana" subtitle="Próximos días de tu programación base">
          <div className="space-y-2.5">
            {upcoming.map((session) => (
              <button
                key={session.id}
                className={`flex w-full items-center justify-between rounded-[20px] border px-3.5 py-3 text-left ${
                  session.date === selectedDate
                    ? `${sessionTypePanelClass[session.type]} border-transparent`
                    : `${sessionTypeSurfaceClass[session.type]}`
                }`}
                onClick={() => onSelectDate(session.date)}
              >
                <div>
                  <p className="font-semibold">{dayjs(session.date).format("ddd D MMM YYYY")}</p>
                  <p className="text-sm opacity-80">
                    Día {session.planDayNumber} · {getSessionTemplate(session.templateId).title}
                  </p>
                </div>
                <Pill
                  tone={statusToneMap[session.status]}
                >
                  {statusLabelMap[session.status]}
                </Pill>
              </button>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};
