import { EnemyBar, RespawnOverlay, PlayerHealthBar, EnemyCounter } from "../components";
import { useGameHud } from "../context/HudContext";

export function HudOverlay() {
  const { playerHealth, playerMaxHealth, respawnCountdown, enemyCount, enemyHealthBars, healthBarRefs, remotePlayers } = useGameHud();
  return (
    <div className="fixed inset-0 pointer-events-none z-50 font-sans">
      {/* Enemy Health Bars (In-World) */}
      {enemyHealthBars.map((bar) => (
        <EnemyBar key={bar.id} bar={bar} healthBarRefs={healthBarRefs} />
      ))}

      {/* Central Respawn Countdown */}
      {respawnCountdown !== null && respawnCountdown > 0 && (
        <RespawnOverlay countdown={respawnCountdown} />
      )}

      {/* Bottom Left: Player Health */}
      <PlayerHealthBar health={playerHealth} maxHealth={playerMaxHealth} />

      {/* Top Right: Enemy Counter */}
      <EnemyCounter count={enemyCount} />
    </div>
  );
}
