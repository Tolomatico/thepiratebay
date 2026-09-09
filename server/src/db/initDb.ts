import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { query, testConnection } from "./index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const EMBEDDED_SCHEMA_SQL = `
-- Habilitar extensión para UUID si es necesario
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Tabla de Usuarios
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(32) NOT NULL UNIQUE,
    email VARCHAR(128) UNIQUE,
    password_hash VARCHAR(255),
    google_id VARCHAR(128) UNIQUE,
    avatar_url TEXT,
    auth_provider VARCHAR(16) DEFAULT 'local',
    is_guest BOOLEAN DEFAULT FALSE,
    gold INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1,
    xp INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índices de búsqueda rápida
CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);

-- Tabla de Estadísticas de Jugador
CREATE TABLE IF NOT EXISTS user_stats (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    total_kills INTEGER DEFAULT 0,
    total_deaths INTEGER DEFAULT 0,
    matches_played INTEGER DEFAULT 0,
    matches_won INTEGER DEFAULT 0,
    damage_dealt BIGINT DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Historial de Partidas
CREATE TABLE IF NOT EXISTS match_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lobby_name VARCHAR(64) NOT NULL,
    winner_team VARCHAR(16),
    duration_sec INTEGER DEFAULT 0,
    scores_json JSONB DEFAULT '[]'::jsonb,
    played_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
`;

/**
 * Ejecuta el esquema SQL si la base de datos está disponible
 */
export async function initDb(): Promise<void> {
  const connected = await testConnection();
  if (!connected) return;

  try {
    let sql = EMBEDDED_SCHEMA_SQL;
    const schemaPath = path.join(__dirname, "schema.sql");
    if (fs.existsSync(schemaPath)) {
      sql = fs.readFileSync(schemaPath, "utf-8");
    }
    await query(sql);
    console.log("⚓ [DB] Tablas de The Pirate Bay verificadas / inicializadas correctamente.");
  } catch (err: any) {
    console.error("❌ [DB] Error al inicializar schema SQL:", err.message);
  }
}

