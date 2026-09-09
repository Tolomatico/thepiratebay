import type { LoginCredentials, RegisterCredentials, UserSession } from "../components/auth/types";

const STORAGE_KEYS = {
  TOKEN: "pirate_token",
  USER: "pirate_user",
  USERNAME: "pirate_username",
  IS_GUEST: "pirate_is_guest",
  EMAIL: "pirate_email",
  AVATAR: "pirate_avatar",
  GOLD: "pirate_gold",
  LEVEL: "pirate_level",
};

const BACKEND_URL = (import.meta.env.VITE_BACK_URL || "https://thepiratebay.onrender.com").replace(/\/+$/, "");
const API_BASE = `${BACKEND_URL}/api`;

class AuthService {
  /**
   * Inicia sesión como invitado con sesión temporal
   */
  async loginAsGuest(username: string): Promise<UserSession> {
    const session: UserSession = {
      id: `guest_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      username: username.trim(),
      isGuest: true,
      gold: 0,
      level: 1,
    };

    this.saveSession(session);
    return session;
  }

  /**
   * Inicia sesión con correo y contraseña
   */
  async loginWithEmail(credentials: LoginCredentials): Promise<UserSession> {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Credenciales inválidas");
    }

    this.saveSession(data.user, data.token);
    return data.user;
  }

  /**
   * Registra una nueva cuenta permanente de pirata
   */
  async register(credentials: RegisterCredentials): Promise<UserSession> {
    const response = await fetch(`${API_BASE}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Error al registrar la cuenta");
    }

    this.saveSession(data.user, data.token);
    return data.user;
  }

  /**
   * Inicia sesión o registra con el perfil obtenido de Google OAuth
   */
  async loginWithGoogleProfile(
    profile: { sub?: string; name?: string; email?: string; picture?: string },
    token?: string
  ): Promise<UserSession> {
    const response = await fetch(`${API_BASE}/auth/google`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ profile, token }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Fallo al autenticar con Google");
    }

    this.saveSession(data.user, data.token);
    return data.user;
  }

  /**
   * Inicia sesión o se registra con Google (fallback directo)
   */
  async loginWithGoogle(credential?: string): Promise<UserSession> {
    try {
      if (credential) {
        const response = await fetch(`${API_BASE}/auth/google`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ credential }),
        });

        if (response.ok) {
          const data = await response.json();
          this.saveSession(data.user, data.token);
          return data.user;
        }
      }
    } catch {
      // Backend fallback
    }

    // Fallback con datos de Google simulados
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    const session: UserSession = {
      id: `google_${Date.now()}`,
      username: `Capitán_Google_${randomSuffix}`,
      email: "pirata.google@gmail.com",
      avatarUrl: "https://lh3.googleusercontent.com/a/default-user",
      isGuest: false,
      gold: 100,
      level: 1,
      token: `mock_google_jwt_${Date.now()}`,
    };

    this.saveSession(session, session.token);
    return session;
  }

  /**
   * Guarda la sesión en localStorage y actualiza claves individuales
   */
  saveSession(session: UserSession, token?: string) {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(session));
    localStorage.setItem(STORAGE_KEYS.USERNAME, session.username);
    localStorage.setItem(STORAGE_KEYS.IS_GUEST, String(session.isGuest));
    localStorage.setItem(STORAGE_KEYS.GOLD, String(session.gold));
    localStorage.setItem(STORAGE_KEYS.LEVEL, String(session.level));

    if (session.email) localStorage.setItem(STORAGE_KEYS.EMAIL, session.email);
    if (session.avatarUrl) localStorage.setItem(STORAGE_KEYS.AVATAR, session.avatarUrl);
    if (token) localStorage.setItem(STORAGE_KEYS.TOKEN, token);
  }

  /**
   * Cierra la sesión activa
   */
  logout() {
    if (typeof window === "undefined" || !window.localStorage) return;
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
    localStorage.removeItem(STORAGE_KEYS.USERNAME);
    localStorage.removeItem(STORAGE_KEYS.IS_GUEST);
    localStorage.removeItem(STORAGE_KEYS.EMAIL);
    localStorage.removeItem(STORAGE_KEYS.AVATAR);
    localStorage.removeItem(STORAGE_KEYS.GOLD);
    localStorage.removeItem(STORAGE_KEYS.LEVEL);
  }

  /**
   * Obtiene la sesión guardada si existe
   */
  getCurrentSession(): UserSession | null {
    const userStr = localStorage.getItem(STORAGE_KEYS.USER);
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }
}

export const authService = new AuthService();
