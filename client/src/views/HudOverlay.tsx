import { EnemyBar } from "../components";
import { useGameHud } from "../context/HudContext";

export function HudOverlay() {
  const { playerHealth, playerMaxHealth, respawnCountdown, enemyCount, enemyHealthBars, healthBarRefs } = useGameHud();
  
  return (
    <div className="fixed inset-0 pointer-events-none z-50 font-sans">
      {/* Enemy Health Bars (In-World) */}
      {enemyHealthBars.map((bar) => (
        <EnemyBar key={bar.id} bar={bar} healthBarRefs={healthBarRefs} />
      ))}

      {/* Central Respawn Countdown */}
      {respawnCountdown !== null && respawnCountdown > 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="flex flex-col items-center animate-in fade-in zoom-in duration-500">
            <div className="bg-black/60 backdrop-blur-xl border border-white/10 px-12 py-8 rounded-[2.5rem] shadow-2xl flex flex-col items-center gap-2 transform hover:scale-105 transition-transform duration-300">
              <span className="text-white/50 text-sm font-bold uppercase tracking-[0.3em] animate-pulse">Resurgiendo en</span>
              <div className="text-8xl font-black text-white tabular-nums tracking-tighter drop-shadow-lg">
                {respawnCountdown}
              </div>
              <span className="text-white/30 text-xs font-medium uppercase tracking-widest">Segundos</span>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Left Status (Health) */}
      <div className="absolute bottom-10 left-10 flex flex-col gap-4 pointer-events-auto">
        <div className="bg-black/40 backdrop-blur-md p-4 rounded-2xl border border-white/10 w-72 shadow-2xl flex flex-col gap-3 group">
          <div className="flex justify-between items-end">
            <span className="text-white/60 text-[10px] font-black uppercase tracking-[0.2em]">Integridad del barco</span>
            <span className="text-white font-mono text-lg font-bold leading-none">
              {Math.max(0, Math.round((playerHealth / playerMaxHealth) * 100))}
            </span>
          </div>
          <div className="relative h-2 w-full bg-white/10 rounded-full overflow-hidden border border-white/5">
             <div 
               className="absolute inset-y-0 left-0 bg-gradient-to-r from-red-600 via-orange-500 to-amber-400 transition-all duration-700 ease-out shadow-[0_0_15px_rgba(239,68,68,0.5)]"
               style={{ width: `${Math.max(0, (playerHealth / playerMaxHealth) * 100)}%` }}
             />
          </div>
        </div>
      </div>

      {/* Top Right Enemy Counter */}
      <div className="absolute top-10 right-10 pointer-events-auto">
        <div className="bg-black/40 backdrop-blur-md px-8 py-4 rounded-2xl border border-white/10 shadow-2xl flex items-center gap-4 group hover:bg-black/60 transition-colors duration-300">
           <div className="relative flex items-center justify-center">
             <div className="absolute inset-0 bg-red-500/20 blur-lg rounded-full group-hover:bg-red-500/40 transition-all" />
             <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse border border-red-400" />
           </div>
           <div className="flex flex-col">
             <span className="text-white/40 text-[10px] font-black uppercase tracking-widest leading-none mb-1">Enemigos detectados</span>
             <span className="text-white text-3xl font-black leading-none tabular-nums tracking-tighter">
               {enemyCount < 10 ? `0${enemyCount}` : enemyCount}
             </span>
           </div>
        </div>
      </div>
    </div>
  );
}

