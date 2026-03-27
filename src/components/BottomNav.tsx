import type { TabKey } from "@/app/store";

type BottomNavProps = {
  activeTab: TabKey;
  onChange: (tab: TabKey) => void;
};

const tabs: { key: TabKey; label: string }[] = [
  { key: "dashboard", label: "Hoy" },
  { key: "plan", label: "Plan" },
  { key: "session", label: "Sesión" },
  { key: "habits", label: "Hábitos" },
  { key: "progress", label: "Progreso" },
  { key: "settings", label: "Ajustes" },
  { key: "backup", label: "Backup" },
];

export const BottomNav = ({ activeTab, onChange }: BottomNavProps) => (
  <nav className="sticky top-3 z-30 mb-3 rounded-[24px] border border-white/75 bg-white/90 p-1.5 shadow-card backdrop-blur">
    <div className="flex gap-1 overflow-x-auto rounded-[18px] bg-[#f4f7f3] p-1">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          className={`min-w-max rounded-[16px] px-3 py-2 text-[13px] font-medium transition sm:px-3.5 sm:text-sm ${
            activeTab === tab.key
              ? "bg-ink text-white shadow-sm"
              : "bg-transparent text-muted hover:bg-white/80 hover:text-ink"
          }`}
          onClick={() => onChange(tab.key)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  </nav>
);
