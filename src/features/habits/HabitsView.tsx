import { Card } from "@/components/Card";
import { Pill } from "@/components/Pill";
import type { Habit, Session } from "@/types/app";

type HabitKey = "sleep" | "training" | "nutrition" | "hydration" | "mobility";

type HabitsViewProps = {
  date: string;
  habit: Habit;
  streak: number;
  session?: Session;
  onToggleHabit: (date: string, key: HabitKey) => void;
};

const habitLabels: Record<HabitKey, { title: string; hint: string }> = {
  sleep: { title: "Dormí ≥ 7h", hint: "Marca si el descanso fue suficiente o de calidad." },
  training: { title: "Entrené / me moví", hint: "Se activa solo al completar sesión, pero puedes usarlo en recovery suave." },
  nutrition: { title: "Proteína cumplida", hint: "Prioriza proteína y estructura mínima del día." },
  hydration: { title: "Hidratación", hint: "Agua suficiente antes de que pegue la fatiga." },
  mobility: { title: "Movilidad", hint: "Aunque el día se complique, intenta mover al menos 5 a 10 minutos." },
};

export const HabitsView = ({ date, habit, streak, session, onToggleHabit }: HabitsViewProps) => {
  const completion = [habit.sleep, habit.training, habit.nutrition, habit.hydration, habit.mobility].filter(Boolean).length;

  return (
    <div className="space-y-4">
      <Card
        title="Checklist diario"
        subtitle={`${date} · obligatorio incluso si el día está bloqueado`}
        action={<Pill tone={completion >= 4 ? "success" : "warning"}>{completion}/5</Pill>}
      >
        <div className="grid gap-3">
          {(Object.keys(habitLabels) as HabitKey[]).map((key) => (
            <button
              key={key}
              className={`rounded-[24px] border p-4 text-left ${
                habit[key] ? "border-success bg-success/10" : "border-line bg-white/70"
              }`}
              onClick={() => onToggleHabit(date, key)}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-ink">{habitLabels[key].title}</p>
                  <p className="mt-1 text-sm text-muted">{habitLabels[key].hint}</p>
                </div>
                <span className={`mt-1 h-6 w-6 rounded-full border ${habit[key] ? "border-success bg-success" : "border-line bg-white"}`} />
              </div>
            </button>
          ))}
        </div>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card title="Continuidad" subtitle="Lo que más importa ahora es sostener ritmo">
          <div className="rounded-[24px] bg-ink p-5 text-white">
            <p className="text-sm uppercase tracking-[0.18em] text-white/60">Streak actual</p>
            <p className="mt-2 text-5xl font-semibold">{streak}</p>
            <p className="mt-2 text-sm text-white/75">días con 75% o más del checklist</p>
          </div>
        </Card>
        <Card title="Regla del día" subtitle="Contexto del plan">
          <div className="space-y-3 text-sm text-muted">
            <div className="rounded-3xl bg-warning/10 p-4">
              <p className="font-semibold text-ink">
                {session?.status === "blocked" ? "Día bloqueado" : "Día activo"}
              </p>
              <p className="mt-1">
                {session?.status === "blocked"
                  ? "No se exige entreno intenso, pero sí cerrar el mínimo viable de hábitos."
                  : "Completar hábitos hace más estable la recuperación y la adherencia."}
              </p>
            </div>
            <div className="rounded-3xl bg-white/70 p-4">
              <p className="font-semibold text-ink">Meta práctica</p>
              <p className="mt-1">Si el día se rompe, intenta salvar al menos sueño, agua y nutrición.</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
