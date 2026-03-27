import dayjs from "dayjs";
import type { AppData, Habit, UserProfile } from "@/types/app";
import { generateYearPlan, getProgramStartDate } from "@/lib/planning/generateYearPlan";

export const createDefaultUserProfile = (programStartDate: string): UserProfile => ({
  name: "Benja",
  age: 38,
  trainingTime: "06:00",
  programStartDate,
  level: "intermedio",
  goals: [
    "retomar entrenamiento",
    "bajar grasa",
    "recuperar fuerza",
    "recomposición corporal",
  ],
  constraints: {
    crossfitUntil: "2026-05-10",
    crossfitDaysPerWeek: 3,
    lifestyleFatigue: true,
  },
  oneRM: {
    backSquat: 160,
    deadlift: 165,
    frontSquat: 140,
    clean: 90,
    benchPress: 60,
  },
});

export const createEmptyHabit = (date: string): Habit => ({
  date,
  sleep: false,
  training: false,
  nutrition: false,
  hydration: false,
  mobility: false,
});

export const createInitialData = (today = dayjs().format("YYYY-MM-DD")): AppData => {
  const startDate = getProgramStartDate(today);
  const profile = createDefaultUserProfile(startDate);
  const endDate = dayjs(`${dayjs(today).year()}-12-31`).format("YYYY-MM-DD");

  return {
    profile,
    sessions: generateYearPlan(startDate, endDate, profile),
    habits: {},
    lastUpdatedAt: dayjs().toISOString(),
  };
};
