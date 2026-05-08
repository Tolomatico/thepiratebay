import { useEffect, useRef } from "react";
import type { EnemyHealthBar } from "../context/HudContext";

export function EnemyBar({ bar, healthBarRefs }: { bar: EnemyHealthBar, healthBarRefs: React.MutableRefObject<Map<string, HTMLDivElement>> }) {
  const elRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (elRef.current) {
      healthBarRefs.current.set(bar.id, elRef.current);
    }
    return () => {
      healthBarRefs.current.delete(bar.id);
    };
  }, [bar.id]);

  return (
    <div 
      ref={elRef}
      className="absolute flex flex-col items-center gap-1"
      style={{ 
        display: bar.visible ? 'flex' : 'none',
        transform: 'translate(-50%, -100%)',
        willChange: 'transform, left, top'
      }}
    >
      {bar.username && (
        <span className="text-center text-[10px] font-bold text-white uppercase tracking-wider drop-shadow-md bg-black/40 px-1.5 py-0.5 rounded backdrop-blur-sm border border-white/10">
          {bar.username}
        </span>
      )}
      <div className="w-16 h-1.5 bg-black/50 border border-white/20 rounded-full overflow-hidden shadow-lg">
        <div 
          className={`h-full transition-all duration-300 ${
            bar.healthRatio < 0.3 ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]' : 
            bar.healthRatio < 0.6 ? 'bg-yellow-400 shadow-[0_0_8px_rgba(250,204,21,0.6)]' : 
            'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]'
          }`}
          style={{ width: `${bar.healthRatio * 100}%` }}
        />
      </div>
    </div>
  );
}