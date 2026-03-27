import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card } from "@/components/Card";
import { StatTile } from "@/components/StatTile";
import { getMonthlyFrequencyData, getStrengthProgressData } from "@/lib/analytics/metrics";
import type { AppData } from "@/types/app";

type ProgressViewProps = {
  data: AppData;
};

export const ProgressView = ({ data }: ProgressViewProps) => {
  const monthlyFrequency = getMonthlyFrequencyData(data.sessions);
  const strengthProgress = getStrengthProgressData(data.sessions);
  const completed = data.sessions.filter((session) => session.status === "completed").length;
  const blocked = data.sessions.filter((session) => session.status === "blocked").length;
  const recovery = data.sessions.filter(
    (session) => session.status === "completed" && session.type === "recovery",
  ).length;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatTile label="Completadas" value={`${completed}`} hint="sesiones cerradas" tone="success" />
        <StatTile label="Rest" value={`${blocked}`} hint="días en descanso" tone="neutral" />
        <StatTile label="Recovery" value={`${recovery}`} hint="sesiones suaves" tone="sky" />
        <StatTile label="Horizonte" value="31 Dic" hint="plan anual" tone="peach" />
      </div>

      <Card title="Frecuencia mensual" subtitle="Cómo se mueve la adherencia en el año">
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyFrequency}>
              <CartesianGrid stroke="#dde4db" vertical={false} />
              <XAxis dataKey="label" tickLine={false} axisLine={false} />
              <YAxis tickLine={false} axisLine={false} />
              <Tooltip />
              <Bar dataKey="completed" fill="#a8dfc4" radius={[8, 8, 0, 0]} />
              <Bar dataKey="blocked" fill="#dfe5de" radius={[8, 8, 0, 0]} />
              <Bar dataKey="skipped" fill="#f7d1db" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card title="Carga de fuerza" subtitle="Top set de las sesiones registradas">
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={strengthProgress}>
              <CartesianGrid stroke="#dde4db" vertical={false} />
              <XAxis dataKey="date" tickLine={false} axisLine={false} />
              <YAxis tickLine={false} axisLine={false} />
              <Tooltip />
              <Line type="monotone" dataKey="load" stroke="#76c3b1" strokeWidth={3} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="rpe" stroke="#e59aa9" strokeWidth={2} dot={{ r: 2 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
};
