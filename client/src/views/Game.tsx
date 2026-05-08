import { useEffect, useRef } from 'react'
import { GameEngine } from '../game'
import { useNetwork } from '../context/NetworkContext';
import { HudOverlay } from './HudOverlay';
import { useGameHud } from '../context/HudContext';
import { useUser } from '../context/UserContext';
import type { ShipType, Team } from '../interfaces/player';


export function Game() {
  const canvasRef = useRef<HTMLDivElement>(null)
  const network = useNetwork();
  const { setPlayerHealth, setPlayerMaxHealth, setRespawnCountdown, setEnemyCount, setEnemyHealthBars, healthBarRefs, remotePlayers } = useGameHud();
   const {username,team,shipType} = useUser();
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
      setRespawnCountdown,
      setEnemyCount,
      setEnemyHealthBars,
      healthBarRefs.current,
      remotePlayers.current

    ) // Three.js se monta acá
   
    //ts ignore
    return () => engine.dispose() // cleanup al desmontar
  }, [])

  return (
   <div className="relative w-screen h-screen">
      <div ref={canvasRef} className="w-full h-full" />
      <HudOverlay  />
    </div>
  )
}