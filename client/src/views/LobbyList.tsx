import { useEffect, useState } from "react";
import { useNetwork } from "../context/NetworkContext";
import { useUser } from "../context/UserContext";
import type { ILobby } from "../interfaces/lobby";

interface LobbyListProps {
  onJoin: (lobby: ILobby) => void
  onCreate: (lobby: ILobby) => void
}

export default function LobbyList({ onCreate, onJoin }: LobbyListProps) {
  const [lobbyName, setLobbyName] = useState("")
  const [maxPlayers, setMaxPlayers] = useState(2)
  const [creating, setCreating] = useState(false)

  const network = useNetwork();
  const { username } = useUser();
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
    <div className="flex flex-col items-center justify-center min-h-screen gap-8 bg-gray-900">
      <h1 className="text-3xl text-gray-100 uppercase tracking-wide font-bold">Lobbys Disponibles</h1>

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
                <h2 className="text-lg text-gray-100 font-bold">{lobby.name}</h2>
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
    </div>
  )
}
