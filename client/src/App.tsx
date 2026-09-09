import { useState, useEffect } from "react"
import { GoogleOAuthProvider } from "@react-oauth/google"
import { HudProvider } from "./context/HudContext"
import { NetworkProvider, useNetwork } from "./context/NetworkContext"
import { UserProvider, useUser } from "./context/UserContext"
import type { ILobby } from "./interfaces/lobby"
import { Game } from "./views/Game"
import Lobby from "./views/Lobby"
import LobbyList from "./views/LobbyList"
import Menu from "./views/Menu"
import { MapEditorView } from "./editor/MapEditorView"
import { authService } from "./services/authService"

type Screen = "menu" | "lobby-list" | "lobby" | "game" | "editor"

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || ""

function AppContent() {
  const [screen, setScreen] = useState<Screen>(() => {
    return window.location.hash === "#editor" ? "editor" : "menu"
  })
  const { username, setUsername, setIsGuest, setEmail, setAvatarUrl } = useUser()
  const [lobby, setLobby] = useState<ILobby>()
  const network = useNetwork()

  // Restaurar sesión de usuario guardada al cargar si existe
  useEffect(() => {
    const session = authService.getCurrentSession()
    if (session && !username) {
      setUsername(session.username)
      setIsGuest(session.isGuest)
      if (session.email) setEmail(session.email)
      if (session.avatarUrl) setAvatarUrl(session.avatarUrl)
    }
  }, [username, setUsername, setIsGuest, setEmail, setAvatarUrl])

  // Inicializar estado del historial del navegador
  useEffect(() => {
    if (!window.history.state || !window.history.state.screen) {
      const isEditor = window.location.hash === "#editor"
      window.history.replaceState({ screen: isEditor ? "editor" : "menu" }, "", window.location.hash || "#menu")
    }
  }, [])

  // Manejar el botón "Atrás" / "Adelante" del navegador (popstate)
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      const state = event.state
      const targetScreen: Screen = state?.screen || (window.location.hash === "#editor" ? "editor" : "menu")

      // Si el jugador estaba en un lobby o en partida y retrocede, notificar al servidor
      if (screen === "lobby" || screen === "game") {
        if (lobby?.id) {
          network.leaveLobby(lobby.id)
        }
      }

      if (window.location.hash === "#editor" || targetScreen === "editor") {
        setScreen("editor")
        return
      }

      if (targetScreen === "lobby" && !lobby) {
        setScreen("lobby-list")
        window.history.replaceState({ screen: "lobby-list" }, "", "#lobbies")
        return
      }

      setScreen(targetScreen)
    }

    window.addEventListener("popstate", handlePopState)
    return () => window.removeEventListener("popstate", handlePopState)
  }, [screen, lobby, network])

  // Navegación controlada con historial
  const navigateTo = (targetScreen: Screen, targetLobby?: ILobby, replace: boolean = false) => {
    let hash = "#menu"
    if (targetScreen === "lobby-list") hash = "#lobbies"
    else if (targetScreen === "lobby" && targetLobby) hash = `#lobby/${targetLobby.id}`
    else if (targetScreen === "game") hash = "#battle"
    else if (targetScreen === "editor") hash = "#editor"

    const state = { screen: targetScreen, lobbyId: targetLobby?.id }

    if (replace) {
      window.history.replaceState(state, "", hash)
    } else {
      window.history.pushState(state, "", hash)
    }

    setLobby(targetLobby)
    setScreen(targetScreen)
  }

  const handlePlay = (input: string, isGuest: boolean = true, email?: string, avatar?: string) => {
    setUsername(input)
    setIsGuest(isGuest)
    if (email) setEmail(email)
    if (avatar) setAvatarUrl(avatar)
    navigateTo("lobby-list")
  }

  const handleJoin = (selectedLobby: ILobby) => {
    navigateTo("lobby", selectedLobby)
  }

  const handleStart = () => {
    navigateTo("game", lobby)
  }

  const handleLeaveLobby = () => {
    if (lobby?.id) {
      network.leaveLobby(lobby.id)
    }
    navigateTo("lobby-list")
  }

  const handleLeaveGame = () => {
    if (lobby?.id) {
      network.leaveLobby(lobby.id)
    }
    navigateTo("lobby-list")
  }

  const handleBackToMenu = () => {
    if (lobby?.id) {
      network.leaveLobby(lobby.id)
    }
    navigateTo("menu")
  }

  if (screen === "editor") {
    return <MapEditorView onExit={handleBackToMenu} />
  }

  if (screen === "menu") {
    return <Menu onPlay={handlePlay} onOpenEditor={() => navigateTo("editor")} />
  }

  if (screen === "lobby-list") {
    return (
      <LobbyList 
        onCreate={handleJoin} 
        onJoin={handleJoin} 
        onBack={handleBackToMenu} 
      />
    )
  }

  if (screen === "lobby" && lobby) {
    return (
      <Lobby 
        lobby={lobby} 
        onStart={handleStart} 
        onLeave={handleLeaveLobby} 
      />
    )
  }

  if (screen === "game") {
    return (
      <HudProvider>
        <Game onLeaveGame={handleLeaveGame} />
      </HudProvider>
    )
  }

  // Fallback si screen es lobby pero no hay lobby en memoria
  return (
    <LobbyList 
      onCreate={handleJoin} 
      onJoin={handleJoin} 
      onBack={handleBackToMenu} 
    />
  )
}

export function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <UserProvider>
        <NetworkProvider>
          <AppContent />
        </NetworkProvider>
      </UserProvider>
    </GoogleOAuthProvider>
  )
}