interface EnemyCounterProps {
  count: number;
}

export function EnemyCounter({ count }: EnemyCounterProps) {
  const display = count < 10 ? `0${count}` : `${count}`;

  return (
    <div className="absolute top-10 right-10 pointer-events-auto">
      <div className="bg-black/40 backdrop-blur-md px-8 py-4 rounded-2xl border border-white/10 shadow-2xl flex items-center gap-4 group hover:bg-black/60 transition-colors duration-300">
        <div className="relative flex items-center justify-center">
          <div className="absolute inset-0 bg-red-500/20 blur-lg rounded-full group-hover:bg-red-500/40 transition-all" />
          <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse border border-red-400" />
        </div>
        <div className="flex flex-col">
          <span className="text-white/40 text-[10px] font-black uppercase tracking-widest leading-none mb-1">
            Enemigos detectados
          </span>
          <span className="text-white text-3xl font-black leading-none tabular-nums tracking-tighter">
            {display}
          </span>
        </div>
      </div>
    </div>
  );
}
