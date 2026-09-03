import { useState } from "react"
import { HudProvider } from "./context/HudContext"
import { NetworkProvider } from "./context/NetworkContext"
import { UserProvider, useUser } from "./context/UserContext"
import type { ILobby } from "./interfaces/lobby"
import { Game } from "./views/Game"
import Lobby from "./views/Lobby"
import LobbyList from "./views/LobbyList"
import Menu from "./views/Menu"

type Screen = "menu" | "lobby-list" | "lobby" | "game"

function AppContent() {
  const [screen, setScreen] = useState<Screen>("menu")
  const { setUsername } = useUser()
  const [lobby,setLobby] = useState<ILobby>()

  const handlePlay = (input: string) => {
    setUsername(input)
    setScreen("lobby-list") 
  }

  const handleJoin = (lobby:ILobby) => {
    setScreen("lobby")
    setLobby(lobby)
  }

  const handleStart = () => {
    setScreen("game")
  }

  if (screen === "menu")
    return <Menu onPlay={handlePlay} />

  if (screen === "lobby-list")
    return <LobbyList onCreate={handleJoin} onJoin={handleJoin} />

  if (screen === "lobby" && lobby)
    return <Lobby lobby={lobby} onStart={handleStart} />

  if (screen === "game")
    return <HudProvider><Game /></HudProvider>
  }



export function App() {
  return (
    <UserProvider>
      <NetworkProvider>
        <AppContent />
      </NetworkProvider>
    </UserProvider>
  )
}