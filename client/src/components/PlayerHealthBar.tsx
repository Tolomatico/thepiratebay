interface PlayerHealthBarProps {
  health: number;
  maxHealth: number;
}

export function PlayerHealthBar({ health, maxHealth }: PlayerHealthBarProps) {
  const ratio = Math.max(0, health / maxHealth);
  const percent = Math.round(ratio * 100);

  return (
    <div className="absolute bottom-10 left-10 flex flex-col gap-4 pointer-events-auto">
      <div className="bg-black/40 backdrop-blur-md p-4 rounded-2xl border border-white/10 w-72 shadow-2xl flex flex-col gap-3 group">
        <div className="flex justify-between items-end">
          <span className="text-white/60 text-[10px] font-black uppercase tracking-[0.2em]">
            Integridad del barco
          </span>
          <span className="text-white font-mono text-lg font-bold leading-none">
            {percent}
          </span>
        </div>
        <div className="relative h-2 w-full bg-white/10 rounded-full overflow-hidden border border-white/5">
          <div
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-red-600 via-orange-500 to-amber-400 transition-all duration-700 ease-out shadow-[0_0_15px_rgba(239,68,68,0.5)]"
            style={{ width: `${ratio * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}
