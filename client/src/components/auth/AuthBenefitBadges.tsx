export default function AuthBenefitBadges() {
  const badges = [
    { icon: "🪙", title: "Oro & Botín", subtitle: "Persistente" },
    { icon: "⚓", title: "Navíos", subtitle: "Desbloqueables" },
    { icon: "🏆", title: "Ranking", subtitle: "Global" },
  ];

  return (
    <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 w-full mt-4 text-xs text-slate-400">
      {badges.map((b, i) => (
        <div
          key={i}
          className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/50 border border-slate-800 backdrop-blur-sm"
        >
          <span>{b.icon}</span>
          <span className="font-medium text-slate-300">{b.title}</span>
        </div>
      ))}
    </div>
  );
}
