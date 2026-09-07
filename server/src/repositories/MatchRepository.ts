import { query, isDbConnected } from "../db/index.js";
import { MatchResult } from "../interfaces/match.js";

export class MatchRepository {
  async recordMatch(match: MatchResult): Promise<void> {
    if (!isDbConnected) {
      console.log(`⚓ [DB (Memory)] Partida guardada: ${match.lobbyName}, Ganador: ${match.winnerTeam}`);
      return;
    }

    try {
      await query(
        `INSERT INTO match_history (
          lobby_name, winner_team, duration_sec, scores_json, played_at
        ) VALUES ($1, $2, $3, $4, TO_TIMESTAMP($5 / 1000.0));`,
        [
          match.lobbyName,
          match.winnerTeam,
          match.durationSec,
          JSON.stringify(match.players),
          match.timestamp,
        ]
      );
      console.log(`⚓ [DB] Partida registrada exitosamente en match_history: ${match.lobbyName}`);
    } catch (err) {
      console.error("❌ [DB] Error al guardar partida en match_history:", err);
    }
  }
}

export const matchRepository = new MatchRepository();
