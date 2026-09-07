import { useState } from "react"

interface MenuProps {
  onPlay: (username: string, isGuest?: boolean, email?: string, avatar?: string) => void
}

type TabType = "guest" | "login" | "register"

const PIRATE_TITLES = [
  "Capitán Drake",
  "Barbanegra",
  "Anne Bonny",
  "Corsario Morgan",
  "Barba de Plata",
  "Calicó Jack",
  "Capitán Flint",
  "Lobo de Mar",
  "Viento Negro",
  "Krakenslayer",
  "Sirena Letal",
  "Jack Sparrow"
]

export default function Menu({ onPlay }: MenuProps) {
  const [activeTab, setActiveTab] = useState<TabType>("guest")

  // Guest State
  const [guestName, setGuestName] = useState<string>(() => {
    return localStorage.getItem("pirate_username") || ""
  })

  // Login State
  const [loginEmail, setLoginEmail] = useState("")
  const [loginPassword, setLoginPassword] = useState("")
  const [loginError, setLoginError] = useState("")

  // Register State
  const [registerName, setRegisterName] = useState("")
  const [registerEmail, setRegisterEmail] = useState("")
  const [registerPassword, setRegisterPassword] = useState("")
  const [registerError, setRegisterError] = useState("")

  const getRandomPirateName = () => {
    const randomName = PIRATE_TITLES[Math.floor(Math.random() * PIRATE_TITLES.length)]
    const randomSuffix = Math.floor(10 + Math.random() * 90)
    return `${randomName}_${randomSuffix}`
  }

  const handleRandomizeGuest = () => {
    setGuestName(getRandomPirateName())
  }

  const handleGuestPlay = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    const finalName = guestName.trim() || getRandomPirateName()
    onPlay(finalName, true)
  }

  const handleGoogleAuth = () => {
    const mockGoogleCaptain = "Capitán_Google_" + Math.floor(100 + Math.random() * 900)
    const mockGoogleEmail = "pirata@gmail.com"
    const mockAvatar = "https://lh3.googleusercontent.com/a/default-user"
    onPlay(mockGoogleCaptain, false, mockGoogleEmail, mockAvatar)
  }

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (!loginEmail || !loginPassword) {
      setLoginError("Por favor completa tu correo y contraseña")
      return
    }
    const derivedName = loginEmail.split("@")[0] || "Capitán"
    onPlay(derivedName, false, loginEmail)
  }

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault()
    if (!registerName || !registerEmail || !registerPassword) {
      setRegisterError("Por favor completa todos los campos del pacto pirata")
      return
    }
    onPlay(registerName.trim(), false, registerEmail)
  }

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen w-full px-4 py-4 sm:py-6 overflow-y-auto bg-gradient-to-b from-[#050b16] via-[#081324] to-[#03060c] text-slate-100 select-none">
      {/* Halos de luz ambiental */}
      <div className="fixed -top-32 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-amber-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-blue-600/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Contenedor Centrado con Ancho Cómodo */}
      <div className="relative z-10 w-full max-w-lg sm:max-w-xl flex flex-col items-center my-auto">
        {/* Encabezado Espacioso */}
        <div className="flex flex-col items-center mb-5 text-center">
          <div className="inline-flex items-center justify-center w-10 h-10 mb-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xl shadow-[0_0_20px_rgba(245,158,11,0.25)]">
            ⚓
          </div>
          <h1 className="font-pirate text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-amber-100 via-amber-300 to-amber-100 drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)] whitespace-nowrap">
            THE PIRATE BAY
          </h1>
          <p className="text-[11px] sm:text-xs text-slate-400 tracking-[0.25em] uppercase font-semibold mt-1">
            Combate Naval 3D Multijugador
          </p>
        </div>

        {/* Tarjeta Principal con Respiración y Padding Amplio */}
        <div className="w-full bg-slate-900/80 backdrop-blur-2xl border border-slate-700/60 hover:border-slate-600/60 transition-colors rounded-2xl p-6 sm:p-7 shadow-2xl shadow-black/90">
          {/* Navegación por Pestañas */}
          <div className="grid grid-cols-3 gap-1.5 bg-slate-950/80 p-1.5 rounded-xl border border-slate-800/90 mb-5">
            <button
              type="button"
              onClick={() => setActiveTab("guest")}
              className={`py-2.5 px-2 text-xs sm:text-sm font-semibold rounded-lg transition-all duration-200 cursor-pointer text-center ${
                activeTab === "guest"
                  ? "bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold shadow-md shadow-amber-950/50"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/50"
              }`}
            >
              ⚔️ Invitado
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("login")}
              className={`py-2.5 px-2 text-xs sm:text-sm font-semibold rounded-lg transition-all duration-200 cursor-pointer text-center ${
                activeTab === "login"
                  ? "bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold shadow-md shadow-amber-950/50"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/50"
              }`}
            >
              🔑 Iniciar Sesión
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("register")}
              className={`py-2.5 px-2 text-xs sm:text-sm font-semibold rounded-lg transition-all duration-200 cursor-pointer text-center ${
                activeTab === "register"
                  ? "bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold shadow-md shadow-amber-950/50"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/50"
              }`}
            >
              📜 Registrarse
            </button>
          </div>

          {/* TAB 1: MODO INVITADO */}
          {activeTab === "guest" && (
            <form onSubmit={handleGuestPlay} className="flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center px-0.5">
                  <label htmlFor="guest-alias" className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                    Alias de Capitán
                  </label>
                  <button
                    type="button"
                    onClick={handleRandomizeGuest}
                    className="text-xs text-amber-400 hover:text-amber-300 font-medium cursor-pointer transition-colors flex items-center gap-1"
                  >
                    <span>🎲</span>
                    <span className="underline underline-offset-2">Nombre Aleatorio</span>
                  </button>
                </div>
                <div className="relative">
                  <input
                    id="guest-alias"
                    type="text"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    placeholder="Ej. Capitán_Barbanegra"
                    maxLength={24}
                    className="w-full px-4 py-3.5 bg-slate-950/80 text-slate-100 border border-slate-700/80 rounded-xl focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 text-sm sm:text-base transition-all placeholder:text-slate-600"
                  />
                  {guestName && (
                    <button
                      type="button"
                      onClick={() => setGuestName("")}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 text-sm px-1 py-1"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>

              {/* Botón principal de zarpar */}
              <button
                type="submit"
                className="w-full py-4 bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-slate-950 font-extrabold uppercase tracking-wider text-sm sm:text-base rounded-xl cursor-pointer shadow-lg shadow-emerald-950/50 hover:shadow-emerald-500/25 transition-all duration-200 transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2"
              >
                <span>⚔️</span>
                <span>Zarpar a la Batalla</span>
              </button>

              {/* Nota sobre modo invitado */}
              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/90 text-xs text-slate-400 flex items-start gap-3 leading-relaxed">
                <span className="text-amber-400 text-base leading-none mt-0.5">💡</span>
                <span>
                  El modo invitado te permite jugar al instante sin registro. Podrás vincular tu cuenta luego para guardar tu oro, nivel y estadísticas.
                </span>
              </div>
            </form>
          )}

          {/* TAB 2: INICIAR SESIÓN */}
          {activeTab === "login" && (
            <div className="flex flex-col gap-5">
              {/* Botón de Google */}
              <button
                type="button"
                onClick={handleGoogleAuth}
                className="w-full flex items-center justify-center gap-3 py-3.5 px-4 bg-white hover:bg-slate-50 text-slate-800 font-semibold rounded-xl text-sm transition-all shadow-md cursor-pointer border border-slate-200 hover:scale-[1.01]"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Continuar con Google</span>
              </button>

              <div className="flex items-center gap-3 my-1">
                <div className="h-px bg-slate-800 flex-1" />
                <span className="text-xs text-slate-500 font-medium uppercase tracking-wider">o con tu correo</span>
                <div className="h-px bg-slate-800 flex-1" />
              </div>

              {loginError && (
                <div className="p-3 rounded-xl bg-red-950/40 border border-red-800/80 text-xs text-red-300 text-center">
                  {loginError}
                </div>
              )}

              <form onSubmit={handleLogin} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-300">Correo Electrónico</label>
                  <input
                    type="email"
                    value={loginEmail}
                    onChange={(e) => {
                      setLoginEmail(e.target.value)
                      setLoginError("")
                    }}
                    placeholder="pirata@barco.com"
                    className="w-full px-4 py-3 bg-slate-950/80 text-slate-100 border border-slate-700/80 rounded-xl focus:outline-none focus:border-amber-500 text-sm placeholder:text-slate-600"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-300">Contraseña</label>
                  <input
                    type="password"
                    value={loginPassword}
                    onChange={(e) => {
                      setLoginPassword(e.target.value)
                      setLoginError("")
                    }}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 bg-slate-950/80 text-slate-100 border border-slate-700/80 rounded-xl focus:outline-none focus:border-amber-500 text-sm placeholder:text-slate-600"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 mt-2 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-bold uppercase tracking-wider text-sm rounded-xl cursor-pointer shadow-lg shadow-amber-950/40 transition-all"
                >
                  Entrar a la Taberna
                </button>
              </form>
            </div>
          )}

          {/* TAB 3: REGISTRARSE */}
          {activeTab === "register" && (
            <div className="flex flex-col gap-5">
              {/* Botón de Google */}
              <button
                type="button"
                onClick={handleGoogleAuth}
                className="w-full flex items-center justify-center gap-3 py-3.5 px-4 bg-white hover:bg-slate-50 text-slate-800 font-semibold rounded-xl text-sm transition-all shadow-md cursor-pointer border border-slate-200 hover:scale-[1.01]"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Registrarse con Google</span>
              </button>

              <div className="flex items-center gap-3 my-1">
                <div className="h-px bg-slate-800 flex-1" />
                <span className="text-xs text-slate-500 font-medium uppercase tracking-wider">o con credenciales</span>
                <div className="h-px bg-slate-800 flex-1" />
              </div>

              {registerError && (
                <div className="p-3 rounded-xl bg-red-950/40 border border-red-800/80 text-xs text-red-300 text-center">
                  {registerError}
                </div>
              )}

              <form onSubmit={handleRegister} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-300">Nombre de Capitán</label>
                  <input
                    type="text"
                    value={registerName}
                    onChange={(e) => {
                      setRegisterName(e.target.value)
                      setRegisterError("")
                    }}
                    placeholder="Ej. Corsario Drake"
                    maxLength={24}
                    className="w-full px-4 py-3 bg-slate-950/80 text-slate-100 border border-slate-700/80 rounded-xl focus:outline-none focus:border-amber-500 text-sm placeholder:text-slate-600"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-300">Correo Electrónico</label>
                  <input
                    type="email"
                    value={registerEmail}
                    onChange={(e) => {
                      setRegisterEmail(e.target.value)
                      setRegisterError("")
                    }}
                    placeholder="pirata@barco.com"
                    className="w-full px-4 py-3 bg-slate-950/80 text-slate-100 border border-slate-700/80 rounded-xl focus:outline-none focus:border-amber-500 text-sm placeholder:text-slate-600"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-300">Contraseña</label>
                  <input
                    type="password"
                    value={registerPassword}
                    onChange={(e) => {
                      setRegisterPassword(e.target.value)
                      setRegisterError("")
                    }}
                    placeholder="Mínimo 6 caracteres"
                    className="w-full px-4 py-3 bg-slate-950/80 text-slate-100 border border-slate-700/80 rounded-xl focus:outline-none focus:border-amber-500 text-sm placeholder:text-slate-600"
                  />
                </div>

                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200 flex items-center gap-2.5">
                  <span className="text-lg">🪙</span>
                  <span>¡Recibirás <strong>100 de Oro</strong> como botín inicial de bienvenida!</span>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 mt-1 bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-500 hover:from-amber-500 hover:to-yellow-400 text-slate-950 font-bold uppercase tracking-wider text-sm rounded-xl cursor-pointer shadow-lg shadow-amber-950/40 transition-all"
                >
                  📜 Firmar el Pacto Pirata
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Insignias de Beneficios con diseño sutil y espacioso */}
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 w-full mt-4 text-xs text-slate-400">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/50 border border-slate-800">
            <span>🪙</span>
            <span className="font-medium text-slate-300">Oro & Botín</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/50 border border-slate-800">
            <span>⚓</span>
            <span className="font-medium text-slate-300">Navíos</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/50 border border-slate-800">
            <span>🏆</span>
            <span className="font-medium text-slate-300">Ranking</span>
          </div>
        </div>
      </div>
    </div>
  )
}
