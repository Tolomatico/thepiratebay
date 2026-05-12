interface CompassProps {
  rotation: number;
}

export function Compass({ rotation }: CompassProps) {
  const degrees = Math.round((rotation * 180) / Math.PI);
  const normalized = ((degrees % 360) + 360) % 360;
  
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const index = Math.round(normalized / 45) % 8;
  const direction = directions[index];

  return (
    <div className="absolute top-10 left-10 flex flex-col items-center pointer-events-auto">
      <div className="bg-black/40 backdrop-blur-md p-3 rounded-2xl border border-white/10 shadow-2xl">
        <div className="relative w-16 h-16 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border-2 border-white/20"></div>
          <div 
            className="w-0 h-0 border-l-[20px] border-l-transparent border-r-[20px] border-r-transparent border-b-[30px] border-b-green-400 drop-shadow-lg transition-transform duration-200"
            style={{ transform: `rotate(${-rotation}rad)` }}
          ></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-1 h-1 bg-white rounded-full"></div>
          </div>
        </div>
        <div className="text-center mt-2">
          <span className="text-white/60 text-[10px] font-bold uppercase tracking-wider">Rumbo</span>
          <div className="text-white font-mono text-sm font-bold">{direction}</div>
          <div className="text-gray-400 text-[10px]">{normalized}°</div>
        </div>
      </div>
    </div>
  );
}