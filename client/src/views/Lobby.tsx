import { useEffect, useState } from "react"
import { useNetwork } from "../context/NetworkContext"
import { useUser } from "../context/UserContext"
import type { ILobby } from "../interfaces/lobby"

interface LobbyProps {
  lobby: ILobby
  onStart: () => void
}
export default function Lobby({ lobby,onStart}:LobbyProps) {
  const [currentLobby,setCurrentLobby] = useState<ILobby>(lobby)
  const network = useNetwork()
  const { shipType, setShipType, team, setTeam } = useUser()
  useEffect(()=>{
    network.onLobbyUpdated((lobby:ILobby) => setCurrentLobby(lobby))
    network.joinLobby(lobby.id as string, (newLobby:ILobby) => {
  network.setLobbyId(newLobby.id as string); 
  setCurrentLobby(newLobby);
});

    return () => {
      network.socket.off("lobbyUpdated")
    }
  },[])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-6 bg-gray-900">
      <h1 className="text-3xl text-gray-100 uppercase tracking-wide font-bold">Lobby {currentLobby?.lobbyName}</h1>
      <p className="text-gray-400">Jugadores: {currentLobby?.players?.length ?? 0} / {currentLobby?.maxPlayers}</p>
      
      <div className="flex flex-col gap-5 mt-4 w-72 mb-4">
        <div className="flex flex-col gap-2">
          <label className="text-gray-400 text-xs font-bold uppercase tracking-widest">Tipo de Barco</label>
          <select 
            value={shipType || "pirate"} 
            onChange={(e) => setShipType(e.target.value)}
            className="px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white focus:outline-none focus:border-green-600/50 hover:bg-gray-800 transition-colors cursor-pointer appearance-none"
          >
            <option value="pirate">🏴‍☠️ Pirata (Rápido, 500 HP)</option>
            <option value="english">⚓ Inglés (Tanque, 800 HP)</option>
          </select>
        </div>
        
        <div className="flex flex-col gap-2">
          <label className="text-gray-400 text-xs font-bold uppercase tracking-widest">Equipo</label>
          <select 
            value={team || "red"} 
            onChange={(e) => setTeam(e.target.value)}
            className="px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white focus:outline-none focus:border-green-600/50 hover:bg-gray-800 transition-colors cursor-pointer appearance-none"
          >
            <option value="red">🔴 Equipo Rojo</option>
            <option value="blue">🔵 Equipo Azul</option>
          </select>
        </div>
      </div>
      <button
        onClick={onStart}
        className="px-8 py-3 bg-green-700 hover:bg-green-800 text-gray-100 font-semibold uppercase tracking-wide rounded-sm border-2 border-green-900 cursor-pointer transition-colors duration-200"
      >
        Unirse a la partida
      </button>
    </div>
  )
}
