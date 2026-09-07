import type { AuthTab } from "./types";

interface AuthTabsProps {
  activeTab: AuthTab;
  onChange: (tab: AuthTab) => void;
}

export default function AuthTabs({ activeTab, onChange }: AuthTabsProps) {
  const tabs: { id: AuthTab; label: string; icon: string }[] = [
    { id: "guest", label: "Invitado", icon: "⚔️" },
    { id: "login", label: "Iniciar Sesión", icon: "🔑" },
    { id: "register", label: "Registrarse", icon: "📜" },
  ];

  return (
    <div className="grid grid-cols-3 gap-1.5 bg-slate-950/80 p-1.5 rounded-xl border border-slate-800/90 mb-5">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={`py-2.5 px-2 text-xs sm:text-sm font-semibold rounded-lg transition-all duration-200 cursor-pointer text-center flex items-center justify-center gap-1.5 ${
              isActive
                ? "bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold shadow-md shadow-amber-950/50"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/50"
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}
