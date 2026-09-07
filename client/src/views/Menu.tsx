import { useState } from "react";
import {
  AuthBenefitBadges,
  AuthTabs,
  GuestForm,
  LoginForm,
  RegisterForm,
  type AuthTab,
  type LoginCredentials,
  type RegisterCredentials,
} from "../components/auth";
import { useUser } from "../context/UserContext";
import { authService } from "../services/authService";

interface MenuProps {
  onPlay: (
    username: string,
    isGuest?: boolean,
    email?: string,
    avatar?: string
  ) => void;
}

export default function Menu({ onPlay }: MenuProps) {
  const [activeTab, setActiveTab] = useState<AuthTab>("guest");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const { setUsername, setIsGuest, setEmail, setAvatarUrl, setGold, setLevel } =
    useUser();

  const handleSessionSuccess = (session: {
    username: string;
    isGuest: boolean;
    email?: string;
    avatarUrl?: string;
    gold: number;
    level: number;
  }) => {
    setUsername(session.username);
    setIsGuest(session.isGuest);
    if (session.email) setEmail(session.email);
    if (session.avatarUrl) setAvatarUrl(session.avatarUrl);
    setGold(session.gold);
    setLevel(session.level);

    onPlay(session.username, session.isGuest, session.email, session.avatarUrl);
  };

  const handleGuestSubmit = async (username: string) => {
    setIsLoading(true);
    try {
      const session = await authService.loginAsGuest(username);
      handleSessionSuccess(session);
    } catch {
      setErrorMessage("Error al iniciar como invitado");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginSubmit = async (credentials: LoginCredentials) => {
    setIsLoading(true);
    setErrorMessage("");
    try {
      const session = await authService.loginWithEmail(credentials);
      handleSessionSuccess(session);
    } catch {
      setErrorMessage("Credenciales inválidas o error de conexión");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterSubmit = async (credentials: RegisterCredentials) => {
    setIsLoading(true);
    setErrorMessage("");
    try {
      const session = await authService.register(credentials);
      handleSessionSuccess(session);
    } catch {
      setErrorMessage("Error al registrar la cuenta");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = async (
    profile: { name?: string; email?: string; picture?: string; sub?: string },
    token: string
  ) => {
    setIsLoading(true);
    setErrorMessage("");
    try {
      const session = await authService.loginWithGoogleProfile(profile, token);
      handleSessionSuccess(session);
    } catch {
      setErrorMessage("Fallo al autenticar con Google");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen w-full px-4 py-4 sm:py-6 overflow-y-auto bg-gradient-to-b from-[#050b16] via-[#081324] to-[#03060c] text-slate-100 select-none">
      {/* Halos de iluminación ambiental */}
      <div className="fixed -top-32 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-amber-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-blue-600/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Contenedor Central */}
      <div className="relative z-10 w-full max-w-lg sm:max-w-xl flex flex-col items-center my-auto">
        {/* Encabezado Principal */}
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

        {/* Tarjeta Glassmorphism de Autenticación */}
        <div className="w-full bg-slate-900/80 backdrop-blur-2xl border border-slate-700/60 hover:border-slate-600/60 transition-colors rounded-2xl p-6 sm:p-7 shadow-2xl shadow-black/90">
          {/* Selector de Pestañas */}
          <AuthTabs
            activeTab={activeTab}
            onChange={(tab) => {
              setActiveTab(tab);
              setErrorMessage("");
            }}
          />

          {/* Vistas de Formularios Modulares */}
          {activeTab === "guest" && (
            <GuestForm onSubmit={handleGuestSubmit} isLoading={isLoading} />
          )}

          {activeTab === "login" && (
            <LoginForm
              onSubmit={handleLoginSubmit}
              onGoogleSuccess={handleGoogleSuccess}
              onGoogleError={(err) => setErrorMessage(err)}
              isLoading={isLoading}
              errorMessage={errorMessage}
            />
          )}

          {activeTab === "register" && (
            <RegisterForm
              onSubmit={handleRegisterSubmit}
              onGoogleSuccess={handleGoogleSuccess}
              onGoogleError={(err) => setErrorMessage(err)}
              isLoading={isLoading}
              errorMessage={errorMessage}
            />
          )}
        </div>

        {/* Insignias de Beneficios Inferiores */}
        <AuthBenefitBadges />
      </div>
    </div>
  );
}
