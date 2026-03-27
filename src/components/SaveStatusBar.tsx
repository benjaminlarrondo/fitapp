import dayjs from "dayjs";
import { Pill } from "@/components/Pill";
import type { CloudState } from "@/types/app";

type SaveStatusBarProps = {
  cloud: CloudState;
  lastUpdatedAt: string;
};

const getStatusCopy = (cloud: CloudState) => {
  if (cloud.mode === "syncing" && cloud.userId) {
    return {
      tone: "sky" as const,
      title: "Guardando online...",
      detail: "Sincronizando tus cambios en la nube",
    };
  }

  if (cloud.mode === "error") {
    return {
      tone: "danger" as const,
      title: "Guardado local activo",
      detail: cloud.error ?? "No se pudo sincronizar online",
    };
  }

  if (cloud.userId && cloud.lastSyncedAt) {
    return {
      tone: "success" as const,
      title: "Guardado online",
      detail: `Sync ${dayjs(cloud.lastSyncedAt).format("D MMM · HH:mm")}`,
    };
  }

  if (cloud.configured && !cloud.userId) {
    return {
      tone: "warning" as const,
      title: "Guardado en este dispositivo",
      detail: "Conecta tu cuenta para sincronizar online",
    };
  }

  return {
    tone: "neutral" as const,
    title: "Guardado en este dispositivo",
    detail: "Modo local activo",
  };
};

export const SaveStatusBar = ({ cloud, lastUpdatedAt }: SaveStatusBarProps) => {
  const status = getStatusCopy(cloud);

  return (
    <div className="fixed bottom-3 left-1/2 z-40 w-[calc(100%-1rem)] max-w-[980px] -translate-x-1/2 px-3 sm:px-4 lg:px-4">
      <div className="glass flex items-center justify-between gap-3 rounded-[22px] border border-white/80 bg-white/90 px-3.5 py-3 shadow-card">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-ink">{status.title}</p>
          <p className="truncate text-[12px] text-muted sm:text-[13px]">
            Actualizado {dayjs(lastUpdatedAt).format("D MMM · HH:mm")}
            {status.detail ? ` · ${status.detail}` : ""}
          </p>
        </div>
        <Pill tone={status.tone}>{status.title}</Pill>
      </div>
    </div>
  );
};
