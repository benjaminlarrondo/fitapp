import dayjs from "dayjs";
import type { AppData, Habit, Session, WeeklyMetrics } from "@/types/app";

const isTrackedDay = (session: Session) => session.type !== "rest";

export const getHabitCompletion = (habit?: Habit) => {
  if (!habit) return 0;
  const values = [habit.sleep, habit.training, habit.nutrition, habit.hydration, habit.mobility];
  return values.filter(Boolean).length / values.length;
};

export const getWeeklyMetrics = (data: AppData, date: string): WeeklyMetrics => {
  const start = dayjs(date).startOf("week");
  const end = dayjs(date).endOf("week");
  const weekSessions = data.sessions.filter((session) => {
    const current = dayjs(session.date);
    return (current.isAfter(start) || current.isSame(start, "day")) && (current.isBefore(end) || current.isSame(end, "day"));
  });
  const planned = weekSessions.filter(isTrackedDay).length;
  const completed = weekSessions.filter((session) => session.status === "completed" && isTrackedDay(session)).length;
  const blocked = weekSessions.filter((session) => session.status === "blocked").length;
  const intenseDays = weekSessions.filter(
    (session) => (session.type === "crossfit" || session.type === "gym") && session.status === "completed",
  ).length;

  return {
    planned,
    completed,
    blocked,
    adherence: planned ? Number(((completed / planned) * 100).toFixed(0)) : 0,
    intenseDays,
  };
};

export const getCurrentStreak = (habits: Record<string, Habit>, today: string) => {
  let streak = 0;
  let cursor = dayjs(today);

  while (true) {
    const key = cursor.format("YYYY-MM-DD");
    const completion = getHabitCompletion(habits[key]);
    if (completion < 0.75) break;
    streak += 1;
    cursor = cursor.subtract(1, "day");
  }

  return streak;
};

export const getMonthlyFrequencyData = (sessions: Session[]) => {
  const summary = new Map<string, { label: string; completed: number; blocked: number; skipped: number }>();

  sessions.forEach((session) => {
    const month = dayjs(session.date).format("MMM");
    const current = summary.get(month) ?? { label: month, completed: 0, blocked: 0, skipped: 0 };

    if (session.status === "completed") current.completed += 1;
    if (session.status === "blocked") current.blocked += 1;
    if (session.status === "skipped") current.skipped += 1;

    summary.set(month, current);
  });

  return Array.from(summary.values());
};

export const getStrengthProgressData = (sessions: Session[]) => {
  return sessions
    .filter((session) => session.status === "completed")
    .map((session) => {
      const topLift = session.exercises.find((exercise) => Boolean(exercise.weight));
      return {
        date: dayjs(session.date).format("DD MMM"),
        load: topLift?.weight ?? 0,
        rpe: session.actualRPE ?? 0,
      };
    })
    .filter((point) => point.load > 0)
    .slice(-12);
};
