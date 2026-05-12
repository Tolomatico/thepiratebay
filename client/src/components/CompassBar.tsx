import type { RemotePlayerHUD } from "../context/HudContext";

interface CompassBarProps {
  rotation: number;
  playerPosition: { x: number; y: number; z: number };
  remotePlayers: Map<string, RemotePlayerHUD>;
}

export function CompassBar({ rotation, playerPosition, remotePlayers }: CompassBarProps) {
  const degrees = ((-rotation * 180) / Math.PI) % 360;
  const normalized = degrees < 0 ? degrees + 360 : degrees;
  
  const directions = [
    { label: 'O', value: 270 },
    { label: 'N', value: 0 },
    { label: 'E', value: 90 },
    { label: 'S', value: 180 },
    { label: 'O', value: 270 },
    { label: 'N', value: 360 },
  ];

  const enemyAngles: number[] = [];
  remotePlayers.forEach((player) => {
    const dx = player.position.x - playerPosition.x;
    const dz = player.position.z - playerPosition.z;
    const angleFromNorth = (Math.atan2(dx, -dz) * (180 / Math.PI) + 360) % 360;
    const relativePos = (angleFromNorth - 180 + 360) % 360;
    enemyAngles.push(relativePos);
  });

  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 pointer-events-auto">
      <div className="bg-black/50 backdrop-blur-md px-6 py-2 rounded-full border border-white/10 shadow-2xl">
        <div className="relative w-64 h-8">
          {/* Línea base */}
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-white/20 -translate-y-1/2"></div>
          
          {/* Marcas y etiquetas */}
          {directions.map((dir, i) => {
            const pos = (dir.value / 360) * 100;
            const isMain = ['N', 'E', 'S', 'O'].includes(dir.label);
            return (
              <div 
                key={i}
                className="absolute top-1/2 -translate-y-1/2"
                style={{ left: `${pos}%` }}
              >
                <div className={`w-px ${isMain ? 'h-4 bg-white/60' : 'h-2 bg-white/30'} -translate-x-1/2`}></div>
                <span className={`absolute left-1/2 -translate-x-1/2 ${isMain ? 'text-xs font-bold text-white/80' : 'text-[10px] text-white/40'} -top-5`}>
                  {dir.label}
                </span>
              </div>
            );
          })}
          
          {/* Indicadores de enemigos */}
          {enemyAngles.map((angle, i) => {
            const pos = (angle / 360) * 100;
            return (
              <div
                key={`enemy-${i}`}
                className="absolute top-1/2 -translate-y-1/2 w-2 h-2 bg-red-500 rounded-full shadow-lg animate-pulse"
                style={{ left: `${pos}%`, transform: 'translate(-50%, -50%)' }}
              />
            );
          })}
          
          {/* Indicador de posición actual */}
          <div 
            className="absolute top-0 bottom-0 w-0.5 bg-green-400 -translate-x-1/2 drop-shadow-lg"
            style={{ left: `${(normalized / 360) * 100}%` }}
          >
            <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-green-400 rotate-45"></div>
          </div>
          
          {/* Valor numérico */}
          <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[10px] font-mono text-green-400">
            {Math.round(normalized)}°
          </div>
        </div>
      </div>
    </div>
  );
}