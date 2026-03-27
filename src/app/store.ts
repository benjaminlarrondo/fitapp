import dayjs from "dayjs";
import { create } from "zustand";
import { createEmptyHabit } from "@/data/defaults";
import {
  fetchRemoteSnapshot,
  getCurrentSession,
  getCurrentUser,
  isCloudConfigured,
  saveRemoteSnapshot,
  sendMagicLink,
  signOutCloud,
  subscribeToAuthChanges,
} from "@/lib/cloud/supabase";
import { getProgramStartDate, generateYearPlan } from "@/lib/planning/generateYearPlan";
import { createSessionFromTemplate } from "@/lib/planning/templates";
import { exportJSON, importJSON, loadAppData, reset as resetStorage, saveAppData } from "@/lib/storage/local";
import type { AppData, CloudState, Exercise, Session, SessionStatus, UserProfile } from "@/types/app";

type TabKey = "dashboard" | "plan" | "session" | "habits" | "progress" | "settings" | "backup";

type ProfilePatch = Partial<Omit<UserProfile, "constraints" | "oneRM">> & {
  constraints?: Partial<UserProfile["constraints"]>;
  oneRM?: Partial<UserProfile["oneRM"]>;
};

type StoreState = {
  data: AppData;
  cloud: CloudState;
  activeTab: TabKey;
  selectedDate: string;
  setActiveTab: (tab: TabKey) => void;
  setSelectedDate: (date: string) => void;
  toggleHabit: (date: string, key: "sleep" | "training" | "nutrition" | "hydration" | "mobility") => void;
  updateSessionStatus: (date: string, status: SessionStatus) => void;
  updateSessionField: (
    date: string,
    payload: Partial<Pick<Session, "actualRPE" | "note">>,
  ) => void;
  updateExercise: (date: string, exerciseIndex: number, patch: Partial<Exercise>) => void;
  updateSessionTemplate: (date: string, templateId: string) => void;
  updateProfile: (patch: ProfilePatch) => void;
  hydrateCloud: () => Promise<void>;
  requestMagicLink: (email: string) => Promise<void>;
  syncCloudNow: () => Promise<void>;
  signOutCloudSession: () => Promise<void>;
  exportData: () => string;
  importData: (raw: string) => void;
  resetData: () => void;
};

const initialData = loadAppData();
const initialCloud: CloudState = {
  configured: isCloudConfigured(),
  mode: "idle",
  email: null,
  userId: null,
};
const defaultDate =
  initialData.sessions.find((session) => session.date === dayjs().format("YYYY-MM-DD"))?.date ??
  initialData.sessions[0]?.date ??
  dayjs().format("YYYY-MM-DD");

let cloudListenerRegistered = false;

const persist = (data: AppData) => {
  return saveAppData(data) ?? {
    ...data,
    lastUpdatedAt: dayjs().toISOString(),
  };
};

const mergeRegeneratedSessions = (current: Session[], profile: UserProfile) => {
  const startDate = profile.programStartDate;
  const endDate = dayjs(`${dayjs(profile.programStartDate).year()}-12-31`).format("YYYY-MM-DD");
  const regenerated = generateYearPlan(startDate, endDate, profile);
  const existingMap = new Map(current.map((session) => [session.date, session]));

  return regenerated.map((session) => {
    const existing = existingMap.get(session.date);
    if (!existing) return session;

    return createSessionFromTemplate({
      date: session.date,
      planDayNumber: session.planDayNumber,
      cycleDay: session.cycleDay,
      templateId: existing.templateId ?? session.templateId,
      intensity: session.plannedIntensity,
      profile,
      existing,
    });
  });
};

export const useAppStore = create<StoreState>((set, get) => {
  const syncDataToCloud = async (data: AppData) => {
    const cloud = get().cloud;
    if (!cloud.configured || !cloud.userId) return;

    set((state) => ({
      cloud: {
        ...state.cloud,
        mode: "syncing",
        error: undefined,
      },
    }));

    try {
      const updatedAt = await saveRemoteSnapshot(cloud.userId, data);
      set((state) => ({
        cloud: {
          ...state.cloud,
          mode: "ready",
          lastSyncedAt: updatedAt,
          error: undefined,
        },
      }));
    } catch (error) {
      set((state) => ({
        cloud: {
          ...state.cloud,
          mode: "error",
          error: error instanceof Error ? error.message : "No se pudo sincronizar",
        },
      }));
    }
  };

  const persistAndQueueSync = (data: AppData) => {
    const persisted = persist(data);
    void syncDataToCloud(persisted);
    return persisted;
  };

  const applyCloudUser = async () => {
    if (!isCloudConfigured()) {
      set((state) => ({
        cloud: {
          ...state.cloud,
          configured: false,
          mode: "idle",
        },
      }));
      return;
    }

    const session = await getCurrentSession();
    const user = session?.user ?? (await getCurrentUser());

    if (!user) {
      set((state) => ({
        cloud: {
          ...state.cloud,
          configured: true,
          mode: "ready",
          email: null,
          userId: null,
          error: undefined,
        },
      }));
      return;
    }

    set((state) => ({
      cloud: {
        ...state.cloud,
        configured: true,
        mode: "syncing",
        email: user.email ?? null,
        userId: user.id,
        error: undefined,
      },
    }));

    try {
      const remote = await fetchRemoteSnapshot(user.id);
      const localData = get().data;

      if (remote?.payload) {
        const localStamp = dayjs(localData.lastUpdatedAt);
        const remoteStamp = dayjs(remote.payload.lastUpdatedAt ?? remote.updated_at);

        if (remoteStamp.isAfter(localStamp)) {
          const remoteData = persist(remote.payload);
          set((state) => ({
            data: remoteData,
            selectedDate:
              remoteData.sessions.find((sessionItem) => sessionItem.date === state.selectedDate)?.date ??
              remoteData.sessions[0]?.date ??
              state.selectedDate,
            cloud: {
              ...state.cloud,
              configured: true,
              mode: "ready",
              email: user.email ?? null,
              userId: user.id,
              lastSyncedAt: remote.updated_at,
              error: undefined,
            },
          }));
          return;
        }
      }

      await syncDataToCloud(localData);
      set((state) => ({
        cloud: {
          ...state.cloud,
          configured: true,
          mode: "ready",
          email: user.email ?? null,
          userId: user.id,
          lastSyncedAt: state.cloud.lastSyncedAt,
          error: undefined,
        },
      }));
    } catch (error) {
      set((state) => ({
        cloud: {
          ...state.cloud,
          configured: true,
          mode: "error",
          email: user.email ?? null,
          userId: user.id,
          error: error instanceof Error ? error.message : "No se pudo cargar la nube",
        },
      }));
    }
  };

  return {
  data: initialData,
  cloud: initialCloud,
  activeTab: "dashboard",
  selectedDate: defaultDate,
  setActiveTab: (tab) => set({ activeTab: tab }),
  setSelectedDate: (date) => set({ selectedDate: date }),
  toggleHabit: (date, key) =>
    set((state) => {
      const current = state.data.habits[date] ?? createEmptyHabit(date);
      const next = {
        ...state.data,
        habits: {
          ...state.data.habits,
          [date]: {
            ...current,
            [key]: !current[key],
          },
        },
      };

      return { data: persistAndQueueSync(next) };
    }),
  updateSessionStatus: (date, status) =>
    set((state) => {
      const sessions = state.data.sessions.map((session) => {
        if (session.date !== date) return session;

        return {
          ...session,
          status,
        };
      });
      const currentHabit = state.data.habits[date] ?? createEmptyHabit(date);
      const session = sessions.find((entry) => entry.date === date);
      const next = {
        ...state.data,
        sessions,
        habits: {
          ...state.data.habits,
          [date]: {
            ...currentHabit,
            training: status === "completed" && session?.type !== "rest",
          },
        },
      };

      return { data: persistAndQueueSync(next) };
    }),
  updateSessionField: (date, payload) =>
    set((state) => {
      const next = {
        ...state.data,
        sessions: state.data.sessions.map((session) =>
          session.date === date
            ? {
                ...session,
                ...payload,
                note: {
                  ...session.note,
                  ...payload.note,
                },
              }
            : session,
        ),
      };

      return { data: persistAndQueueSync(next) };
    }),
  updateExercise: (date, exerciseIndex, patch) =>
    set((state) => {
      const next = {
        ...state.data,
        sessions: state.data.sessions.map((session) => {
          if (session.date !== date) return session;

          return {
            ...session,
            exercises: session.exercises.map((exercise, index) =>
              index === exerciseIndex
                ? {
                    ...exercise,
                    ...patch,
                  }
                : exercise,
            ),
          };
        }),
      };

      return { data: persistAndQueueSync(next) };
    }),
  updateSessionTemplate: (date, templateId) =>
    set((state) => {
      const updatedSessions = state.data.sessions.map((session) => {
        if (session.date !== date) return session;

        return createSessionFromTemplate({
          date,
          planDayNumber: session.planDayNumber,
          cycleDay: session.cycleDay,
          templateId,
          intensity: session.plannedIntensity,
          profile: state.data.profile,
          existing: {
            ...session,
            id: `${date}-${templateId}`,
            exercises: [],
          },
        });
      });
      const updatedSession = updatedSessions.find((session) => session.date === date);
      const currentHabit = state.data.habits[date] ?? createEmptyHabit(date);
      const next = {
        ...state.data,
        sessions: updatedSessions,
        habits: {
          ...state.data.habits,
          [date]: {
            ...currentHabit,
            training:
              currentHabit.training &&
              updatedSession?.type !== "rest" &&
              updatedSession?.type !== "recovery",
          },
        },
      };

      return { data: persistAndQueueSync(next) };
    }),
  updateProfile: (patch) =>
    set((state) => {
      const profile = {
        ...state.data.profile,
        ...patch,
        constraints: {
          ...state.data.profile.constraints,
          ...patch.constraints,
        },
        oneRM: {
          ...state.data.profile.oneRM,
          ...patch.oneRM,
        },
        goals: patch.goals ?? state.data.profile.goals,
      };
      const sessions = mergeRegeneratedSessions(state.data.sessions, profile);
      const next = {
        ...state.data,
        profile,
        sessions,
      };

      return {
        data: persistAndQueueSync(next),
        selectedDate:
          sessions.find((session) => session.date === state.selectedDate)?.date ??
          sessions[0]?.date ??
          state.selectedDate,
      };
    }),
  hydrateCloud: async () => {
    if (!cloudListenerRegistered && isCloudConfigured()) {
      subscribeToAuthChanges(() => {
        void get().hydrateCloud();
      });
      cloudListenerRegistered = true;
    }

    await applyCloudUser();
  },
  requestMagicLink: async (email) => {
    set((state) => ({
      cloud: {
        ...state.cloud,
        mode: "authenticating",
        error: undefined,
      },
    }));

    try {
      await sendMagicLink(email);
      set((state) => ({
        cloud: {
          ...state.cloud,
          mode: "ready",
          email,
          error: undefined,
        },
      }));
    } catch (error) {
      set((state) => ({
        cloud: {
          ...state.cloud,
          mode: "error",
          error: error instanceof Error ? error.message : "No se pudo enviar el magic link",
        },
      }));
      throw error;
    }
  },
  syncCloudNow: async () => {
    await syncDataToCloud(get().data);
  },
  signOutCloudSession: async () => {
    await signOutCloud();
    set((state) => ({
      cloud: {
        ...state.cloud,
        mode: "ready",
        email: null,
        userId: null,
        error: undefined,
      },
    }));
  },
  exportData: () => exportJSON(get().data),
  importData: (raw) =>
    set(() => {
      const data = importJSON(raw);
      void syncDataToCloud(data);
      const selectedDate =
        data.sessions.find((session) => session.date === dayjs().format("YYYY-MM-DD"))?.date ??
        data.sessions[0]?.date ??
        getProgramStartDate();

      return { data, selectedDate };
    }),
  resetData: () =>
    set(() => {
      const data = resetStorage();
      void syncDataToCloud(data);
      return {
        data,
        selectedDate:
          data.sessions.find((session) => session.date === dayjs().format("YYYY-MM-DD"))?.date ??
          data.sessions[0]?.date ??
          getProgramStartDate(),
      };
    }),
};});

export type { TabKey };
