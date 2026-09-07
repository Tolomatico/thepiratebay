import { useEffect, useRef, useState, useCallback } from 'react'
import { GameEngine } from '../game'
import { useNetwork } from '../context/NetworkContext';
import { HudOverlay } from './HudOverlay';
import { GamePauseMenu } from '../components/GamePauseMenu';
import { ScoreboardModal } from '../components/ScoreboardModal';
import { PostMatchModal } from '../components/PostMatchModal';
import { useGameHud } from '../context/HudContext';
import { useUser } from '../context/UserContext';
import type { ShipType, Team, ScoreboardPlayer } from '../interfaces/player';
import type { MatchResult } from '../interfaces/match';

interface GameProps {
  onLeaveGame?: () => void;
}

export function Game({ onLeaveGame }: GameProps) {
  const canvasRef = useRef<HTMLDivElement>(null)
  const engineRef = useRef<GameEngine | null>(null)
  const [isPauseMenuOpen, setIsPauseMenuOpen] = useState(false)
  const [isScoreboardOpen, setIsScoreboardOpen] = useState(false)
  const [matchResult, setMatchResult] = useState<MatchResult | null>(null)
  const [scoreboard, setScoreboard] = useState<ScoreboardPlayer[]>([])
  const network = useNetwork();
  const { setPlayerHealth, setPlayerMaxHealth, setPlayerRotation, setPlayerPosition, setRespawnCountdown, setEnemyCount, setEnemyHealthBars, healthBarRefs, remotePlayers, playerHealth } = useGameHud();
  const { username, team, shipType, gold, setGold } = useUser();

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
  }, [togglePauseMenu, matchResult]);

  // Escuchar fin de combate (Victoria / Derrota)
  useEffect(() => {
    const handleMatchEnded = (result: MatchResult) => {
      setMatchResult(result);
      if (engineRef.current) {
        engineRef.current.disableInput();
      }
      setIsPauseMenuOpen(false);
      setIsScoreboardOpen(false);

      const myReward = result.players.find((p) => p.id === network.socket?.id);
      if (myReward) {
        setGold(gold + myReward.goldEarned);
      }
    };

    network.onMatchEnded(handleMatchEnded);
    return () => {
      network.offMatchEnded(handleMatchEnded);
    };
  }, [network, gold, setGold]);

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

  const myScoreboardData = scoreboard.find(
    (p) => p.id === network.socket?.id || (username && p.username === username)
  );
  const currentGoldInHold = myScoreboardData?.goldInHold ?? 0;

  return (
    <div className="relative w-screen h-screen overflow-hidden">
      <div ref={canvasRef} className="w-full h-full" />
      <HudOverlay
        onOpenMenu={() => togglePauseMenu(true)}
        onToggleScoreboard={() => setIsScoreboardOpen((prev) => !prev)}
        goldInHold={currentGoldInHold}
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
      {matchResult && (
        <PostMatchModal
          result={matchResult}
          currentSocketId={network.socket?.id}
          onLeave={handleLeaveGame}
        />
      )}
    </div>
  )
}