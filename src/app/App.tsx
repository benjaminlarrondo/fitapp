import { Suspense, lazy, useEffect } from "react";
import dayjs from "dayjs";
import "dayjs/locale/es";
import { BottomNav } from "@/components/BottomNav";
import { Card } from "@/components/Card";
import { Pill } from "@/components/Pill";
import { SaveStatusBar } from "@/components/SaveStatusBar";
import { useAppStore } from "@/app/store";
import { createEmptyHabit } from "@/data/defaults";
import { getCurrentStreak, getHabitCompletion, getWeeklyMetrics } from "@/lib/analytics/metrics";
import { getDailyRecommendation } from "@/lib/recommendations/daily";
import { sessionTypeLabel, sessionTypePillTone } from "@/lib/ui/sessionAppearance";

dayjs.locale("es");

const statusLabelMap = {
  planned: "planned",
  completed: "hecho",
  blocked: "rest",
  skipped: "sin actividad",
} as const;

const DashboardView = lazy(() =>
  import("@/features/dashboard/DashboardView").then((module) => ({ default: module.DashboardView })),
);
const PlanView = lazy(() =>
  import("@/features/plan/PlanView").then((module) => ({ default: module.PlanView })),
);
const SessionView = lazy(() =>
  import("@/features/session/SessionView").then((module) => ({ default: module.SessionView })),
);
const HabitsView = lazy(() =>
  import("@/features/habits/HabitsView").then((module) => ({ default: module.HabitsView })),
);
const ProgressView = lazy(() =>
  import("@/features/progress/ProgressView").then((module) => ({ default: module.ProgressView })),
);
const SettingsView = lazy(() =>
  import("@/features/settings/SettingsView").then((module) => ({ default: module.SettingsView })),
);
const BackupView = lazy(() =>
  import("@/features/backup/BackupView").then((module) => ({ default: module.BackupView })),
);

export const App = () => {
  const {
    data,
    cloud,
    activeTab,
    selectedDate,
    setActiveTab,
    setSelectedDate,
    toggleHabit,
    updateSessionStatus,
    updateSessionField,
    updateExercise,
    updateSessionTemplate,
    updateProfile,
    hydrateCloud,
    requestMagicLink,
    syncCloudNow,
    signOutCloudSession,
    exportData,
    importData,
    resetData,
  } = useAppStore();

  const selectedSession = data.sessions.find((session) => session.date === selectedDate);
  const selectedHabit = data.habits[selectedDate] ?? createEmptyHabit(selectedDate);
  const recommendation = getDailyRecommendation(data, selectedDate);
  const weeklyMetrics = getWeeklyMetrics(data, selectedDate);
  const habitCompletion = getHabitCompletion(selectedHabit);
  const streak = getCurrentStreak(data.habits, selectedDate);
  const programStart = data.profile.programStartDate;
  const programEnd = data.sessions[data.sessions.length - 1]?.date;
  const recommendationTone =
    recommendation.kind === "hard"
      ? "success"
      : recommendation.kind === "moderate"
        ? "accent"
        : recommendation.kind === "recovery"
          ? "warning"
          : "danger";

  useEffect(() => {
    void hydrateCloud();
  }, [hydrateCloud]);

  return (
    <div className="mx-auto min-h-screen w-full max-w-[980px] px-3 pb-24 pt-3 sm:px-4 lg:px-4">
      <BottomNav activeTab={activeTab} onChange={setActiveTab} />

      <header>
        <Card className="overflow-hidden">
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1.5fr)_minmax(270px,0.86fr)] lg:items-start">
            <div className="min-w-0 space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <Pill tone="sky">{dayjs(selectedDate).format("ddd D MMM")}</Pill>
                <Pill tone={recommendationTone}>{recommendation.title}</Pill>
                {selectedSession ? (
                  <Pill tone={sessionTypePillTone[selectedSession.type]}>
                    {sessionTypeLabel[selectedSession.type]}
                  </Pill>
                ) : null}
              </div>
              <h1 className="text-[28px] font-semibold leading-[1.02] tracking-[-0.05em] text-ink sm:text-[32px]">
                {selectedSession ? selectedSession.title : "Mantener la continuidad"}
              </h1>
              <p className="max-w-xl text-[13px] leading-5 text-muted sm:text-sm">
                {selectedSession?.objective ?? recommendation.reason}
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                <button
                  className="rounded-2xl bg-ink px-3.5 py-2.5 text-sm font-semibold text-white"
                  onClick={() => setActiveTab("session")}
                >
                  Registrar ahora
                </button>
                <button
                  className="rounded-2xl border border-line bg-white/85 px-3.5 py-2.5 text-sm font-semibold text-ink"
                  onClick={() => setActiveTab("habits")}
                >
                  Checklist diario
                </button>
                <button
                  className="rounded-2xl border border-line bg-white/85 px-3.5 py-2.5 text-sm font-semibold text-ink"
                  onClick={() => setActiveTab("plan")}
                >
                  Ver plan
                </button>
              </div>
            </div>

            <div className="h-full rounded-[24px] border border-white/80 bg-[#f7faf7] p-3.5 lg:self-start">
              <label className="block">
                <span className="text-[11px] uppercase tracking-[0.22em] text-muted">Fecha activa</span>
                <input
                  type="date"
                  value={selectedDate}
                  min={programStart}
                  max={programEnd}
                  onChange={(event) => setSelectedDate(event.target.value)}
                  className="mt-2 w-full rounded-[20px] border border-line bg-white px-3 py-2.5"
                />
              </label>
              <div className="mt-3 space-y-2.5 text-[13px] sm:text-sm">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-muted">Estado</span>
                  <span className="font-semibold text-ink">
                    {selectedSession ? statusLabelMap[selectedSession.status] : "sin sesión"}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-muted">Entreno</span>
                  <span className="font-semibold text-ink">{data.profile.trainingTime}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-muted">Adherencia</span>
                  <span className="font-semibold text-ink">{weeklyMetrics.adherence}%</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-muted">Streak</span>
                  <span className="font-semibold text-ink">{streak} d</span>
                </div>
              </div>
              {selectedSession ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  <Pill tone="sky">Día {selectedSession.planDayNumber}</Pill>
                  <Pill tone="neutral">{Math.round(selectedSession.plannedIntensity * 100)}%</Pill>
                </div>
              ) : null}
            </div>
          </div>
        </Card>
      </header>

      <main className="mt-3">
        <Suspense
          fallback={
            <Card title="Cargando módulo" subtitle="Preparando la vista seleccionada">
              <p className="text-sm text-muted">Un momento, estamos montando la pantalla.</p>
            </Card>
          }
        >
          {activeTab === "dashboard" ? (
            <DashboardView
              date={selectedDate}
              trainingTime={data.profile.trainingTime}
              session={selectedSession}
              recommendation={recommendation}
              weeklyMetrics={weeklyMetrics}
              habitCompletion={habitCompletion}
              streak={streak}
              onJump={(tab) => setActiveTab(tab)}
            />
          ) : null}

          {activeTab === "plan" ? (
            <PlanView
              sessions={data.sessions}
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
              onUpdateStatus={updateSessionStatus}
              onUpdateTemplate={updateSessionTemplate}
            />
          ) : null}

          {activeTab === "session" ? (
            <SessionView
              session={selectedSession}
              recommendation={recommendation}
              onUpdateStatus={updateSessionStatus}
              onUpdateField={updateSessionField}
              onUpdateExercise={updateExercise}
            />
          ) : null}

          {activeTab === "habits" ? (
            <HabitsView
              date={selectedDate}
              habit={selectedHabit}
              streak={streak}
              session={selectedSession}
              onToggleHabit={toggleHabit}
            />
          ) : null}

          {activeTab === "progress" ? <ProgressView data={data} /> : null}

          {activeTab === "settings" ? (
            <SettingsView
              profile={data.profile}
              cloud={cloud}
              onSave={updateProfile}
              onRequestMagicLink={requestMagicLink}
              onSyncNow={syncCloudNow}
              onSignOutCloud={signOutCloudSession}
            />
          ) : null}

          {activeTab === "backup" ? (
            <BackupView data={data} onExport={exportData} onImport={importData} onReset={resetData} />
          ) : null}
        </Suspense>
      </main>

      <SaveStatusBar cloud={cloud} lastUpdatedAt={data.lastUpdatedAt} />

    </div>
  );
};
