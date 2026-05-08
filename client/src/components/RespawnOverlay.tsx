interface RespawnOverlayProps {
  countdown: number;
}

export function RespawnOverlay({ countdown }: RespawnOverlayProps) {
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      <div className="flex flex-col items-center animate-in fade-in zoom-in duration-500">
        <div className="bg-black/60 backdrop-blur-xl border border-white/10 px-12 py-8 rounded-[2.5rem] shadow-2xl flex flex-col items-center gap-2 transform hover:scale-105 transition-transform duration-300">
          <span className="text-white/50 text-sm font-bold uppercase tracking-[0.3em] animate-pulse">
            Resurgiendo en
          </span>
          <div className="text-8xl font-black text-white tabular-nums tracking-tighter drop-shadow-lg">
            {countdown}
          </div>
          <span className="text-white/30 text-xs font-medium uppercase tracking-widest">
            Segundos
          </span>
        </div>
      </div>
    </div>
  );
}
