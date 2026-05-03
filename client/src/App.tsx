import { useState } from "react"
import { Game } from "./views/Game"
import { NetworkProvider } from "./context/NetworkContext"

type Screen = "menu" | "lobby" | "game"

export function App() {
  const [screen, setScreen] = useState<Screen>("game")

  return (
    <NetworkProvider>
      <div>
        {screen === "game" && <Game />}
      </div>
    </NetworkProvider>
  )

  // if (screen === "menu") return <Menu onPlay={() => setScreen("lobby")} />
  // if (screen === "lobby") return <Lobby onStart={() => setScreen("game")} />
  // if (screen === "game") return <Game />
}