import { useEffect, useState, useRef } from "react";

interface MatchGoldWidgetProps {
  goldInHold: number;
}

export function MatchGoldWidget({ goldInHold }: MatchGoldWidgetProps) {
  const [prevGold, setPrevGold] = useState(goldInHold);
  const [deltaAnim, setDeltaAnim] = useState<{ amount: number; id: number } | null>(null);
  const animCounter = useRef(0);

  useEffect(() => {
    if (goldInHold !== prevGold) {
      const diff = goldInHold - prevGold;
      animCounter.current += 1;
      setDeltaAnim({ amount: diff, id: animCounter.current });
      setPrevGold(goldInHold);

      const timer = setTimeout(() => {
        setDeltaAnim((curr) => (curr?.id === animCounter.current ? null : curr));
      }, 1800);

      return () => clearTimeout(timer);
    }
  }, [goldInHold, prevGold]);

  const potentialLoss = Math.floor(goldInHold * 0.5);

  return (
    <div className="relative group pointer-events-auto select-none">
      {/* Indicador flotante de incremento/pérdida */}
      {deltaAnim && (
        <div
          key={deltaAnim.id}
          className={`absolute -top-7 left-8 px-2 py-0.5 rounded-full text-xs font-black font-mono tracking-wider backdrop-blur-md border animate-bounce z-20 ${
            deltaAnim.amount > 0
              ? "bg-amber-500/20 text-yellow-300 border-yellow-500/40 shadow-[0_0_12px_rgba(234,179,8,0.5)]"
              : "bg-red-500/20 text-red-300 border-red-500/40 shadow-[0_0_12px_rgba(239,68,68,0.5)]"
          }`}
        >
          {deltaAnim.amount > 0 ? `+${deltaAnim.amount} 🪙` : `${deltaAnim.amount} 🪙`}
        </div>
      )}

      {/* Tarjeta de Bodega de Oro */}
      <div className="bg-gradient-to-r from-slate-950/90 via-slate-900/85 to-amber-950/30 backdrop-blur-md px-3.5 py-2.5 rounded-2xl border border-amber-500/30 hover:border-amber-400/60 w-72 shadow-2xl flex items-center justify-between transition-all duration-300 hover:shadow-[0_0_20px_rgba(245,158,11,0.15)]">
        {/* Lado Izquierdo: Botín acumulado */}
        <div className="flex items-center gap-3">
          <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400/20 to-yellow-600/20 border border-amber-500/40 flex items-center justify-center text-lg shadow-inner">
            <span>🪙</span>
            <span className="absolute -top-1 -right-1 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
            </span>
          </div>

          <div className="flex flex-col">
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-amber-300/80">
              Botín en Bodega
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="font-mono text-xl font-black text-amber-200 tracking-tight drop-shadow-sm">
                {goldInHold.toLocaleString()}
              </span>
              <span className="text-[10px] text-amber-400/90 font-extrabold uppercase tracking-wider">
                oro
              </span>
            </div>
          </div>
        </div>

        {/* Lado Derecho: Riesgo al hundirse */}
        <div className="flex flex-col items-end text-right pl-2 border-l border-white/5">
          <span className="text-[8px] uppercase font-bold text-red-400/90 flex items-center gap-1 tracking-wider">
            <span className="text-[10px]">💀</span> Riesgo
          </span>
          <div className="flex items-center gap-1">
            <span className="text-xs font-mono font-black text-red-400 drop-shadow-sm">
              -{potentialLoss}
            </span>
            <span className="text-[9px] text-red-400/80 font-bold">(-50%)</span>
          </div>
          <span className="text-[8px] text-slate-400 font-medium">al ser destruido</span>
        </div>
      </div>
    </div>
  );
}
