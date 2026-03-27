import { useEffect, useState } from "react";
import { Card } from "@/components/Card";
import { CloudSyncCard } from "@/features/settings/CloudSyncCard";
import type { CloudState, UserProfile } from "@/types/app";

type SettingsViewProps = {
  profile: UserProfile;
  cloud: CloudState;
  onSave: (
    patch: Partial<Omit<UserProfile, "constraints" | "oneRM">> & {
      constraints?: Partial<UserProfile["constraints"]>;
      oneRM?: Partial<UserProfile["oneRM"]>;
    },
  ) => void;
  onRequestMagicLink: (email: string) => Promise<void>;
  onSyncNow: () => Promise<void>;
  onSignOutCloud: () => Promise<void>;
};

export const SettingsView = ({
  profile,
  cloud,
  onSave,
  onRequestMagicLink,
  onSyncNow,
  onSignOutCloud,
}: SettingsViewProps) => {
  const [form, setForm] = useState({
    name: profile.name,
    age: String(profile.age),
    trainingTime: profile.trainingTime,
    programStartDate: profile.programStartDate,
    level: profile.level,
    goals: profile.goals.join("\n"),
    crossfitUntil: profile.constraints.crossfitUntil,
    crossfitDaysPerWeek: String(profile.constraints.crossfitDaysPerWeek),
    lifestyleFatigue: profile.constraints.lifestyleFatigue,
    backSquat: String(profile.oneRM.backSquat),
    deadlift: String(profile.oneRM.deadlift),
    frontSquat: String(profile.oneRM.frontSquat),
    clean: String(profile.oneRM.clean),
    benchPress: String(profile.oneRM.benchPress),
  });

  useEffect(() => {
    setForm({
      name: profile.name,
      age: String(profile.age),
      trainingTime: profile.trainingTime,
      programStartDate: profile.programStartDate,
      level: profile.level,
      goals: profile.goals.join("\n"),
      crossfitUntil: profile.constraints.crossfitUntil,
      crossfitDaysPerWeek: String(profile.constraints.crossfitDaysPerWeek),
      lifestyleFatigue: profile.constraints.lifestyleFatigue,
      backSquat: String(profile.oneRM.backSquat),
      deadlift: String(profile.oneRM.deadlift),
      frontSquat: String(profile.oneRM.frontSquat),
      clean: String(profile.oneRM.clean),
      benchPress: String(profile.oneRM.benchPress),
    });
  }, [profile]);

  return (
    <div className="space-y-4">
      <CloudSyncCard
        cloud={cloud}
        onRequestMagicLink={onRequestMagicLink}
        onSyncNow={onSyncNow}
        onSignOut={onSignOutCloud}
      />

      <Card title="Settings" subtitle="Editar perfil y regenerar automáticamente el plan">
        <div className="grid gap-4 md:grid-cols-2">
          <label>
            <span className="text-sm font-semibold text-ink">Nombre</span>
            <input
              className="mt-2 w-full rounded-2xl border border-line px-3 py-2"
              value={form.name}
              onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
            />
          </label>
          <label>
            <span className="text-sm font-semibold text-ink">Edad</span>
            <input
              type="number"
              className="mt-2 w-full rounded-2xl border border-line px-3 py-2"
              value={form.age}
              onChange={(event) => setForm((current) => ({ ...current, age: event.target.value }))}
            />
          </label>
          <label>
            <span className="text-sm font-semibold text-ink">Hora de entrenamiento</span>
            <input
              type="time"
              className="mt-2 w-full rounded-2xl border border-line px-3 py-2"
              value={form.trainingTime}
              onChange={(event) => setForm((current) => ({ ...current, trainingTime: event.target.value }))}
            />
          </label>
          <label>
            <span className="text-sm font-semibold text-ink">Inicio del programa</span>
            <input
              type="date"
              className="mt-2 w-full rounded-2xl border border-line px-3 py-2"
              value={form.programStartDate}
              onChange={(event) => setForm((current) => ({ ...current, programStartDate: event.target.value }))}
            />
          </label>
          <label>
            <span className="text-sm font-semibold text-ink">Nivel</span>
            <select
              className="mt-2 w-full rounded-2xl border border-line px-3 py-2"
              value={form.level}
              onChange={(event) =>
                setForm((current) => ({ ...current, level: event.target.value as UserProfile["level"] }))
              }
            >
              <option value="principiante">Principiante</option>
              <option value="intermedio">Intermedio</option>
              <option value="avanzado">Avanzado</option>
            </select>
          </label>
        </div>

        <label className="mt-4 block">
          <span className="text-sm font-semibold text-ink">Objetivos (uno por línea)</span>
          <textarea
            rows={4}
            className="mt-2 w-full rounded-3xl border border-line px-4 py-3"
            value={form.goals}
            onChange={(event) => setForm((current) => ({ ...current, goals: event.target.value }))}
          />
        </label>

        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <label>
            <span className="text-sm font-semibold text-ink">CrossFit hasta</span>
            <input
              type="date"
              className="mt-2 w-full rounded-2xl border border-line px-3 py-2"
              value={form.crossfitUntil}
              onChange={(event) => setForm((current) => ({ ...current, crossfitUntil: event.target.value }))}
            />
          </label>
          <label>
            <span className="text-sm font-semibold text-ink">CF por semana</span>
            <input
              type="number"
              min="0"
              max="7"
              className="mt-2 w-full rounded-2xl border border-line px-3 py-2"
              value={form.crossfitDaysPerWeek}
              onChange={(event) => setForm((current) => ({ ...current, crossfitDaysPerWeek: event.target.value }))}
            />
          </label>
          <label className="flex items-center gap-3 rounded-3xl border border-line bg-white/75 px-4 py-4">
            <input
              type="checkbox"
              checked={form.lifestyleFatigue}
              onChange={(event) => setForm((current) => ({ ...current, lifestyleFatigue: event.target.checked }))}
            />
            <span className="text-sm font-semibold text-ink">Fatiga lifestyle relevante</span>
          </label>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-5">
          {(
            [
              ["backSquat", "Back Squat"],
              ["deadlift", "Deadlift"],
              ["frontSquat", "Front Squat"],
              ["clean", "Clean"],
              ["benchPress", "Bench"],
            ] as const
          ).map(([key, label]) => (
            <label key={key}>
              <span className="text-sm font-semibold text-ink">{label}</span>
              <input
                type="number"
                className="mt-2 w-full rounded-2xl border border-line px-3 py-2"
                value={form[key]}
                onChange={(event) => setForm((current) => ({ ...current, [key]: event.target.value }))}
              />
            </label>
          ))}
        </div>

        <button
          className="mt-6 w-full rounded-2xl bg-ink px-4 py-3 text-sm font-semibold text-white"
          onClick={() =>
            onSave({
              name: form.name,
              age: Number(form.age),
              trainingTime: form.trainingTime,
              programStartDate: form.programStartDate,
              level: form.level,
              goals: form.goals.split("\n").map((goal) => goal.trim()).filter(Boolean),
              constraints: {
                crossfitUntil: form.crossfitUntil,
                crossfitDaysPerWeek: Number(form.crossfitDaysPerWeek),
                lifestyleFatigue: form.lifestyleFatigue,
              },
              oneRM: {
                backSquat: Number(form.backSquat),
                deadlift: Number(form.deadlift),
                frontSquat: Number(form.frontSquat),
                clean: Number(form.clean),
                benchPress: Number(form.benchPress),
              },
            })
          }
        >
          Guardar y regenerar plan
        </button>
      </Card>
    </div>
  );
};
