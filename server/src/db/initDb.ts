import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { query, testConnection } from "./index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Ejecuta el archivo schema.sql si la base de datos está disponible
 */
export async function initDb(): Promise<void> {
  const connected = await testConnection();
  if (!connected) return;

  try {
    const schemaPath = path.join(__dirname, "schema.sql");
    const sql = fs.readFileSync(schemaPath, "utf-8");
    await query(sql);
    console.log("⚓ [DB] Tablas de The Pirate Bay verificadas / inicializadas correctamente.");
  } catch (err: any) {
    console.error("❌ [DB] Error al inicializar schema.sql:", err.message);
  }
}
