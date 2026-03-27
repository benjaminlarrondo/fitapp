export type TrainingLevel = "principiante" | "intermedio" | "avanzado";

export type SessionType = "crossfit" | "gym" | "recovery" | "rest";

export type SessionStatus = "planned" | "completed" | "skipped" | "blocked";

export type RecommendationKind = "hard" | "moderate" | "recovery" | "rest";

export type Exercise = {
  name: string;
  sets: number;
  reps: number;
  weight?: number;
  rpe?: number;
};

export type SessionNote = {
  energy?: number;
  sleepHours?: number;
  soreness?: number;
  notes?: string;
};

export type Session = {
  id: string;
  date: string;
  planDayNumber: number;
  cycleDay: number;
  title: string;
  type: SessionType;
  subtype: string;
  templateId: string;
  objective?: string;
  plannedIntensity: number;
  actualRPE?: number;
  status: SessionStatus;
  exercises: Exercise[];
  note?: SessionNote;
};

export type Habit = {
  date: string;
  sleep: boolean;
  training: boolean;
  nutrition: boolean;
  hydration: boolean;
  mobility: boolean;
};

export type UserProfile = {
  name: string;
  age: number;
  trainingTime: string;
  programStartDate: string;
  level: TrainingLevel;
  goals: string[];
  constraints: {
    crossfitUntil: string;
    crossfitDaysPerWeek: number;
    lifestyleFatigue: boolean;
  };
  oneRM: {
    backSquat: number;
    deadlift: number;
    frontSquat: number;
    clean: number;
    benchPress: number;
  };
};

export type AppData = {
  sessions: Session[];
  habits: Record<string, Habit>;
  profile: UserProfile;
  lastUpdatedAt: string;
};

export type DailyRecommendation = {
  kind: RecommendationKind;
  title: string;
  reason: string;
  fatigueScore: number;
  loadScore: number;
  suggestedSessionType: SessionType;
};

export type WeeklyMetrics = {
  planned: number;
  completed: number;
  blocked: number;
  adherence: number;
  intenseDays: number;
};

export type CloudState = {
  configured: boolean;
  mode: "idle" | "authenticating" | "syncing" | "ready" | "error";
  email: string | null;
  userId: string | null;
  lastSyncedAt?: string;
  error?: string;
};
