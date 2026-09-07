import { useState } from "react";
import { useUser } from "../context/UserContext";

interface GamePauseMenuProps {
  isOpen: boolean;
  onResume: () => void;
  onLeaveGame: () => void;
}

export function GamePauseMenu({ isOpen, onResume, onLeaveGame }: GamePauseMenuProps) {
  const [confirmLeave, setConfirmLeave] = useState(false);
  const { username, team, shipType } = useUser();

  const handleResume = () => {
    setConfirmLeave(false);
    onResume();
  };

  const handleLeave = () => {
    setConfirmLeave(false);
    onLeaveGame();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 backdrop-blur-md animate-fade-in p-4 select-none">
      <div className="relative w-full max-w-lg bg-gradient-to-b from-slate-900/95 via-slate-900/90 to-slate-950/95 border-2 border-amber-600/40 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.8),0_0_20px_rgba(217,119,6,0.2)] overflow-hidden text-slate-100">
        {/* Decorative corner accents */}
        <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-amber-400/80 rounded-tl-2xl"></div>
        <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-amber-400/80 rounded-tr-2xl"></div>
        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-amber-400/80 rounded-bl-2xl"></div>
        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-amber-400/80 rounded-br-2xl"></div>

        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-amber-500/20 text-center relative bg-gradient-to-r from-amber-500/5 via-amber-500/10 to-amber-500/5">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/30 text-2xl mb-2 text-amber-400 shadow-inner">
            ⚓
          </div>
          <h2 className="text-2xl font-black uppercase tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-200">
            {confirmLeave ? "¿Abandonar la Batalla?" : "Cuaderno de Bitácora"}
          </h2>
          <p className="text-xs text-amber-400/70 font-semibold tracking-widest uppercase mt-1">
            {confirmLeave ? "Confirmación de retirada" : "Juego en Pausa"}
          </p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {!confirmLeave ? (
            <>
              {/* Player battle status badge */}
              <div className="flex items-center justify-between p-3.5 bg-slate-950/60 border border-slate-800 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="text-xl">🏴‍☠️</div>
                  <div>
                    <div className="text-sm font-bold text-white leading-tight">{username || "Capitán"}</div>
                    <div className="text-[11px] text-slate-400">
                      Navío: <span className="text-amber-300 capitalize">{shipType === "fragate" ? "Fragata de Guerra" : "Galeón Pirata"}</span>
                    </div>
                  </div>
                </div>
                <span className={`px-2.5 py-1 text-xs font-bold rounded-lg border uppercase tracking-wide ${
                  team === "red" 
                    ? "bg-red-950/50 text-red-400 border-red-800/60" 
                    : "bg-blue-950/50 text-blue-400 border-blue-800/60"
                }`}>
                  {team === "red" ? "Imperio Rojo" : "Armada Azul"}
                </span>
              </div>

              {/* Controls Quick Guide */}
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Controles de Navío</span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-950/40 border border-slate-800/60">
                    <span className="px-1.5 py-0.5 font-mono font-bold bg-slate-800 text-amber-300 rounded border border-slate-700">W/S</span>
                    <span className="text-slate-300">Velas & Velocidad</span>
                  </div>
                  <div className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-950/40 border border-slate-800/60">
                    <span className="px-1.5 py-0.5 font-mono font-bold bg-slate-800 text-amber-300 rounded border border-slate-700">A/D</span>
                    <span className="text-slate-300">Timón de Rumbo</span>
                  </div>
                  <div className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-950/40 border border-slate-800/60">
                    <span className="px-1.5 py-0.5 font-mono font-bold bg-slate-800 text-amber-300 rounded border border-slate-700">ESP</span>
                    <span className="text-slate-300">Cañones Proa</span>
                  </div>
                  <div className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-950/40 border border-slate-800/60">
                    <span className="px-1.5 py-0.5 font-mono font-bold bg-slate-800 text-amber-300 rounded border border-slate-700">Q/E</span>
                    <span className="text-slate-300">Andanadas Banda</span>
                  </div>
                </div>
              </div>

              {/* Main Actions */}
              <div className="pt-2 space-y-3">
                <button
                  type="button"
                  onClick={handleResume}
                  className="w-full py-3.5 px-4 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 active:scale-[0.98] text-white font-bold rounded-xl shadow-[0_4px_20px_rgba(16,185,129,0.3)] transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>⚔️ Reanudar Batalla</span>
                  <span className="text-xs bg-emerald-700/60 px-2 py-0.5 rounded text-emerald-200">[ESC]</span>
                </button>

                <button
                  type="button"
                  onClick={() => setConfirmLeave(true)}
                  className="w-full py-3 px-4 bg-slate-900 hover:bg-red-950/40 text-slate-300 hover:text-red-400 border border-slate-800 hover:border-red-800/60 rounded-xl transition-all font-semibold text-sm flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>🚪 Abandonar Partida</span>
                </button>
              </div>
            </>
          ) : (
            /* Confirmation View */
            <div className="space-y-5 text-center">
              <div className="p-4 rounded-xl bg-red-950/30 border border-red-800/50 space-y-2">
                <div className="text-3xl">⚠️</div>
                <p className="text-sm text-red-200 font-medium">
                  ¿Seguro que deseas volver a puerto seguro?
                </p>
                <p className="text-xs text-slate-400">
                  Tu barco se retirará del combate y perderás tu posición actual en este enfrentamiento.
                </p>
              </div>

              <div className="space-y-3">
                <button
                  type="button"
                  onClick={handleLeave}
                  className="w-full py-3.5 px-4 bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 active:scale-[0.98] text-white font-bold rounded-xl shadow-[0_4px_20px_rgba(225,29,72,0.4)] transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>⚓ Sí, Abandonar y Volver a Salas</span>
                </button>

                <button
                  type="button"
                  onClick={() => setConfirmLeave(false)}
                  className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl border border-slate-800 transition-all font-semibold text-sm cursor-pointer"
                >
                  Cancelar y Continuar Combatiendo
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
