import { useEffect, useRef } from 'react'
import { GameEngine } from '../game'
import { useNetwork } from '../context/NetworkContext';


export function Game() {
  const canvasRef = useRef<HTMLDivElement>(null)
  const network = useNetwork();

  useEffect(() => {
    if (!canvasRef.current) return

    const engine = new GameEngine(canvasRef.current,network) // Three.js se monta acá
   
    //ts ignore
    return () => engine.dispose() // cleanup al desmontar
  }, [])

  return (
    <div ref={canvasRef} className="w-screen h-screen bg-gray-900" />
  )
}