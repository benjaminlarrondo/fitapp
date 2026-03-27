import dayjs from "dayjs";
import type { AppData, DailyRecommendation, Session } from "@/types/app";

const isIntense = (session: Session) => session.type === "crossfit" || session.type === "gym";

const average = (values: number[]) =>
  values.length ? values.reduce((acc, value) => acc + value, 0) / values.length : 0;

export const getFatigueScore = (data: AppData, date: string) => {
  const lastSevenDays = data.sessions.filter((session) => {
    const diff = dayjs(date).diff(dayjs(session.date), "day");
    return diff >= 0 && diff < 7;
  });

  const intenseDays = lastSevenDays.filter((session) => isIntense(session) && session.status === "completed").length;
  const avgRpe = average(lastSevenDays.map((session) => session.actualRPE ?? session.plannedIntensity * 10));
  const todayHabit = data.habits[date];
  const sleepPenalty = todayHabit?.sleep ? 0 : 1.4;
  const nutritionPenalty = todayHabit?.nutrition ? 0 : 0.8;
  const hydrationPenalty = todayHabit?.hydration ? 0 : 0.6;
  const mobilityPenalty = todayHabit?.mobility ? 0 : 0.4;
  const fatigueLifestylePenalty = data.profile.constraints.lifestyleFatigue ? 1 : 0;

  return Number(
    Math.min(
      10,
      intenseDays * 1.2 +
        avgRpe * 0.35 +
        sleepPenalty +
        nutritionPenalty +
        hydrationPenalty +
        mobilityPenalty +
        fatigueLifestylePenalty,
    ).toFixed(1),
  );
};

export const getLoadScore = (data: AppData, date: string) => {
  const lastSevenDays = data.sessions.filter((session) => {
    const diff = dayjs(date).diff(dayjs(session.date), "day");
    return diff >= 0 && diff < 7;
  });

  return Number(
    lastSevenDays.reduce((acc, session) => {
      const sessionLoad = (session.actualRPE ?? session.plannedIntensity * 10) * (isIntense(session) ? 1.2 : 0.6);
      return acc + sessionLoad;
    }, 0).toFixed(1),
  );
};

const countConsecutiveIntenseDays = (sessions: Session[], date: string) => {
  let streak = 0;
  let cursor = dayjs(date).subtract(1, "day");

  while (streak < 4) {
    const previous = sessions.find((session) => session.date === cursor.format("YYYY-MM-DD"));
    if (!previous || previous.status !== "completed" || !isIntense(previous)) break;

    streak += 1;
    cursor = cursor.subtract(1, "day");
  }

  return streak;
};

export const getDailyRecommendation = (data: AppData, date: string): DailyRecommendation => {
  const session = data.sessions.find((entry) => entry.date === date);
  const fatigueScore = getFatigueScore(data, date);
  const loadScore = getLoadScore(data, date);
  const consecutiveIntense = countConsecutiveIntenseDays(data.sessions, date);
  const completedLastSeven = data.sessions.filter((entry) => {
    const diff = dayjs(date).diff(dayjs(entry.date), "day");
    return diff >= 0 && diff < 7 && entry.status === "completed";
  }).length;
  const skippedLastThree = data.sessions.filter((entry) => {
    const diff = dayjs(date).diff(dayjs(entry.date), "day");
    return diff > 0 && diff <= 3 && entry.status !== "completed" && entry.type !== "rest";
  }).length;

  if (session?.status === "blocked") {
    return {
      kind: "recovery",
      title: "Día bloqueado, mantén el mínimo viable",
      reason: "Prioriza movilidad suave, caminata y registrar hábitos para sostener la adherencia.",
      fatigueScore,
      loadScore,
      suggestedSessionType: "recovery",
    };
  }

  if (fatigueScore >= 7.5 || consecutiveIntense >= 2) {
    return {
      kind: "recovery",
      title: "Recovery recomendado",
      reason: "La fatiga acumulada y la secuencia reciente sugieren bajar carga para proteger adherencia y articulaciones.",
      fatigueScore,
      loadScore,
      suggestedSessionType: "recovery",
    };
  }

  if (skippedLastThree >= 2) {
    return {
      kind: "moderate",
      title: "Reinicio progresivo",
      reason: "Hubo varios días sin entrenar. Conviene retomar con una sesión moderada y técnica.",
      fatigueScore,
      loadScore,
      suggestedSessionType: session?.type === "rest" ? "recovery" : session?.type ?? "gym",
    };
  }

  if (completedLastSeven >= 4 && fatigueScore < 6.5) {
    return {
      kind: "hard",
      title: "Día fuerte viable",
      reason: "La carga viene bien tolerada y el patrón reciente permite empujar con control.",
      fatigueScore,
      loadScore,
      suggestedSessionType: session?.type === "recovery" ? "gym" : session?.type ?? "crossfit",
    };
  }

  if (session?.type === "rest") {
    return {
      kind: "rest",
      title: "Descanso con intención",
      reason: "Usa el día para dormir mejor, caminar suave y cerrar hábitos.",
      fatigueScore,
      loadScore,
      suggestedSessionType: "rest",
    };
  }

  return {
    kind: "moderate",
    title: "Sesión moderada",
    reason: "La mejor apuesta es mantener consistencia con intensidad media y técnica limpia.",
    fatigueScore,
    loadScore,
    suggestedSessionType: session?.type ?? "gym",
  };
};

export const getNextWeightSuggestion = (
  weight: number | undefined,
  actualRPE: number | undefined,
) => {
  if (!weight || !actualRPE) return undefined;
  if (actualRPE < 7) return weight + 2.5;
  if (actualRPE <= 8) return weight;
  if (actualRPE > 8.5) return Math.max(0, weight - 2.5);

  return weight;
};
