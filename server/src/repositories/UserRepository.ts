import { query, isDbConnected } from "../db/index.js";

export interface UserRow {
  id: string;
  username: string;
  email: string | null;
  password_hash: string | null;
  google_id: string | null;
  avatar_url: string | null;
  auth_provider: string;
  is_guest: boolean;
  gold: number;
  level: number;
  xp: number;
  created_at: Date;
  updated_at: Date;
}

export interface CreateUserData {
  username: string;
  email?: string;
  password_hash?: string;
  google_id?: string;
  avatar_url?: string;
  auth_provider?: string;
  is_guest?: boolean;
  gold?: number;
  level?: number;
}

// Almacén en memoria volátil de respaldo cuando PostgreSQL no esté disponible
const memoryUsers: Map<string, UserRow> = new Map();

export class UserRepository {
  async findById(id: string): Promise<UserRow | null> {
    if (!isDbConnected) {
      return memoryUsers.get(id) || null;
    }

    const res = await query<UserRow>(
      "SELECT * FROM users WHERE id = $1 LIMIT 1;",
      [id]
    );
    return res.rows[0] || null;
  }

  async findByEmail(email: string): Promise<UserRow | null> {
    const normalized = email.trim().toLowerCase();

    if (!isDbConnected) {
      for (const u of memoryUsers.values()) {
        if (u.email?.toLowerCase() === normalized) return u;
      }
      return null;
    }

    const res = await query<UserRow>(
      "SELECT * FROM users WHERE LOWER(email) = LOWER($1) LIMIT 1;",
      [normalized]
    );
    return res.rows[0] || null;
  }

  async findByUsername(username: string): Promise<UserRow | null> {
    const normalized = username.trim().toLowerCase();

    if (!isDbConnected) {
      for (const u of memoryUsers.values()) {
        if (u.username.toLowerCase() === normalized) return u;
      }
      return null;
    }

    const res = await query<UserRow>(
      "SELECT * FROM users WHERE LOWER(username) = LOWER($1) LIMIT 1;",
      [normalized]
    );
    return res.rows[0] || null;
  }

  async findByGoogleId(googleId: string): Promise<UserRow | null> {
    if (!isDbConnected) {
      for (const u of memoryUsers.values()) {
        if (u.google_id === googleId) return u;
      }
      return null;
    }

    const res = await query<UserRow>(
      "SELECT * FROM users WHERE google_id = $1 LIMIT 1;",
      [googleId]
    );
    return res.rows[0] || null;
  }

  async create(data: CreateUserData): Promise<UserRow> {
    const isGuest = data.is_guest ?? false;
    const authProvider = data.auth_provider || (isGuest ? "guest" : data.google_id ? "google" : "local");
    const gold = data.gold ?? (isGuest ? 0 : 100);
    const level = data.level ?? 1;

    if (!isDbConnected) {
      const mockId = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const user: UserRow = {
        id: mockId,
        username: data.username,
        email: data.email || null,
        password_hash: data.password_hash || null,
        google_id: data.google_id || null,
        avatar_url: data.avatar_url || null,
        auth_provider: authProvider,
        is_guest: isGuest,
        gold,
        level,
        xp: 0,
        created_at: new Date(),
        updated_at: new Date(),
      };
      memoryUsers.set(user.id, user);
      return user;
    }

    const res = await query<UserRow>(
      `INSERT INTO users (
        username, email, password_hash, google_id, avatar_url, 
        auth_provider, is_guest, gold, level
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *;`,
      [
        data.username,
        data.email || null,
        data.password_hash || null,
        data.google_id || null,
        data.avatar_url || null,
        authProvider,
        isGuest,
        gold,
        level,
      ]
    );

    const newUser = res.rows[0];

    // Inicializar registro de estadísticas
    await query(
      "INSERT INTO user_stats (user_id) VALUES ($1) ON CONFLICT DO NOTHING;",
      [newUser.id]
    );

    return newUser;
  }

  async linkGoogleAccount(
    userId: string,
    googleId: string,
    avatarUrl?: string
  ): Promise<UserRow | null> {
    if (!isDbConnected) {
      const u = memoryUsers.get(userId);
      if (u) {
        u.google_id = googleId;
        if (avatarUrl) u.avatar_url = avatarUrl;
      }
      return u || null;
    }

    const res = await query<UserRow>(
      `UPDATE users 
       SET google_id = $1, avatar_url = COALESCE($2, avatar_url), updated_at = NOW() 
       WHERE id = $3 
       RETURNING *;`,
      [googleId, avatarUrl || null, userId]
    );
    return res.rows[0] || null;
  }

  async mergeGuestStats(guestId: string, targetAccountId: string): Promise<void> {
    if (!isDbConnected) {
      const guest = memoryUsers.get(guestId);
      const target = memoryUsers.get(targetAccountId);
      if (guest && target) {
        target.gold += guest.gold;
        memoryUsers.delete(guestId);
      }
      return;
    }

    // Trasladar oro acumulado del invitado a la cuenta nueva
    await query(
      `UPDATE users target
       SET gold = target.gold + guest.gold,
           updated_at = NOW()
       FROM users guest
       WHERE target.id = $1 AND guest.id = $2;`,
      [targetAccountId, guestId]
    );

    // Eliminar o marcar el usuario de invitado antiguo
    await query("DELETE FROM users WHERE id = $1 AND is_guest = TRUE;", [guestId]);
  }
}

export const userRepository = new UserRepository();
