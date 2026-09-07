import type { MatchResult } from "../interfaces/match";

interface PostMatchModalProps {
  result: MatchResult;
  currentSocketId?: string;
  onLeave: () => void;
}

export function PostMatchModal({
  result,
  currentSocketId,
  onLeave,
}: PostMatchModalProps) {
  const myPlayer = result.players.find((p) => p.id === currentSocketId);
  const isWinner = myPlayer ? myPlayer.isWinner : false;
  const isDraw = result.winnerTeam === "draw";

  const bluePlayers = result.players.filter((p) => p.team === "blue");
  const redPlayers = result.players.filter((p) => p.team === "red");

  const durationMin = Math.floor(result.durationSec / 60);
  const durationRemSec = result.durationSec % 60;
  const durationStr = `${durationMin}:${durationRemSec.toString().padStart(2, "0")}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-xl animate-fade-in font-sans">
      {/* Glow ambiental */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {isWinner ? (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-amber-500/15 blur-[160px] rounded-full" />
        ) : (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-red-900/15 blur-[160px] rounded-full" />
        )}
      </div>

      <div
        className={`relative w-full max-w-4xl max-h-[90vh] overflow-y-auto flex flex-col rounded-3xl border shadow-2xl p-6 sm:p-8 backdrop-blur-2xl transition-all ${
          isWinner
            ? "bg-gradient-to-b from-slate-900/95 via-slate-950/95 to-slate-950/98 border-amber-500/50 shadow-amber-500/10"
            : "bg-gradient-to-b from-slate-900/95 via-slate-950/95 to-slate-950/98 border-red-800/50 shadow-red-950/30"
        }`}
      >
        {/* Cabecera Épica */}
        <div className="flex flex-col items-center text-center gap-2 mb-6">
          <div className="flex items-center gap-3">
            <span className="text-3xl sm:text-4xl">
              {isWinner ? "👑" : isDraw ? "⚖️" : "💀"}
            </span>
            <h1
              className={`font-pirate text-3xl sm:text-5xl font-black uppercase tracking-wider ${
                isWinner
                  ? "text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-200 to-yellow-400 drop-shadow-[0_2px_15px_rgba(245,158,11,0.5)]"
                  : isDraw
                  ? "text-slate-200"
                  : "text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-rose-300 to-red-500 drop-shadow-[0_2px_15px_rgba(239,68,68,0.5)]"
              }`}
            >
              {isWinner
                ? "¡VICTORIA PIRATA!"
                : isDraw
                ? "EMPATE EN ALTA MAR"
                : "¡DERROTA NAVAL!"}
            </h1>
            <span className="text-3xl sm:text-4xl">
              {isWinner ? "👑" : isDraw ? "⚖️" : "💀"}
            </span>
          </div>

          <p className="text-slate-400 text-xs sm:text-sm font-medium">
            {isWinner
              ? "Tu escuadra dominó las aguas del Caribe y se alzó con la gloria."
              : isDraw
              ? "Ninguna escuadra cedió un palmo de océano."
              : "Tus navíos sucumbieron ante la potencia de fuego enemiga. ¡Toma tu revancha!"}
          </p>
        </div>

        {/* Marcador Global de Escuadras */}
        <div className="grid grid-cols-3 items-center bg-slate-950/60 border border-slate-800/80 rounded-2xl px-4 py-3 mb-6 shadow-inner">
          {/* Armada Azul */}
          <div className="flex flex-col items-center gap-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-[0_0_8px_#3b82f6]" />
              <span className="text-xs sm:text-sm font-bold text-blue-300 uppercase tracking-wider">
                Armada Azul
              </span>
            </div>
            <span className="text-2xl sm:text-4xl font-extrabold text-blue-400 font-mono">
              {result.blueKills}
            </span>
          </div>

          {/* Centro: Info de partida */}
          <div className="flex flex-col items-center text-center gap-0.5">
            <span className="text-[10px] uppercase tracking-widest text-slate-500 font-extrabold">
              Meta: {result.targetKills} Bajas
            </span>
            <span className="text-xs text-slate-400 font-mono bg-slate-900/90 px-2 py-0.5 rounded border border-slate-800">
              ⏱ {durationStr}
            </span>
            <span className="text-[10px] text-slate-500 italic mt-0.5">
              {result.lobbyName}
            </span>
          </div>

          {/* Imperio Rojo */}
          <div className="flex flex-col items-center gap-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_8px_#ef4444]" />
              <span className="text-xs sm:text-sm font-bold text-red-300 uppercase tracking-wider">
                Imperio Rojo
              </span>
            </div>
            <span className="text-2xl sm:text-4xl font-extrabold text-red-400 font-mono">
              {result.redKills}
            </span>
          </div>
        </div>

        {/* Recompensas del Jugador Local (Tarjeta Principal) */}
        {myPlayer && (
          <div className="bg-gradient-to-r from-amber-500/10 via-slate-900/80 to-amber-500/10 border border-amber-500/30 rounded-2xl p-4 sm:p-5 mb-6 shadow-lg">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-2xl shadow-inner">
                  💰
                </div>
                <div className="flex flex-col">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-amber-300">
                    Tu Botín de Combate
                  </span>
                  <span className="text-base sm:text-lg font-extrabold text-slate-100">
                    Capitán {myPlayer.username}
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {myPlayer.kills} Bajas • {myPlayer.deaths} Muertes • {myPlayer.damageDealt} Daño
                  </span>
                </div>
              </div>

              {/* Contadores de Oro y XP */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 px-4 py-2 bg-amber-500/20 border border-amber-500/50 rounded-xl shadow-md">
                  <span className="text-xl">🪙</span>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-amber-300 uppercase font-bold">Oro Ganado</span>
                    <span className="text-lg sm:text-xl font-black text-amber-200">
                      +{myPlayer.goldEarned}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 border border-blue-500/50 rounded-xl shadow-md">
                  <span className="text-xl">⚡</span>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-blue-300 uppercase font-bold">Experiencia</span>
                    <span className="text-lg sm:text-xl font-black text-blue-200">
                      +{myPlayer.xpEarned} XP
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Cuadro de Honor: MVPs */}
        {(result.mvpKiller || result.mvpDamage) && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
            {result.mvpKiller && (
              <div className="flex items-center gap-3 p-3 bg-slate-950/70 border border-amber-500/30 rounded-xl">
                <div className="text-2xl">👑</div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-300">
                    {result.mvpKiller.title}
                  </span>
                  <span className="text-xs font-bold text-slate-200">
                    {result.mvpKiller.username}{" "}
                    <span className="text-slate-400 font-normal">
                      ({result.mvpKiller.value} bajas)
                    </span>
                  </span>
                </div>
              </div>
            )}

            {result.mvpDamage && (
              <div className="flex items-center gap-3 p-3 bg-slate-950/70 border border-rose-500/30 rounded-xl">
                <div className="text-2xl">💥</div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-rose-300">
                    {result.mvpDamage.title}
                  </span>
                  <span className="text-xs font-bold text-slate-200">
                    {result.mvpDamage.username}{" "}
                    <span className="text-slate-400 font-normal">
                      ({result.mvpDamage.value} daño)
                    </span>
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tabla Resumen de Tripulaciones */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          {/* Armada Azul */}
          <div className="flex flex-col bg-slate-950/50 border border-blue-900/40 rounded-xl p-3">
            <span className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <span>🛡️</span> Armada Azul ({bluePlayers.length})
            </span>
            <div className="space-y-1.5">
              {bluePlayers.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between text-xs py-1 px-2 rounded bg-slate-900/50"
                >
                  <span className="text-slate-200 font-medium truncate max-w-[140px]">
                    {p.username} {p.id === currentSocketId && <span className="text-amber-400 font-bold">(Tú)</span>}
                  </span>
                  <div className="flex items-center gap-2 font-mono text-[11px] text-slate-400">
                    <span>⚔️ {p.kills}</span>
                    <span>💀 {p.deaths}</span>
                    <span className="text-amber-300 font-semibold">🪙 +{p.goldEarned}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Imperio Rojo */}
          <div className="flex flex-col bg-slate-950/50 border border-red-900/40 rounded-xl p-3">
            <span className="text-xs font-bold text-red-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <span>☠️</span> Imperio Rojo ({redPlayers.length})
            </span>
            <div className="space-y-1.5">
              {redPlayers.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between text-xs py-1 px-2 rounded bg-slate-900/50"
                >
                  <span className="text-slate-200 font-medium truncate max-w-[140px]">
                    {p.username} {p.id === currentSocketId && <span className="text-amber-400 font-bold">(Tú)</span>}
                  </span>
                  <div className="flex items-center gap-2 font-mono text-[11px] text-slate-400">
                    <span>⚔️ {p.kills}</span>
                    <span>💀 {p.deaths}</span>
                    <span className="text-amber-300 font-semibold">🪙 +{p.goldEarned}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Botón de Acción Principal */}
        <div className="flex items-center justify-center pt-2">
          <button
            type="button"
            onClick={onLeave}
            className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-sm uppercase tracking-widest rounded-xl shadow-xl shadow-amber-500/20 hover:shadow-amber-500/40 transition-all transform hover:scale-105 active:scale-95 cursor-pointer"
          >
            ⚓ Volver a la Taberna de Salas
          </button>
        </div>
      </div>
    </div>
  );
}
