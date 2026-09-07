import { useEffect, useRef, useState, useCallback } from 'react'
import { GameEngine } from '../game'
import { useNetwork } from '../context/NetworkContext';
import { HudOverlay } from './HudOverlay';
import { GamePauseMenu } from '../components/GamePauseMenu';
import { ScoreboardModal } from '../components/ScoreboardModal';
import { useGameHud } from '../context/HudContext';
import { useUser } from '../context/UserContext';
import type { ShipType, Team, ScoreboardPlayer } from '../interfaces/player';

interface GameProps {
  onLeaveGame?: () => void;
}

export function Game({ onLeaveGame }: GameProps) {
  const canvasRef = useRef<HTMLDivElement>(null)
  const engineRef = useRef<GameEngine | null>(null)
  const [isPauseMenuOpen, setIsPauseMenuOpen] = useState(false)
  const [isScoreboardOpen, setIsScoreboardOpen] = useState(false)
  const [scoreboard, setScoreboard] = useState<ScoreboardPlayer[]>([])
  const network = useNetwork();
  const { setPlayerHealth, setPlayerMaxHealth, setPlayerRotation, setPlayerPosition, setRespawnCountdown, setEnemyCount, setEnemyHealthBars, healthBarRefs, remotePlayers, playerHealth } = useGameHud();
  const { username, team, shipType } = useUser();

  const togglePauseMenu = useCallback((open?: boolean) => {
    setIsPauseMenuOpen((prev) => {
      const next = typeof open === "boolean" ? open : !prev;
      if (engineRef.current) {
        if (next) {
          engineRef.current.disableInput();
        } else {
          engineRef.current.enableInput();
        }
      }
      return next;
    });
  }, []);

  const handleLeaveGame = useCallback(() => {
    setIsPauseMenuOpen(false);
    setIsScoreboardOpen(false);
    if (engineRef.current) {
      engineRef.current.dispose();
      engineRef.current = null;
    }
    onLeaveGame?.();
  }, [onLeaveGame]);

  // Sincronizar marcador con el servidor
  useEffect(() => {
    network.onScoreboardUpdated((data: ScoreboardPlayer[]) => {
      setScoreboard(data);
    });

    network.getScoreboard();

    return () => {
      network.socket.off("scoreboardUpdated");
    };
  }, [network]);

  // Manejo de teclas: ESC para Menú y TAB para Marcador de Escuadras
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA")) {
        return;
      }

      if (event.key === "Escape") {
        togglePauseMenu();
      } else if (event.key === "Tab" || event.code === "Tab") {
        event.preventDefault();
        setIsScoreboardOpen(true);
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA")) {
        return;
      }

      if (event.key === "Tab" || event.code === "Tab") {
        event.preventDefault();
        setIsScoreboardOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [togglePauseMenu]);

  useEffect(() => {
    if (!canvasRef.current) return

    const engine = new GameEngine(
      canvasRef.current,
      network,
      username || "",
      team as Team || "blue",
      shipType as ShipType || "pirate",
      setPlayerHealth,
      setPlayerMaxHealth,
      setPlayerRotation,
      setPlayerPosition,
      setRespawnCountdown,
      setEnemyCount,
      setEnemyHealthBars,
      healthBarRefs.current,
      remotePlayers.current
    )

    engineRef.current = engine;
   
    return () => {
      engine.dispose();
      engineRef.current = null;
    }
  }, [])

  return (
    <div className="relative w-screen h-screen overflow-hidden">
      <div ref={canvasRef} className="w-full h-full" />
      <HudOverlay
        onOpenMenu={() => togglePauseMenu(true)}
        onToggleScoreboard={() => setIsScoreboardOpen((prev) => !prev)}
      />
      <GamePauseMenu
        isOpen={isPauseMenuOpen}
        onResume={() => togglePauseMenu(false)}
        onLeaveGame={handleLeaveGame}
      />
      <ScoreboardModal
        isOpen={isScoreboardOpen}
        onClose={() => setIsScoreboardOpen(false)}
        scoreboard={scoreboard}
        currentSocketId={network.socket?.id}
        playerHealth={playerHealth}
      />
    </div>
  )
}