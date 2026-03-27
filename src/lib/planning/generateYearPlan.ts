import dayjs from "dayjs";
import { createSessionFromTemplate } from "@/lib/planning/templates";
import type { Session, UserProfile } from "@/types/app";

type Phase = "reactivation" | "base-strength" | "hybrid" | "consolidation";

type PhaseConfig = {
  phase: Phase;
  intensityMin: number;
  intensityMax: number;
  weeklyPattern: string[];
};

const reactivationPattern = [
  "gym-full-body-reactivation",
  "recovery-walk-mobility",
  "crossfit-class",
  "gym-lower-reactivation",
  "recovery-optional",
  "crossfit-class",
  "gym-upper-reactivation",
];

const baseStrengthPattern = [
  "gym-full-body-strength",
  "recovery-walk-mobility",
  "crossfit-class",
  "gym-lower-strength",
  "recovery-optional",
  "crossfit-technique",
  "crossfit-engine",
];

const hybridPattern = [
  "gym-full-body-strength",
  "rest-total",
  "crossfit-class",
  "gym-posterior-strength",
  "recovery-walk-mobility",
  "crossfit-technique",
  "crossfit-engine",
];

const consolidationPattern = [
  "gym-full-body-strength",
  "rest-total",
  "crossfit-class",
  "gym-upper-strength",
  "recovery-optional",
  "crossfit-engine",
  "recovery-walk-mobility",
];

export const getProgramStartDate = (fromDate?: string) => {
  const base = fromDate ? dayjs(fromDate).startOf("day") : dayjs().startOf("day");
  const saturday = 6;
  const currentDay = base.day();
  const daysUntilSaturday = (saturday - currentDay + 7) % 7 || 7;

  return base.add(daysUntilSaturday, "day").format("YYYY-MM-DD");
};

const getPhaseConfig = (date: string, startDate: string, profile: UserProfile): PhaseConfig => {
  const current = dayjs(date);
  const start = dayjs(startDate);
  const reactivationEnd = start.add(20, "day");
  const crossfitEnd = dayjs(profile.constraints.crossfitUntil);
  const hybridEnd = dayjs(`${current.year()}-08-31`);

  if (current.isSame(reactivationEnd) || current.isBefore(reactivationEnd)) {
    return {
      phase: "reactivation",
      intensityMin: 0.6,
      intensityMax: 0.7,
      weeklyPattern: reactivationPattern,
    };
  }

  if (current.isSame(crossfitEnd) || current.isBefore(crossfitEnd)) {
    return {
      phase: "base-strength",
      intensityMin: 0.7,
      intensityMax: 0.8,
      weeklyPattern: baseStrengthPattern,
    };
  }

  if (current.isSame(hybridEnd) || current.isBefore(hybridEnd)) {
    return {
      phase: "hybrid",
      intensityMin: 0.75,
      intensityMax: 0.85,
      weeklyPattern: hybridPattern,
    };
  }

  return {
    phase: "consolidation",
    intensityMin: 0.72,
    intensityMax: 0.82,
    weeklyPattern: consolidationPattern,
  };
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const getPhaseStart = (phase: Phase, startDate: string, profile: UserProfile, currentYear: number) => {
  if (phase === "reactivation") return dayjs(startDate);
  if (phase === "base-strength") return dayjs(startDate).add(21, "day");
  if (phase === "hybrid") return dayjs(profile.constraints.crossfitUntil).add(1, "day");
  return dayjs(`${currentYear}-09-01`);
};

const getIntensityForDay = (
  date: string,
  startDate: string,
  phase: Phase,
  min: number,
  max: number,
  profile: UserProfile,
) => {
  const phaseStart = getPhaseStart(phase, startDate, profile, dayjs(date).year());
  const weekIndex = Math.max(0, dayjs(date).diff(phaseStart, "week"));

  if (phase === "reactivation") {
    return clamp(Number((0.6 + weekIndex * 0.05).toFixed(2)), min, max);
  }

  const wave = weekIndex % 4;
  const waveFactor = [0, 0.33, 0.66, 0.2][wave] ?? 0;
  return clamp(Number((min + (max - min) * waveFactor).toFixed(2)), min, max);
};

const isIntenseTemplate = (templateId: string) =>
  templateId.startsWith("crossfit") || templateId.startsWith("gym");

export const generateYearPlan = (
  startDate: string,
  endDate: string,
  profile: UserProfile,
): Session[] => {
  const sessions: Session[] = [];
  let cursor = dayjs(startDate);
  const end = dayjs(endDate);
  let intenseStreak = 0;

  while (cursor.isSame(end) || cursor.isBefore(end)) {
    const date = cursor.format("YYYY-MM-DD");
    const phaseConfig = getPhaseConfig(date, startDate, profile);
    const dayIndex = dayjs(date).diff(dayjs(startDate), "day");
    const cycleDay = (dayIndex % 7) + 1;
    let templateId = phaseConfig.weeklyPattern[dayIndex % 7] ?? "recovery-walk-mobility";

    if (intenseStreak >= 2 && isIntenseTemplate(templateId)) {
      templateId = "recovery-walk-mobility";
    }

    const intensity = getIntensityForDay(
      date,
      startDate,
      phaseConfig.phase,
      phaseConfig.intensityMin,
      phaseConfig.intensityMax,
      profile,
    );

    const session = createSessionFromTemplate({
      date,
      planDayNumber: dayIndex + 1,
      cycleDay,
      templateId,
      intensity,
      profile,
    });

    sessions.push(session);
    intenseStreak = isIntenseTemplate(templateId) ? intenseStreak + 1 : 0;
    cursor = cursor.add(1, "day");
  }

  return sessions;
};
