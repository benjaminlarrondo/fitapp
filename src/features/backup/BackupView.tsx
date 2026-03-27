import { useState } from "react";
import { Card } from "@/components/Card";
import type { AppData } from "@/types/app";

type BackupViewProps = {
  data: AppData;
  onExport: () => string;
  onImport: (raw: string) => void;
  onReset: () => void;
};

export const BackupView = ({ data, onExport, onImport, onReset }: BackupViewProps) => {
  const [importBuffer, setImportBuffer] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  const handleDownload = () => {
    const blob = new Blob([onExport()], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `fitness-tracker-${data.lastUpdatedAt.slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
    setMessage("Backup exportado.");
  };

  return (
    <div className="space-y-4">
      <Card title="Backup" subtitle="Exporta o importa todo el estado local en JSON">
        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            className="flex-1 rounded-2xl bg-ink px-4 py-3 text-sm font-semibold text-white"
            onClick={handleDownload}
          >
            Exportar JSON
          </button>
          <button
            className="flex-1 rounded-2xl border border-danger px-4 py-3 text-sm font-semibold text-danger"
            onClick={() => {
              if (window.confirm("Esto reinicia el plan y borra el progreso local. ¿Continuar?")) {
                onReset();
                setMessage("Datos reiniciados.");
              }
            }}
          >
            Reset total
          </button>
        </div>
        {message ? <p className="mt-3 text-sm text-muted">{message}</p> : null}
      </Card>

      <Card title="Importar JSON" subtitle="Pega el contenido o carga un archivo">
        <input
          type="file"
          accept="application/json"
          className="mb-4 block w-full text-sm text-muted"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (!file) return;
            file.text().then((text) => {
              setImportBuffer(text);
            });
          }}
        />
        <textarea
          value={importBuffer}
          onChange={(event) => setImportBuffer(event.target.value)}
          rows={10}
          className="w-full rounded-3xl border border-line px-4 py-3"
          placeholder='Pega aquí el JSON exportado...'
        />
        <button
          className="mt-4 w-full rounded-2xl bg-success px-4 py-3 text-sm font-semibold text-white"
          onClick={() => {
            try {
              onImport(importBuffer);
              setMessage("Backup importado correctamente.");
              setImportBuffer("");
            } catch (error) {
              setMessage(error instanceof Error ? error.message : "No se pudo importar el archivo.");
            }
          }}
        >
          Importar y reemplazar estado local
        </button>
      </Card>
    </div>
  );
};
