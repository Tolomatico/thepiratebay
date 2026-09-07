import { useState } from "react";
import GoogleAuthButton from "./GoogleAuthButton";
import type { LoginCredentials } from "./types";

interface LoginFormProps {
  onSubmit: (credentials: LoginCredentials) => void;
  onGoogleSuccess: (
    profile: { name?: string; email?: string; picture?: string; sub?: string },
    token: string
  ) => void;
  onGoogleError?: (error: string) => void;
  isLoading?: boolean;
  errorMessage?: string;
}

export default function LoginForm({
  onSubmit,
  onGoogleSuccess,
  onGoogleError,
  isLoading = false,
  errorMessage = "",
}: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [localError, setLocalError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setLocalError("Por favor completa tu correo y contraseña");
      return;
    }
    setLocalError("");
    onSubmit({ email: email.trim(), password });
  };

  const displayError = errorMessage || localError;

  return (
    <div className="flex flex-col gap-5">
      <GoogleAuthButton
        onSuccess={onGoogleSuccess}
        onError={(err) => {
          setLocalError(err);
          onGoogleError?.(err);
        }}
        disabled={isLoading}
        text="Continuar con Google"
      />

      <div className="flex items-center gap-3 my-1">
        <div className="h-px bg-slate-800 flex-1" />
        <span className="text-xs text-slate-500 font-medium uppercase tracking-wider">
          o con tu correo
        </span>
        <div className="h-px bg-slate-800 flex-1" />
      </div>

      {displayError && (
        <div className="p-3 rounded-xl bg-red-950/40 border border-red-800/80 text-xs text-red-300 text-center">
          {displayError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-300">
            Correo Electrónico
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setLocalError("");
            }}
            placeholder="pirata@barco.com"
            disabled={isLoading}
            className="w-full px-4 py-3 bg-slate-950/80 text-slate-100 border border-slate-700/80 rounded-xl focus:outline-none focus:border-amber-500 text-sm placeholder:text-slate-600 disabled:opacity-60"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-300">
            Contraseña
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setLocalError("");
            }}
            placeholder="••••••••"
            disabled={isLoading}
            className="w-full px-4 py-3 bg-slate-950/80 text-slate-100 border border-slate-700/80 rounded-xl focus:outline-none focus:border-amber-500 text-sm placeholder:text-slate-600 disabled:opacity-60"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3.5 mt-2 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-bold uppercase tracking-wider text-sm rounded-xl cursor-pointer shadow-lg shadow-amber-950/40 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <span>⚓</span>
          <span>{isLoading ? "Ingresando..." : "Entrar a la Taberna"}</span>
        </button>
      </form>
    </div>
  );
}
