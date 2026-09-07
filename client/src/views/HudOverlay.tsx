import { CompassBar, EnemyBar, RespawnOverlay, PlayerHealthBar, EnemyCounter } from "../components";
import { useGameHud } from "../context/HudContext";
import ChatComponent from "../components/chat/ChatComponent";

interface HudOverlayProps {
  onOpenMenu?: () => void;
  onToggleScoreboard?: () => void;
}

export function HudOverlay({ onOpenMenu, onToggleScoreboard }: HudOverlayProps) {
  const { playerHealth, playerMaxHealth, playerRotation, playerPosition, respawnCountdown, enemyCount, enemyHealthBars, healthBarRefs, remotePlayers} = useGameHud();
  return (
    <div className="fixed inset-0 pointer-events-none z-50 font-sans">
      {/* Top Left: Chat */}
      <div className="absolute top-4 left-4 pointer-events-auto">
        <ChatComponent />
      </div>

      {/* Enemy Health Bars (In-World) */}
      {enemyHealthBars.map((bar) => (
        <EnemyBar key={bar.id} bar={bar} healthBarRefs={healthBarRefs} />
      ))}

      {/* Central Respawn Countdown */}
      {respawnCountdown !== null && respawnCountdown > 0 && (
        <RespawnOverlay countdown={respawnCountdown} />
      )}

      {/* Top Center: Compass Bar */}
      <CompassBar 
        rotation={playerRotation} 
        playerPosition={playerPosition}
        remotePlayers={remotePlayers.current}
      />

      {/* Bottom Left: Player Health */}
      <PlayerHealthBar health={playerHealth} maxHealth={playerMaxHealth} />

      {/* Top Right: Enemy Counter */}
      <EnemyCounter count={enemyCount} />

      {/* Top Right below Counter: Action Buttons (Scoreboard & Menu) */}
      <div className="absolute top-32 right-10 flex flex-col sm:flex-row items-end sm:items-center gap-2 pointer-events-auto">
        {onToggleScoreboard && (
          <button
            type="button"
            onClick={onToggleScoreboard}
            className="flex items-center gap-2 px-3.5 py-2.5 bg-slate-900/80 hover:bg-blue-950/80 border border-blue-500/30 hover:border-blue-400 rounded-xl backdrop-blur-md text-blue-200 hover:text-blue-100 font-bold text-xs shadow-xl transition-all transform hover:scale-105 active:scale-95 cursor-pointer group"
            title="Ver Marcador de Escuadras (Tecla TAB)"
          >
            <span className="text-base group-hover:scale-110 transition-transform">📊</span>
            <span className="uppercase tracking-wider font-extrabold">Escuadras</span>
            <span className="text-[10px] bg-blue-500/20 px-1.5 py-0.5 rounded text-blue-300 font-mono">TAB</span>
          </button>
        )}

        {onOpenMenu && (
          <button
            type="button"
            onClick={onOpenMenu}
            className="flex items-center gap-2 px-3.5 py-2.5 bg-slate-900/80 hover:bg-amber-950/80 border border-amber-500/30 hover:border-amber-400 rounded-xl backdrop-blur-md text-amber-200 hover:text-amber-100 font-bold text-xs shadow-xl transition-all transform hover:scale-105 active:scale-95 cursor-pointer group"
            title="Abrir Menú de Pausa (Tecla ESC)"
          >
            <span className="text-base group-hover:rotate-45 transition-transform duration-300">⚙️</span>
            <span className="uppercase tracking-wider font-extrabold">Menú</span>
            <span className="text-[10px] bg-amber-500/20 px-1.5 py-0.5 rounded text-amber-300 font-mono">ESC</span>
          </button>
        )}
      </div>
    </div>
  );
}
