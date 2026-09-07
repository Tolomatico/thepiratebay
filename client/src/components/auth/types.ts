export type AuthTab = "guest" | "login" | "register";

export interface UserSession {
  id: string;
  username: string;
  email?: string;
  avatarUrl?: string;
  isGuest: boolean;
  gold: number;
  level: number;
  token?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  username: string;
  email: string;
  password: string;
}

export interface AuthSuccessPayload {
  user: UserSession;
  token?: string;
}
