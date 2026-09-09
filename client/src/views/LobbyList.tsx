import { useEffect, useState } from "react";
import { useNetwork } from "../context/NetworkContext";
import { useUser } from "../context/UserContext";
import type { ILobby } from "../interfaces/lobby";
import { ShipUpgradesModal } from "../components/upgrades/ShipUpgradesModal";
import { GoldShopModal } from "../components/shop/GoldShopModal";

interface LobbyListProps {
  onJoin: (lobby: ILobby) => void
  onCreate: (lobby: ILobby) => void
  onBack?: () => void
}

export default function LobbyList({ onCreate, onJoin, onBack }: LobbyListProps) {
  const [lobbyName, setLobbyName] = useState("")
  const [maxPlayers, setMaxPlayers] = useState(2)
  const [creating, setCreating] = useState(false)
  const [isUpgradesOpen, setIsUpgradesOpen] = useState(false)
  const [isShopOpen, setIsShopOpen] = useState(false)

  const network = useNetwork();
  const { username, isGuest, gold, level } = useUser();
  const [lobbies, setLobbies] = useState<ILobby[]>([]);

  useEffect(() => {
    network.getLobbies(data => setLobbies(data))
    network.onLobbiesUpdated((data) => setLobbies(data));

     return () => {
    network.socket.off("lobbiesUpdated")
  }
  }, [])

  const handleCreate = () => {
    if (!lobbyName.trim()) return;
    network.createLobby(username, lobbyName, maxPlayers, (lobby) => {
    network.setLobbyId(lobby.id); 
      onCreate(lobby);
    });
    setCreating(false)
    setLobbyName("")
    setMaxPlayers(2)
  }

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen gap-6 bg-slate-950 p-4">
      {/* Barra superior de estado del jugador */}
      <div className="absolute top-4 left-4 right-4 max-w-5xl mx-auto flex items-center justify-between px-5 py-2.5 bg-slate-900/90 border border-slate-800 rounded-xl backdrop-blur-md shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-base">
            ⚓
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-slate-100">{username || "Capitán Anónimo"}</span>
              <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${
                isGuest 
                  ? "bg-amber-950/40 text-amber-300 border-amber-800/60" 
                  : "bg-emerald-950/40 text-emerald-300 border-emerald-800/60"
              }`}>
                {isGuest ? "Invitado" : "Capitán"}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Botón Astillero / Mejoras de Nivel */}
          <button
            onClick={() => setIsUpgradesOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-cyan-950/60 hover:bg-cyan-900/60 border border-cyan-500/40 hover:border-cyan-400/70 text-cyan-200 text-xs font-bold transition-all shadow-sm hover:shadow-cyan-500/20 active:scale-95 cursor-pointer"
            title="Abrir Astillero y Mejoras por Nivel"
          >
            <span>🛠️</span>
            <span>Astillero</span>
            <span className="px-1.5 py-0.2 rounded-full bg-cyan-500/20 text-cyan-300 font-mono text-[10px]">
              Nv. {level}
            </span>
          </button>

          {/* Botón Mercado Negro / Tienda de Oro */}
          <button
            onClick={() => setIsShopOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-950/60 hover:bg-amber-900/60 border border-amber-500/50 hover:border-amber-400/80 text-amber-200 text-xs font-bold transition-all shadow-sm hover:shadow-amber-500/20 active:scale-95 cursor-pointer"
            title="Abrir Tienda Pirata y Bazar de Oro"
          >
            <span>🪙</span>
            <span className="font-mono">{gold}</span>
            <span className="text-amber-400/80 text-[10px] uppercase font-bold">Tienda</span>
          </button>

          {onBack && (
            <button
              onClick={onBack}
              className="text-xs text-slate-400 hover:text-slate-100 px-3 py-1.5 rounded-lg border border-slate-800 hover:border-slate-700 bg-slate-950/60 transition-all cursor-pointer"
            >
              Cambiar Capitán
            </button>
          )}
        </div>
      </div>

      <h1 className="font-pirate text-3xl md:text-4xl text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-400 font-bold uppercase tracking-wider mt-12">
        Salas de Combate
      </h1>

      {/* Formulario crear lobby */}
      {creating ? (
        <div className="flex flex-col gap-4 bg-gray-800 border-2 border-gray-700 rounded-md p-8 w-80 shadow-lg">
          <h2 className="text-lg text-gray-100 uppercase tracking-wide font-bold text-center">Nuevo Lobby</h2>

          <div className="flex flex-col gap-1">
            <label className="text-sm text-gray-400 uppercase tracking-wide">Nombre del lobby</label>
            <input
              type="text"
              placeholder="Ej: Batalla naval"
              value={lobbyName}
              onChange={(e) => setLobbyName(e.target.value)}
              className="px-4 py-2 bg-gray-700 text-gray-100 border-2 border-gray-600 rounded-sm focus:outline-none focus:border-blue-600 placeholder-gray-500"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm text-gray-400 uppercase tracking-wide">Jugadores máximos</label>
            <input
              type="number"
              min={2}
              max={4}
              value={maxPlayers}
              onChange={(e) => setMaxPlayers(Number(e.target.value))}
              className="px-4 py-2 bg-gray-700 text-gray-100 border-2 border-gray-600 rounded-sm focus:outline-none focus:border-blue-600 w-full"
            />
          </div>

          <div className="flex gap-3 mt-2">
            <button
              onClick={() => setCreating(false)}
              className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 font-semibold uppercase tracking-wide rounded-sm border-2 border-gray-600 cursor-pointer transition-colors duration-200"
            >
              Cancelar
            </button>
            <button
              onClick={handleCreate}
              disabled={!lobbyName.trim()}
              className="flex-1 px-4 py-2 bg-blue-800 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-gray-100 font-semibold uppercase tracking-wide rounded-sm border-2 border-blue-900 cursor-pointer transition-colors duration-200"
            >
              Crear
            </button>
          </div>
        </div>
      ) : (
       <> <button
          onClick={() => setCreating(true)}
          className="px-8 py-3 bg-blue-800 hover:bg-blue-900 text-gray-100 font-semibold uppercase tracking-wide rounded-sm border-2 border-blue-900 cursor-pointer transition-colors duration-200"
        >
          + Crear lobby
        </button>
        <button onClick={()=>{network.getLobbies(data => setLobbies(data))}} className="px-8 py-3 bg-blue-800 hover:bg-blue-900 text-gray-100 font-semibold uppercase tracking-wide rounded-sm border-2 border-blue-900 cursor-pointer transition-colors duration-200">Actualizar lobbies</button>
      </>)}

      {/* Lista de lobbys */}
      <div className="flex flex-col items-stretch gap-3 w-full max-w-md">
        {lobbies.length > 0 ? lobbies.map(lobby => {
          const currentPlayers = lobby.players?.length ?? 0;
          const isFull = currentPlayers >= lobby.maxPlayers;

          return (
            <div key={lobby.id} className="flex items-center justify-between gap-4 bg-gray-800 border-2 border-gray-700 rounded-md px-6 py-4">
              <div>
                <h2 className="text-lg text-gray-100 font-bold">{lobby.lobbyName}</h2>
                <p className="text-sm text-gray-400">{currentPlayers} / {lobby.maxPlayers} jugadores</p>
              </div>
              <button
                onClick={() => !isFull && onJoin(lobby)}
                disabled={isFull}
                className={`px-6 py-2 font-semibold uppercase tracking-wide rounded-sm border-2 cursor-pointer transition-colors duration-200 ${
                  isFull
                    ? "bg-gray-600 text-gray-400 border-gray-500 cursor-not-allowed"
                    : "bg-green-700 hover:bg-green-800 text-gray-100 border-green-900"
                }`}
              >
                {isFull ? "Lleno" : "Unirse"}
              </button>
            </div>
          );
        }) : (
          <p className="text-gray-500 uppercase tracking-wide text-sm text-center">No hay lobbys abiertos</p>
        )}
      </div>

      {/* Modales de Mejoras de Barco y Tienda de Oro */}
      <ShipUpgradesModal
        isOpen={isUpgradesOpen}
        onClose={() => setIsUpgradesOpen(false)}
      />
      <GoldShopModal
        isOpen={isShopOpen}
        onClose={() => setIsShopOpen(false)}
      />
    </div>
  )
}
