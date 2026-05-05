import { useEffect, useState } from "react"
import { useNetwork } from "../context/NetworkContext"
import type { ILobby } from "../interfaces/lobby"

interface LobbyProps {
  lobby: ILobby
  onStart: () => void
}
export default function Lobby({ lobby,onStart}:LobbyProps) {
  const [currentLobby,setCurrentLobby] = useState<ILobby>(lobby)
  const network = useNetwork()
  useEffect(()=>{
    network.onLobbyUpdated((lobby:ILobby) => setCurrentLobby(lobby))
    network.joinLobby(lobby.id, (newLobby) => {
  network.setLobbyId(newLobby.id); // ← guarda el lobby
  setCurrentLobby(newLobby);
});

    return () => {
      network.socket.off("lobbyUpdated")
    }
  },[])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-6 bg-gray-900">
      <h1 className="text-3xl text-gray-100 uppercase tracking-wide font-bold">Lobby {currentLobby?.lobbyName}</h1>
      <p>Jugadores: {currentLobby?.players?.length ?? 0} / {currentLobby?.maxPlayers}</p>
      <button
        onClick={onStart}
        className="px-8 py-3 bg-green-700 hover:bg-green-800 text-gray-100 font-semibold uppercase tracking-wide rounded-sm border-2 border-green-900 cursor-pointer transition-colors duration-200"
      >
        Unirse a la partida
      </button>
    </div>
  )
}
