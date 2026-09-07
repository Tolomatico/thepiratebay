import { useEffect, useState } from "react";
import { useNetwork } from "../context/NetworkContext";
import type { KillEvent } from "../interfaces/chat";

interface KillfeedProps {
  currentSocketId?: string;
}

interface ActiveKill extends KillEvent {
  fading?: boolean;
}

export function Killfeed({ currentSocketId }: KillfeedProps) {
  const [kills, setKills] = useState<ActiveKill[]>([]);
  const network = useNetwork();

  useEffect(() => {
    const handleKill = (kill: KillEvent) => {
      const newKill: ActiveKill = { ...kill, fading: false };
      setKills((prev) => [...prev.slice(-4), newKill]);

      // Iniciar desvanecimiento a los 4.5 segundos
      setTimeout(() => {
        setKills((prev) =>
          prev.map((k) => (k.id === kill.id ? { ...k, fading: true } : k))
        );
      }, 4500);

      // Eliminar definitivamente a los 5 segundos
      setTimeout(() => {
        setKills((prev) => prev.filter((k) => k.id !== kill.id));
      }, 5000);
    };

    network.onPlayerKilled(handleKill);
    return () => {
      network.offPlayerKilled(handleKill);
    };
  }, [network]);

  if (kills.length === 0) return null;

  return (
    <div className="flex flex-col gap-1.5 items-end pointer-events-none select-none">
      {kills.map((kill) => {
        const isKillerMe = kill.killerId === currentSocketId;
        const isVictimMe = kill.victimId === currentSocketId;

        const killerColor =
          kill.killerTeam === "red"
            ? "text-red-400 font-bold"
            : kill.killerTeam === "blue"
            ? "text-blue-400 font-bold"
            : "text-amber-300 font-bold";

        const victimColor =
          kill.victimTeam === "red"
            ? "text-red-400 font-bold"
            : "text-blue-400 font-bold";

        return (
          <div
            key={kill.id}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs shadow-lg backdrop-blur-md transition-all duration-500 transform ${
              kill.fading
                ? "opacity-0 translate-x-4 scale-95"
                : "opacity-100 translate-x-0 scale-100"
            } ${
              isKillerMe
                ? "bg-slate-950/90 border-amber-500/60 shadow-amber-500/10"
                : isVictimMe
                ? "bg-red-950/90 border-red-500/60 shadow-red-500/10"
                : "bg-slate-950/80 border-slate-800/80"
            }`}
          >
            {/* Killer */}
            <div className="flex items-center gap-1">
              <span className={killerColor}>{kill.killerName}</span>
              {isKillerMe && (
                <span className="text-[9px] px-1 py-0.2 bg-amber-500/20 text-amber-300 rounded border border-amber-500/40 font-mono font-bold">
                  TÚ
                </span>
              )}
            </div>

            {/* Weapon / Action Icon */}
            <div className="flex items-center text-slate-400">
              <span className="text-sm">💥</span>
            </div>

            {/* Victim */}
            <div className="flex items-center gap-1">
              <span className={victimColor}>{kill.victimName}</span>
              {isVictimMe && (
                <span className="text-[9px] px-1 py-0.2 bg-red-500/20 text-red-300 rounded border border-red-500/40 font-mono font-bold">
                  TÚ
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
