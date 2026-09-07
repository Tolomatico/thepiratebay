import type { Team } from "./player";

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderTeam?: Team;
  message: string;
  channel: "all" | "team" | "system";
  timestamp: number;
}

export interface KillEvent {
  id: string;
  killerId: string | null;
  killerName: string;
  killerTeam?: Team | "neutral";
  victimId: string;
  victimName: string;
  victimTeam: Team;
  weapon: string;
  timestamp: number;
}
