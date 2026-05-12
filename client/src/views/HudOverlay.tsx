import { CompassBar, EnemyBar, RespawnOverlay, PlayerHealthBar, EnemyCounter } from "../components";
import { useGameHud } from "../context/HudContext";

export function HudOverlay() {
  const { playerHealth, playerMaxHealth, playerRotation, playerPosition, respawnCountdown, enemyCount, enemyHealthBars, healthBarRefs, remotePlayers} = useGameHud();
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
    </div>
  );
}
