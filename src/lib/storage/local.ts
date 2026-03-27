import dayjs from "dayjs";
import { createInitialData } from "@/data/defaults";
import { createSessionFromTemplate, getDefaultTemplateForType } from "@/lib/planning/templates";
import { getProgramStartDate } from "@/lib/planning/generateYearPlan";
import type { AppData } from "@/types/app";

const STORAGE_KEY = "fitness-tracker-app-data";

export const saveAppData = (data: AppData) => {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      ...data,
      lastUpdatedAt: dayjs().toISOString(),
    }),
  );
};

export const loadAppData = (): AppData => {
  if (typeof localStorage === "undefined") return createInitialData();
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return createInitialData();

  try {
    const parsed = JSON.parse(raw) as AppData;
    if (!parsed.profile || !Array.isArray(parsed.sessions)) {
      return createInitialData();
    }

    return {
      ...parsed,
      profile: {
        ...parsed.profile,
        programStartDate:
          parsed.profile.programStartDate ??
          parsed.sessions[0]?.date ??
          getProgramStartDate(),
      },
      habits: Object.fromEntries(
        Object.entries(parsed.habits ?? {}).map(([date, habit]) => [
          date,
          {
            ...habit,
            mobility: habit.mobility ?? false,
          },
        ]),
      ),
      sessions: parsed.sessions.map((session) =>
        createSessionFromTemplate({
          date: session.date,
          planDayNumber:
            session.planDayNumber ??
            dayjs(session.date).diff(
              dayjs(parsed.profile.programStartDate ?? parsed.sessions[0]?.date ?? getProgramStartDate()),
              "day",
            ) +
              1,
          cycleDay:
            session.cycleDay ??
            ((dayjs(session.date).diff(
              dayjs(parsed.profile.programStartDate ?? parsed.sessions[0]?.date ?? getProgramStartDate()),
              "day",
            ) %
              7) +
              7) %
              7 +
            1,
          templateId: session.templateId ?? getDefaultTemplateForType(session.type),
          intensity: session.plannedIntensity,
          profile: {
            ...parsed.profile,
            programStartDate:
              parsed.profile.programStartDate ??
              parsed.sessions[0]?.date ??
              getProgramStartDate(),
          },
          existing: session,
        }),
      ),
    };
  } catch (error) {
    console.error("Failed to parse local data", error);
    return createInitialData();
  }
};

export const exportJSON = (data: AppData) => JSON.stringify(data, null, 2);

export const importJSON = (raw: string): AppData => {
  const parsed = JSON.parse(raw) as AppData;
  if (!parsed.profile || !Array.isArray(parsed.sessions) || typeof parsed.habits !== "object") {
    throw new Error("Archivo JSON inválido");
  }

  const normalized = {
    ...parsed,
    profile: {
      ...parsed.profile,
      programStartDate:
        parsed.profile.programStartDate ??
        parsed.sessions[0]?.date ??
        getProgramStartDate(),
    },
    habits: Object.fromEntries(
      Object.entries(parsed.habits ?? {}).map(([date, habit]) => [
        date,
        {
          ...habit,
          mobility: habit.mobility ?? false,
        },
      ]),
    ),
    sessions: parsed.sessions.map((session) =>
      createSessionFromTemplate({
        date: session.date,
        planDayNumber:
          session.planDayNumber ??
          dayjs(session.date).diff(
            dayjs(parsed.profile.programStartDate ?? parsed.sessions[0]?.date ?? getProgramStartDate()),
            "day",
          ) +
            1,
        cycleDay:
          session.cycleDay ??
          ((dayjs(session.date).diff(
            dayjs(parsed.profile.programStartDate ?? parsed.sessions[0]?.date ?? getProgramStartDate()),
            "day",
          ) %
            7) +
            7) %
            7 +
          1,
        templateId: session.templateId ?? getDefaultTemplateForType(session.type),
        intensity: session.plannedIntensity,
        profile: {
          ...parsed.profile,
          programStartDate:
            parsed.profile.programStartDate ??
            parsed.sessions[0]?.date ??
            getProgramStartDate(),
        },
        existing: session,
      }),
    ),
  };

  saveAppData(normalized);
  return normalized;
};

export const reset = () => {
  const fresh = createInitialData();
  saveAppData(fresh);
  return fresh;
};
