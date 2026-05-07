import { useEffect, useRef } from 'react'
import { GameEngine } from '../game'
import { useNetwork } from '../context/NetworkContext';
import { HudOverlay } from './HudOverlay';
import { useGameHud } from '../context/HudContext';


export function Game() {
  const canvasRef = useRef<HTMLDivElement>(null)
  const network = useNetwork();
  const { setPlayerHealth, setRespawnCountdown, setEnemyCount, setEnemyHealthBars, healthBarRefs } = useGameHud();
  useEffect(() => {
    if (!canvasRef.current) return

    const engine = new GameEngine(
      canvasRef.current,
      network,
      setPlayerHealth,
      setRespawnCountdown,
      setEnemyCount,
      setEnemyHealthBars,
      healthBarRefs.current
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