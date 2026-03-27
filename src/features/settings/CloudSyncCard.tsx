import { useState } from "react";
import { Card } from "@/components/Card";
import { Pill } from "@/components/Pill";
import type { CloudState } from "@/types/app";

type CloudSyncCardProps = {
  cloud: CloudState;
  onRequestMagicLink: (email: string) => Promise<void>;
  onSyncNow: () => Promise<void>;
  onSignOut: () => Promise<void>;
};

const modeToneMap: Record<CloudState["mode"], "neutral" | "warning" | "danger" | "success" | "sky"> = {
  idle: "neutral",
  authenticating: "warning",
  syncing: "sky",
  ready: "success",
  error: "danger",
};

const modeLabelMap: Record<CloudState["mode"], string> = {
  idle: "local only",
  authenticating: "enviando link",
  syncing: "sincronizando",
  ready: "listo",
  error: "error",
};

export const CloudSyncCard = ({
  cloud,
  onRequestMagicLink,
  onSyncNow,
  onSignOut,
}: CloudSyncCardProps) => {
  const [email, setEmail] = useState(cloud.email ?? "");
  const [message, setMessage] = useState<string | null>(null);

  return (
    <Card
      title="Cloud Sync"
      subtitle="GitHub Pages + Supabase para guardar tu progreso en la nube"
      action={<Pill tone={modeToneMap[cloud.mode]}>{modeLabelMap[cloud.mode]}</Pill>}
    >
      {!cloud.configured ? (
        <div className="rounded-3xl bg-rest/22 p-4 text-sm text-muted">
          <p className="font-semibold text-ink">Falta configurar Supabase</p>
          <p className="mt-1">
            Define `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` para activar el guardado en nube.
          </p>
        </div>
      ) : null}

      {cloud.configured && !cloud.userId ? (
        <div className="space-y-3">
          <label className="block">
            <span className="text-sm font-semibold text-ink">Email</span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="tu@email.com"
              className="mt-2 w-full rounded-2xl border border-line px-3 py-3"
            />
          </label>
          <button
            className="w-full rounded-2xl bg-ink px-4 py-3 text-sm font-semibold text-white"
            onClick={async () => {
              try {
                await onRequestMagicLink(email);
                setMessage("Te envié un magic link por correo. Ábrelo desde el mismo dispositivo o inicia sesión donde quieras usar la app.");
              } catch (error) {
                setMessage(error instanceof Error ? error.message : "No se pudo enviar el magic link.");
              }
            }}
          >
            Enviar magic link
          </button>
        </div>
      ) : null}

      {cloud.configured && cloud.userId ? (
        <div className="space-y-3">
          <div className="rounded-3xl bg-gym/20 p-4 text-sm text-muted">
            <p className="font-semibold text-ink">Cuenta conectada</p>
            <p className="mt-1">{cloud.email ?? "Usuario autenticado"}</p>
            {cloud.lastSyncedAt ? (
              <p className="mt-2 text-xs">Última sync: {new Date(cloud.lastSyncedAt).toLocaleString()}</p>
            ) : null}
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              className="flex-1 rounded-2xl bg-ink px-4 py-3 text-sm font-semibold text-white"
              onClick={async () => {
                try {
                  await onSyncNow();
                  setMessage("Sincronización completada.");
                } catch (error) {
                  setMessage(error instanceof Error ? error.message : "No se pudo sincronizar.");
                }
              }}
            >
              Sincronizar ahora
            </button>
            <button
              className="flex-1 rounded-2xl border border-line bg-white px-4 py-3 text-sm font-semibold text-ink"
              onClick={async () => {
                try {
                  await onSignOut();
                  setMessage("Sesión cerrada. La app sigue funcionando localmente.");
                } catch (error) {
                  setMessage(error instanceof Error ? error.message : "No se pudo cerrar sesión.");
                }
              }}
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      ) : null}

      {cloud.error ? <p className="mt-3 text-sm text-danger">{cloud.error}</p> : null}
      {message ? <p className="mt-3 text-sm text-muted">{message}</p> : null}
    </Card>
  );
};
