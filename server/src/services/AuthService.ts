import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import { userRepository, type UserRow } from "../repositories/UserRepository.js";

const JWT_SECRET = process.env.JWT_SECRET || "pirate_bay_super_secret_jwt_key_2026";
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;

const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

export interface PublicUser {
  id: string;
  username: string;
  email: string | null;
  avatar_url: string | null;
  auth_provider: string;
  is_guest: boolean;
  gold: number;
  level: number;
  xp: number;
}

export interface AuthResponse {
  user: PublicUser;
  token: string;
}

export class AuthService {
  /**
   * Genera token JWT de sesión para el jugador
   */
  generateToken(user: UserRow): string {
    return jwt.sign(
      {
        userId: user.id,
        username: user.username,
        isGuest: user.is_guest,
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );
  }

  /**
   * Retorna el usuario sin campos sensibles como password_hash
   */
  sanitizeUser(user: UserRow): PublicUser {
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      avatar_url: user.avatar_url,
      auth_provider: user.auth_provider,
      is_guest: user.is_guest,
      gold: user.gold,
      level: user.level,
      xp: user.xp,
    };
  }

  /**
   * Registro con email y contraseña
   */
  async register(
    username: string,
    email: string,
    password: string
  ): Promise<AuthResponse> {
    const cleanEmail = email.trim().toLowerCase();
    const cleanUsername = username.trim();

    // Validar unicidad
    const existingEmail = await userRepository.findByEmail(cleanEmail);
    if (existingEmail) {
      throw new Error("El correo electrónico ya está registrado");
    }

    const existingUser = await userRepository.findByUsername(cleanUsername);
    if (existingUser) {
      throw new Error("El nombre de capitán ya está en uso");
    }

    // Hash seguro de contraseña
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await userRepository.create({
      username: cleanUsername,
      email: cleanEmail,
      password_hash: passwordHash,
      auth_provider: "local",
      is_guest: false,
      gold: 100, // Bono de bienvenida
    });

    const token = this.generateToken(user);
    return { user: this.sanitizeUser(user), token };
  }

  /**
   * Inicio de sesión con email y contraseña
   */
  async login(email: string, password: string): Promise<AuthResponse> {
    const cleanEmail = email.trim().toLowerCase();
    const user = await userRepository.findByEmail(cleanEmail);

    if (!user || !user.password_hash) {
      throw new Error("Credenciales inválidas");
    }

    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      throw new Error("Credenciales inválidas");
    }

    const token = this.generateToken(user);
    return { user: this.sanitizeUser(user), token };
  }

  /**
   * Inicio de sesión o registro con Google OAuth 2.0 (Google Identity Services)
   */
  async loginWithGoogle(
    credentialOrProfile: any,
    guestId?: string
  ): Promise<AuthResponse> {
    let googleId: string;
    let email: string;
    let name: string;
    let picture: string | undefined;

    // Si recibimos un ID Token JWT de Google, lo verificamos criptográficamente
    if (typeof credentialOrProfile === "string") {
      try {
        const ticket = await googleClient.verifyIdToken({
          idToken: credentialOrProfile,
          audience: GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        if (!payload || !payload.sub || !payload.email) {
          throw new Error("Token de Google inválido");
        }
        googleId = payload.sub;
        email = payload.email;
        name = payload.name || "Capitán";
        picture = payload.picture;
      } catch (err: any) {
        throw new Error(`Verificación de Google fallida: ${err.message}`);
      }
    } else {
      // Si recibimos el perfil directamente
      googleId = credentialOrProfile.sub || `google_${Date.now()}`;
      email = credentialOrProfile.email;
      name = credentialOrProfile.name || "Capitán";
      picture = credentialOrProfile.picture;
    }

    // 1. Buscar por google_id
    let user = await userRepository.findByGoogleId(googleId);

    // 2. Si no existe por google_id, buscar por email para vincular
    if (!user && email) {
      user = await userRepository.findByEmail(email);
      if (user) {
        user = await userRepository.linkGoogleAccount(user.id, googleId, picture) || user;
      }
    }

    // 3. Si no existe, crear usuario nuevo
    if (!user) {
      // Asegurar username único
      let candidateName = name.trim();
      const existing = await userRepository.findByUsername(candidateName);
      if (existing) {
        candidateName = `${candidateName}_${Math.floor(100 + Math.random() * 900)}`;
      }

      user = await userRepository.create({
        username: candidateName,
        email,
        google_id: googleId,
        avatar_url: picture,
        auth_provider: "google",
        is_guest: false,
        gold: 100, // Bono de bienvenida
      });

      // Si el jugador venía de una partida de invitado previa, transferir su progreso
      if (guestId) {
        await userRepository.mergeGuestStats(guestId, user.id);
        // Refrescar datos con oro transferido
        user = (await userRepository.findById(user.id)) || user;
      }
    }

    const token = this.generateToken(user);
    return { user: this.sanitizeUser(user), token };
  }

  /**
   * Registro rápido como invitado
   */
  async loginAsGuest(username: string): Promise<AuthResponse> {
    const cleanName = username.trim();
    const uniqueName = `${cleanName}_${Math.floor(100 + Math.random() * 900)}`;

    const user = await userRepository.create({
      username: uniqueName,
      auth_provider: "guest",
      is_guest: true,
      gold: 0,
      level: 1,
    });

    const token = this.generateToken(user);
    return { user: this.sanitizeUser(user), token };
  }

  /**
   * Verifica un token JWT
   */
  verifyToken(token: string): any {
    return jwt.verify(token, JWT_SECRET);
  }
}

export const authService = new AuthService();
