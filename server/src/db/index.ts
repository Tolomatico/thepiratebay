import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pg;

// Singleton Connection Pool
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20, // Máximo de conexiones simultáneas en el pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
  ssl:
    process.env.DATABASE_URL?.includes("neon.tech") ||
    process.env.DATABASE_URL?.includes("sslmode=require") ||
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : undefined,
});

export let isDbConnected = false;

pool.on("connect", () => {
  isDbConnected = true;
});

pool.on("error", (err) => {
  console.error("❌ Error inesperado en el Pool de PostgreSQL:", err.message);
  isDbConnected = false;
});

/**
 * Helper para ejecutar consultas SQL parametrizadas con logging de rendimiento
 */
export async function query<T extends pg.QueryResultRow = any>(
  text: string,
  params?: any[]
): Promise<pg.QueryResult<T>> {
  const start = Date.now();
  try {
    const res = await pool.query<T>(text, params);
    const duration = Date.now() - start;
    if (process.env.NODE_ENV !== "production") {
      // console.log(`[SQL] ${duration}ms | rows: ${res.rowCount}`);
    }
    return res;
  } catch (error: any) {
    console.error(`[SQL ERROR] en consulta: ${text}`);
    console.error(`[SQL ERROR] mensaje: ${error.message}`);
    throw error;
  }
}

/**
 * Comprueba la conexión inicial con la base de datos
 */
export async function testConnection(): Promise<boolean> {
  if (!process.env.DATABASE_URL) {
    console.warn("⚠️  [DB] DATABASE_URL no está definida en .env. Modo sin persistencia SQL activado.");
    return false;
  }

  try {
    const res = await pool.query("SELECT NOW() as now;");
    isDbConnected = true;
    console.log(`⚓ [DB] Conexión exitosa a PostgreSQL: ${res.rows[0].now}`);
    return true;
  } catch (err: any) {
    isDbConnected = false;
    console.warn(`⚠️  [DB] No se pudo conectar a PostgreSQL (${err.message}).`);
    console.warn(`⚠️  [DB] El servidor continuará operando para Socket.io y memoria local.`);
    return false;
  }
}

export default pool;
