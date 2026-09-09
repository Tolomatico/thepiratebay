import { useEffect, useState } from "react"
import { useNetwork } from "../context/NetworkContext"
import { useUser } from "../context/UserContext"
import type { ILobby } from "../interfaces/lobby"
import ShipSelector from "../components/ShipSelector"
import TeamSelector from "../components/TeamSelector"
import type { ShipType, Team } from "../interfaces/player"
import { ShipUpgradesModal } from "../components/upgrades/ShipUpgradesModal"
import { GoldShopModal } from "../components/shop/GoldShopModal"

interface LobbyProps {
  lobby: ILobby
  onStart: () => void
  onLeave?: () => void
}

export default function Lobby({ lobby, onStart, onLeave }: LobbyProps) {
  const [currentLobby, setCurrentLobby] = useState<ILobby>(lobby)
  const [isUpgradesOpen, setIsUpgradesOpen] = useState(false)
  const [isShopOpen, setIsShopOpen] = useState(false)
  const network = useNetwork()
  const { username, shipType, setShipType, team, setTeam, gold, level } = useUser()

  useEffect(() => {
    network.onLobbyUpdated((lobby: ILobby) => setCurrentLobby(lobby))
    network.joinLobby(lobby.id as string, username, (newLobby: ILobby) => {
      network.setLobbyId(newLobby.id as string);
      setCurrentLobby(newLobby);
      const myPlayer = newLobby.players?.find(p => p.id === network.socket.id);
      if (myPlayer?.team) {
        setTeam(myPlayer.team);
      }
    });

    return () => {
      network.socket.off("lobbyUpdated")
    }
  }, [])

  useEffect(() => {
    if (username && lobby?.id) {
      network.emitPlayerInfo(username, team, shipType)
    }
  }, [team, shipType, username, lobby?.id, network])

  return (
    <div className="relative flex flex-col items-center min-h-screen p-4 sm:p-6 md:p-8 bg-[#0a0f14] overflow-y-auto">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-900/20 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-red-900/10 blur-[120px] rounded-full"></div>
      </div>

      <div className="relative z-10 flex flex-col items-center w-full max-w-5xl gap-6 sm:gap-8 md:gap-10 py-4">
        {/* Top bar with Leave button */}
        <div className="w-full flex items-center justify-between">
          {onLeave && (
            <button
              type="button"
              onClick={onLeave}
              className="flex items-center gap-2 px-4 py-2 bg-slate-900/80 hover:bg-slate-800 border border-slate-700 hover:border-slate-600 rounded-xl text-slate-300 hover:text-white text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer"
            >
              <span>⬅</span>
              <span>Salir de la Sala</span>
            </button>
          )}

          {/* Accesos Rápidos: Astillero y Tienda */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsUpgradesOpen(true)}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-cyan-950/70 hover:bg-cyan-900/70 border border-cyan-500/50 hover:border-cyan-400/80 text-cyan-200 text-xs font-bold transition-all shadow-sm hover:shadow-cyan-500/20 active:scale-95 cursor-pointer"
            >
              <span>🛠️</span>
              <span>Astillero</span>
              <span className="px-1.5 py-0.2 rounded-full bg-cyan-500/20 text-cyan-300 font-mono text-[10px]">
                Nv. {level}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setIsShopOpen(true)}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-amber-950/70 hover:bg-amber-900/70 border border-amber-500/50 hover:border-amber-400/80 text-amber-200 text-xs font-bold transition-all shadow-sm hover:shadow-amber-500/20 active:scale-95 cursor-pointer"
            >
              <span>🪙</span>
              <span className="font-mono">{gold}</span>
              <span className="text-amber-400/80 text-[10px] uppercase font-bold">Tienda</span>
            </button>
          </div>

          <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
            Sala #{currentLobby?.id ? String(currentLobby.id).slice(0, 8) : ""}
          </div>
        </div>

        <div className="flex flex-col items-center gap-2">
          <h1 className="text-5xl font-black text-white uppercase tracking-tighter italic">
            Lobby: <span className="text-green-500">{currentLobby?.lobbyName}</span>
          </h1>
          <div className="flex items-center gap-4 text-gray-400 font-medium uppercase tracking-widest text-sm">
            <span>Jugadores: {currentLobby?.players?.length ?? 0} / {currentLobby?.maxPlayers}</span>
            <div className="w-1.5 h-1.5 bg-gray-600 rounded-full"></div>
            <span className="text-green-600/80 animate-pulse">Servidor Online</span>
          </div>
        </div>

        {/* Players Table */}
        <div className="w-full max-w-2xl bg-gray-900/60 backdrop-blur-sm rounded-xl border border-gray-700 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-800/50">
              <tr>
                <th className="px-4 py-3 text-left text-gray-400 font-bold uppercase tracking-wider text-xs">Jugador</th>
                <th className="px-4 py-3 text-center text-gray-400 font-bold uppercase tracking-wider text-xs">Equipo</th>
                <th className="px-4 py-3 text-center text-gray-400 font-bold uppercase tracking-wider text-xs">Barco</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700/50">
              {currentLobby?.players?.length > 0 ? (
                currentLobby.players.map((player) => (
                  <tr key={player.id} className="hover:bg-gray-800/30 transition-colors">
                    <td className="px-4 py-3 text-white font-medium">{player.username}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-block px-2 py-1 rounded text-xs font-bold uppercase ${
                        player.team === 'red' ? 'bg-red-600/30 text-red-400' : 'bg-blue-600/30 text-blue-400'
                      }`}>
                        {player.team === 'red' ? 'Imperio Rojo' : 'Armada Azul'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="text-gray-400 text-xs uppercase">
                        {player.shipType === 'pirate' ? 'Pirata' : 'Fragata'}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="px-4 py-6 text-center text-gray-500 italic">
                    No hay jugadores en el lobby
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Configuration Sections */}
        <div className="flex flex-col gap-12 w-full">
          <ShipSelector 
            selectedShip={shipType as ShipType} 
            onSelect={(newShip) => {
              setShipType(newShip);
              if (username && lobby?.id) {
                network.emitPlayerInfo(username, team, newShip);
              }
            }} 
          />
          
          <TeamSelector 
            selectedTeam={team as Team} 
            onSelect={(newTeam) => {
              setTeam(newTeam);
              if (username && lobby?.id) {
                network.emitPlayerInfo(username, newTeam, shipType);
              }
            }} 
          />
        </div>

        <div className="flex flex-col items-center gap-4 mt-4">
          <button
            onClick={onStart}
            className="group relative px-12 py-5 bg-green-600 hover:bg-green-500 text-white font-black uppercase tracking-widest rounded-xl transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-[0_10px_30px_rgba(34,197,94,0.3)] hover:shadow-[0_15px_40px_rgba(34,197,94,0.5)]"
          >
            <span className="relative z-10 flex items-center gap-3">
              ¡Izad las Velas!
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
          </button>
          <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">
            Asegúrate de estar listo antes de zarpar
          </p>
        </div>
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
