import { useEffect, useRef } from 'react'
import { GameEngine } from '../game'


export function Game() {
  const canvasRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!canvasRef.current) return
    
    const engine = new GameEngine(canvasRef.current) // Three.js se monta acá
    
    //ts ignore
    return () => engine.dispose() // cleanup al desmontar
  }, [])

  return (
    <div ref={canvasRef} style={{ width: '100vw', height: '100vh' }} />
  )
}