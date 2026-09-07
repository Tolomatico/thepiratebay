import { useMemo } from "react";
import type { ScoreboardPlayer } from "../interfaces/player";
import { useUser } from "../context/UserContext";

interface ScoreboardModalProps {
  isOpen: boolean;
  onClose?: () => void;
  scoreboard: ScoreboardPlayer[];
  currentSocketId?: string;
  playerHealth?: number;
}

export function ScoreboardModal({
  isOpen,
  onClose,
  scoreboard,
  currentSocketId,
  playerHealth = 100,
}: ScoreboardModalProps) {
  const { username, team, shipType } = useUser();

  // Asegurar que el jugador local siempre aparezca en la lista incluso si la red aún no sincronizó
  const playersList = useMemo(() => {
    const list = [...scoreboard];
    const hasLocal = currentSocketId
      ? list.some((p) => p.id === currentSocketId)
      : list.some((p) => p.username === username);

    if (!hasLocal && username) {
      list.push({
        id: currentSocketId || "local_player",
        username,
        team: (team as any) || "blue",
        shipType: (shipType as any) || "pirate",
        kills: 0,
        deaths: 0,
        damageDealt: 0,
        health: playerHealth,
        isAlive: playerHealth > 0,
        goldInHold: 0,
      });
    }

    return list;
  }, [scoreboard, currentSocketId, username, team, shipType, playerHealth]);

  const bluePlayers = useMemo(
    () => playersList.filter((p) => p.team === "blue"),
    [playersList]
  );
  const redPlayers = useMemo(
    () => playersList.filter((p) => p.team === "red"),
    [playersList]
  );

  const blueKills = useMemo(
    () => bluePlayers.reduce((sum, p) => sum + (p.kills || 0), 0),
    [bluePlayers]
  );
  const redKills = useMemo(
    () => redPlayers.reduce((sum, p) => sum + (p.kills || 0), 0),
    [redPlayers]
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in select-none pointer-events-auto">
      <div className="relative w-full max-w-5xl bg-gradient-to-b from-slate-900/95 via-slate-950/95 to-[#060b11]/95 border-2 border-amber-600/40 rounded-2xl shadow-[0_0_60px_rgba(0,0,0,0.8),0_0_25px_rgba(217,119,6,0.15)] overflow-hidden text-slate-100 flex flex-col max-h-[90vh]">
        {/* Decorative corner accents */}
        <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-amber-400/80 rounded-tl-2xl pointer-events-none"></div>
        <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-amber-400/80 rounded-tr-2xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-amber-400/80 rounded-bl-2xl pointer-events-none"></div>
        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-amber-400/80 rounded-br-2xl pointer-events-none"></div>

        {/* Header */}
        <div className="px-6 py-4 border-b border-amber-500/20 bg-gradient-to-r from-blue-950/40 via-slate-900 to-red-950/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">⚔️</span>
            <div>
              <h2 className="text-xl font-black uppercase tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-200">
                Marcador de Combate Naval
              </h2>
              <p className="text-[11px] text-amber-400/70 font-semibold tracking-widest uppercase">
                Estado de las Escuadras
              </p>
            </div>
          </div>

          {/* Marcador Global de Bajas */}
          <div className="flex items-center gap-6 px-6 py-2 bg-slate-950/80 border border-slate-800 rounded-xl">
            <div className="flex items-center gap-2 text-blue-400 font-black text-lg">
              <span className="text-xs uppercase font-bold tracking-wider">Armada Azul</span>
              <span className="px-2 py-0.5 bg-blue-950/80 border border-blue-800/80 rounded-lg text-blue-300">
                {blueKills}
              </span>
            </div>
            <span className="text-slate-600 font-black">VS</span>
            <div className="flex items-center gap-2 text-red-400 font-black text-lg">
              <span className="px-2 py-0.5 bg-red-950/80 border border-red-800/80 rounded-lg text-red-300">
                {redKills}
              </span>
              <span className="text-xs uppercase font-bold tracking-wider">Imperio Rojo</span>
            </div>
          </div>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800/60 transition-colors cursor-pointer"
              title="Cerrar marcador"
            >
              ✕
            </button>
          )}
        </div>

        {/* Tables Section (Split Teams) */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 overflow-y-auto">
          {/* Blue Fleet Column */}
          <div className="flex flex-col gap-3 bg-blue-950/20 border border-blue-900/40 rounded-xl p-4">
            <div className="flex items-center justify-between pb-2 border-b border-blue-800/30">
              <div className="flex items-center gap-2">
                <span className="text-lg">🛡️</span>
                <span className="font-extrabold text-sm uppercase tracking-wider text-blue-300">
                  Armada Azul ({bluePlayers.length})
                </span>
              </div>
              <span className="text-xs font-semibold text-blue-400/80">
                {blueKills} {blueKills === 1 ? "Baja" : "Bajas"}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-slate-400 uppercase font-bold border-b border-slate-800 text-[10px]">
                    <th className="py-2 px-2 text-left">Capitán</th>
                    <th className="py-2 px-1 text-center">Navío</th>
                    <th className="py-2 px-1 text-center" title="Bajas / Kills">⚔️ K</th>
                    <th className="py-2 px-1 text-center" title="Muertes / Deaths">☠️ D</th>
                    <th className="py-2 px-1 text-center" title="Daño Infligido">💥 Daño</th>
                    <th className="py-2 px-1 text-center" title="Oro en Bodega (Riesgo al morir)">🪙 Oro</th>
                    <th className="py-2 px-2 text-right">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/40">
                  {bluePlayers.length > 0 ? (
                    bluePlayers.map((player) => {
                      const isMe = currentSocketId
                        ? player.id === currentSocketId
                        : player.username === username;
                      return (
                        <tr
                          key={player.id}
                          className={`hover:bg-blue-900/20 transition-colors ${
                            isMe ? "bg-amber-500/10 font-bold" : ""
                          }`}
                        >
                          <td className="py-2.5 px-2 flex items-center gap-1.5">
                            <span className="text-white truncate max-w-[180px]">
                              {player.username}
                            </span>
                            {isMe && (
                              <span className="text-[9px] px-1.5 py-0.2 bg-amber-500/20 border border-amber-500/40 text-amber-300 rounded uppercase font-extrabold">
                                Tú
                              </span>
                            )}
                          </td>
                          <td className="py-2.5 px-1 text-center text-slate-300 capitalize">
                            {player.shipType === "fragate" ? "Fragata" : "Pirata"}
                          </td>
                          <td className="py-2.5 px-1 text-center font-bold text-emerald-400">
                            {player.kills || 0}
                          </td>
                          <td className="py-2.5 px-1 text-center font-bold text-rose-400">
                            {player.deaths || 0}
                          </td>
                          <td className="py-2.5 px-1 text-center text-amber-300 font-mono">
                            {player.damageDealt || 0}
                          </td>
                          <td className="py-2.5 px-1 text-center text-yellow-400 font-mono font-bold">
                            {player.goldInHold || 0}
                          </td>
                          <td className="py-2.5 px-2 text-right">
                            {player.isAlive ? (
                              <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-semibold">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                                A flote
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[10px] text-slate-500">
                                ☠️ Hundido
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={7} className="py-6 text-center text-slate-500 italic">
                        No hay navíos azules en combate
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Red Fleet Column */}
          <div className="flex flex-col gap-3 bg-red-950/20 border border-red-900/40 rounded-xl p-4">
            <div className="flex items-center justify-between pb-2 border-b border-red-800/30">
              <div className="flex items-center gap-2">
                <span className="text-lg">🏴‍☠️</span>
                <span className="font-extrabold text-sm uppercase tracking-wider text-red-300">
                  Imperio Rojo ({redPlayers.length})
                </span>
              </div>
              <span className="text-xs font-semibold text-red-400/80">
                {redKills} {redKills === 1 ? "Baja" : "Bajas"}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-slate-400 uppercase font-bold border-b border-slate-800 text-[10px]">
                    <th className="py-2 px-2 text-left">Capitán</th>
                    <th className="py-2 px-1 text-center">Navío</th>
                    <th className="py-2 px-1 text-center" title="Bajas / Kills">⚔️ K</th>
                    <th className="py-2 px-1 text-center" title="Muertes / Deaths">☠️ D</th>
                    <th className="py-2 px-1 text-center" title="Daño Infligido">💥 Daño</th>
                    <th className="py-2 px-1 text-center" title="Oro en Bodega (Riesgo al morir)">🪙 Oro</th>
                    <th className="py-2 px-2 text-right">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/40">
                  {redPlayers.length > 0 ? (
                    redPlayers.map((player) => {
                      const isMe = currentSocketId
                        ? player.id === currentSocketId
                        : player.username === username;
                      return (
                        <tr
                          key={player.id}
                          className={`hover:bg-red-900/20 transition-colors ${
                            isMe ? "bg-amber-500/10 font-bold" : ""
                          }`}
                        >
                          <td className="py-2.5 px-2 flex items-center gap-1.5">
                            <span className="text-white truncate max-w-[180px]">
                              {player.username}
                            </span>
                            {isMe && (
                              <span className="text-[9px] px-1.5 py-0.2 bg-amber-500/20 border border-amber-500/40 text-amber-300 rounded uppercase font-extrabold">
                                Tú
                              </span>
                            )}
                          </td>
                          <td className="py-2.5 px-1 text-center text-slate-300 capitalize">
                            {player.shipType === "fragate" ? "Fragata" : "Pirata"}
                          </td>
                          <td className="py-2.5 px-1 text-center font-bold text-emerald-400">
                            {player.kills || 0}
                          </td>
                          <td className="py-2.5 px-1 text-center font-bold text-rose-400">
                            {player.deaths || 0}
                          </td>
                          <td className="py-2.5 px-1 text-center text-amber-300 font-mono">
                            {player.damageDealt || 0}
                          </td>
                          <td className="py-2.5 px-1 text-center text-yellow-400 font-mono font-bold">
                            {player.goldInHold || 0}
                          </td>
                          <td className="py-2.5 px-2 text-right">
                            {player.isAlive ? (
                              <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-semibold">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                                A flote
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[10px] text-slate-500">
                                ☠️ Hundido
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={7} className="py-6 text-center text-slate-500 italic">
                        No hay navíos rojos en combate
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer info banner */}
        <div className="px-6 py-3 bg-slate-950/90 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-2">
            <span className="px-1.5 py-0.5 bg-slate-800 text-amber-300 rounded border border-slate-700 font-mono font-bold">
              TAB
            </span>
            <span>Mantén presionado o pulsa para alternar el marcador</span>
          </div>
          <div className="text-slate-500">
            K = Bajas &nbsp;|&nbsp; D = Hundimientos &nbsp;|&nbsp; Daño = Puntos de ataque
          </div>
        </div>
      </div>
    </div>
  );
}
