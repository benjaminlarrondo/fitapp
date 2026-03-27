import type { Exercise, Session, SessionStatus, SessionType, UserProfile } from "@/types/app";

type TemplateInput = {
  profile: UserProfile;
  intensity: number;
  date: string;
};

export type SessionTemplateDefinition = {
  id: string;
  type: SessionType;
  subtype: string;
  title: string;
  objective: string;
};

const roundToNearest = (value: number, step = 2.5) =>
  Math.max(step, Math.round(value / step) * step);

const loadFromOneRm = (oneRm: number, intensity: number) =>
  roundToNearest(oneRm * intensity);

export const sessionTemplates: SessionTemplateDefinition[] = [
  {
    id: "gym-full-body-reactivation",
    type: "gym",
    subtype: "full-body",
    title: "Gym Full Body Reactivación",
    objective: "Activar el cuerpo completo y recuperar patrón de fuerza sin exceso de fatiga.",
  },
  {
    id: "recovery-walk-mobility",
    type: "recovery",
    subtype: "walk",
    title: "Recovery Caminata + Movilidad",
    objective: "Bajar fatiga, mover articulaciones y sostener hábito.",
  },
  {
    id: "crossfit-class",
    type: "crossfit",
    subtype: "class",
    title: "Clase CrossFit Controlada",
    objective: "Volver al ritmo del box priorizando técnica y control de carga.",
  },
  {
    id: "gym-lower-reactivation",
    type: "gym",
    subtype: "lower",
    title: "Gym Lower Reactivación",
    objective: "Reactivar cadena posterior y pierna con cargas moderadas.",
  },
  {
    id: "recovery-optional",
    type: "recovery",
    subtype: "mobility",
    title: "Recovery / Descanso",
    objective: "Dejar un día bisagra para absorber carga y ajustar según sueño y energía.",
  },
  {
    id: "gym-upper-reactivation",
    type: "gym",
    subtype: "upper",
    title: "Gym Upper Reactivación",
    objective: "Recuperar empuje y tracción sin terminar destruido.",
  },
  {
    id: "crossfit-engine",
    type: "crossfit",
    subtype: "engine",
    title: "CrossFit Engine",
    objective: "Acumular trabajo cardiovascular y resistencia muscular con control.",
  },
  {
    id: "crossfit-technique",
    type: "crossfit",
    subtype: "technique",
    title: "CrossFit Técnica + Metcon",
    objective: "Practicar técnica y cerrar con metcon medido.",
  },
  {
    id: "gym-lower-strength",
    type: "gym",
    subtype: "lower",
    title: "Gym Lower",
    objective: "Empujar fuerza base de pierna y estabilidad.",
  },
  {
    id: "gym-upper-strength",
    type: "gym",
    subtype: "upper",
    title: "Gym Upper",
    objective: "Mejorar empuje, tracción y estabilidad escapular.",
  },
  {
    id: "gym-posterior-strength",
    type: "gym",
    subtype: "posterior",
    title: "Gym Posterior",
    objective: "Desarrollar cadena posterior y fuerza útil para CrossFit.",
  },
  {
    id: "gym-full-body-strength",
    type: "gym",
    subtype: "full-body",
    title: "Gym Full Body",
    objective: "Sesión mixta para mantener frecuencia sin saturar una zona.",
  },
  {
    id: "rest-total",
    type: "rest",
    subtype: "rest",
    title: "Descanso Total",
    objective: "Dormir, caminar suave y recuperar antes de la próxima carga.",
  },
];

const sessionTemplateMap = new Map(sessionTemplates.map((template) => [template.id, template]));

export const getSessionTemplate = (templateId: string) =>
  sessionTemplateMap.get(templateId) ?? sessionTemplateMap.get("gym-full-body-reactivation")!;

export const getTemplatesByType = (type: SessionType) =>
  sessionTemplates.filter((template) => template.type === type);

export const getDefaultTemplateForType = (type: SessionType) => {
  if (type === "crossfit") return "crossfit-class";
  if (type === "gym") return "gym-full-body-reactivation";
  if (type === "recovery") return "recovery-walk-mobility";
  return "rest-total";
};

export const buildExercises = (templateId: string, input: TemplateInput): Exercise[] => {
  const { profile, intensity } = input;

  switch (templateId) {
    case "gym-full-body-reactivation":
      return [
        { name: "Back Squat", sets: 4, reps: 8, weight: loadFromOneRm(profile.oneRM.backSquat, intensity) },
        { name: "Bench Press", sets: 4, reps: 8, weight: loadFromOneRm(profile.oneRM.benchPress, intensity) },
        { name: "Dumbbell Row", sets: 3, reps: 10, rpe: 6.5 },
        { name: "10 min AMRAP · 10 air squats / 10 push-ups / 200m trote", sets: 1, reps: 1, rpe: 6.5 },
        { name: "Plank", sets: 3, reps: 30 },
      ];
    case "gym-lower-reactivation":
      return [
        { name: "Deadlift", sets: 4, reps: 6, weight: loadFromOneRm(profile.oneRM.deadlift, intensity) },
        { name: "Lunges", sets: 3, reps: 10, rpe: 6.5 },
        { name: "Hip Thrust", sets: 3, reps: 10, rpe: 7 },
        { name: "Finisher · 3 rondas KB swings + sit-ups", sets: 3, reps: 10, rpe: 7 },
      ];
    case "gym-upper-reactivation":
      return [
        { name: "Bench Press", sets: 4, reps: 8, weight: loadFromOneRm(profile.oneRM.benchPress, intensity) },
        { name: "Pull Ups", sets: 4, reps: 6, rpe: 7 },
        { name: "Shoulder Press", sets: 3, reps: 10, rpe: 7 },
        { name: "8 min AMRAP · 5 burpees / 10 sit-ups", sets: 1, reps: 1, rpe: 7 },
      ];
    case "crossfit-class":
      return [
        { name: "Clase normal del box", sets: 1, reps: 1, rpe: 7 },
        { name: "Escalar cargas y volumen si el sueño o energía vienen bajos", sets: 1, reps: 1 },
        { name: "Post WOD · movilidad cadera + espalda", sets: 1, reps: 10 },
      ];
    case "crossfit-technique":
      return [
        { name: "Power Clean", sets: 6, reps: 2, weight: loadFromOneRm(profile.oneRM.clean, intensity * 0.82) },
        { name: "Front Rack Mobility", sets: 3, reps: 45 },
        { name: "10 min EMOM técnico", sets: 1, reps: 1, rpe: 7 },
      ];
    case "crossfit-engine":
      return [
        { name: "Row / Bike", sets: 1, reps: 20, rpe: 6.5 },
        { name: "Burpees", sets: 5, reps: 10, rpe: 7 },
        { name: "Box Step Overs", sets: 4, reps: 12, rpe: 6.5 },
      ];
    case "gym-lower-strength":
      return [
        { name: "Back Squat", sets: 5, reps: 5, weight: loadFromOneRm(profile.oneRM.backSquat, intensity) },
        { name: "Bulgarian Split Squat", sets: 3, reps: 8, rpe: 7.5 },
        { name: "Leg Curl", sets: 3, reps: 12, rpe: 7 },
      ];
    case "gym-upper-strength":
      return [
        { name: "Bench Press", sets: 4, reps: 6, weight: loadFromOneRm(profile.oneRM.benchPress, intensity) },
        { name: "Chest Supported Row", sets: 4, reps: 10, rpe: 7 },
        { name: "Pull-up or Lat Pulldown", sets: 3, reps: 8, rpe: 7.5 },
      ];
    case "gym-posterior-strength":
      return [
        { name: "Deadlift", sets: 4, reps: 4, weight: loadFromOneRm(profile.oneRM.deadlift, intensity) },
        { name: "Romanian Deadlift", sets: 3, reps: 8, rpe: 7.5 },
        { name: "Hip Thrust", sets: 3, reps: 10, rpe: 7 },
      ];
    case "gym-full-body-strength":
      return [
        { name: "Front Squat", sets: 3, reps: 5, weight: loadFromOneRm(profile.oneRM.frontSquat, intensity * 0.95) },
        { name: "Bench Press", sets: 3, reps: 8, weight: loadFromOneRm(profile.oneRM.benchPress, intensity * 0.92) },
        { name: "Seated Row", sets: 3, reps: 12, rpe: 7 },
      ];
    case "recovery-optional":
      return [
        { name: "Caminata opcional", sets: 1, reps: 20 },
        { name: "Movilidad general", sets: 1, reps: 10 },
      ];
    case "recovery-walk-mobility":
      return [
        { name: "Caminata", sets: 1, reps: 30 },
        { name: "Movilidad general", sets: 1, reps: 10 },
        { name: "Estiramientos", sets: 1, reps: 10 },
      ];
    default:
      return [{ name: "Total Rest", sets: 1, reps: 1 }];
  }
};

export const createSessionFromTemplate = ({
  date,
  planDayNumber,
  cycleDay,
  templateId,
  intensity,
  profile,
  existing,
}: {
  date: string;
  planDayNumber: number;
  cycleDay: number;
  templateId: string;
  intensity: number;
  profile: UserProfile;
  existing?: Partial<Session>;
}): Session => {
  const template = getSessionTemplate(templateId);
  const status = (existing?.status as SessionStatus | undefined) ?? "planned";

  return {
    id: existing?.id ?? `${date}-${templateId}`,
    date,
    planDayNumber: existing?.planDayNumber ?? planDayNumber,
    cycleDay: existing?.cycleDay ?? cycleDay,
    title: template.title,
    type: template.type,
    subtype: template.subtype,
    templateId: template.id,
    objective: template.objective,
    plannedIntensity: intensity,
    actualRPE: existing?.actualRPE,
    status,
    exercises: existing?.exercises?.length ? existing.exercises : buildExercises(template.id, { profile, intensity, date }),
    note: existing?.note,
  };
};
