import { createContext, useContext, useState, useRef } from "react";

export interface EnemyHealthBar {
  id: string;
  healthRatio: number;
  visible: boolean;
  username?: string;
}

export interface RemotePlayerHUD {
  id: string;
  username: string;
  health: number;
  maxHealth: number;
  position: { x: number; y: number; z: number };
}

interface GameContextType {
  playerHealth: number;
  playerMaxHealth: number;
  setPlayerHealth: (health: number) => void;
  setPlayerMaxHealth: (health: number) => void;
  playerRotation: number;
  setPlayerRotation: (rotation: number) => void;
  playerPosition: { x: number; y: number; z: number };
  setPlayerPosition: (position: { x: number; y: number; z: number }) => void;
  respawnCountdown: number | null;
  setRespawnCountdown: (seconds: number | null) => void;
  enemyCount: number;
  setEnemyCount: (count: number) => void;
  enemyHealthBars: EnemyHealthBar[];
  setEnemyHealthBars: (bars: EnemyHealthBar[]) => void;
  // Registro para actualización directa del DOM (sin lag de React)
  healthBarRefs: React.MutableRefObject<Map<string, HTMLDivElement>>;
  remotePlayers: React.MutableRefObject<Map<string, RemotePlayerHUD>>;
}

const GameHudContext = createContext<GameContextType | null>(null);

export const HudProvider = ({ children }: { children: React.ReactNode }) => {
  const [playerHealth, setPlayerHealth] = useState(100);
  const [playerMaxHealth, setPlayerMaxHealth] = useState(100);
  const [playerRotation, setPlayerRotation] = useState(0);
  const [playerPosition, setPlayerPosition] = useState({ x: 0, y: 0, z: 0 });
  const [respawnCountdown, setRespawnCountdown] = useState<number | null>(null);
  const [enemyCount, setEnemyCount] = useState(0);
  const [enemyHealthBars, setEnemyHealthBars] = useState<EnemyHealthBar[]>([]);
  
  // Usamos un Ref para el mapa de elementos del DOM para que el motor pueda acceder a ellos directamente
  const healthBarRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const remotePlayers = useRef<Map<string, RemotePlayerHUD>>(new Map());
  const value: GameContextType = {
    playerHealth,
    playerMaxHealth,
    setPlayerHealth,
    setPlayerMaxHealth,
    playerRotation,
    setPlayerRotation,
    playerPosition,
    setPlayerPosition,
    respawnCountdown,
    setRespawnCountdown,
    enemyCount,
    setEnemyCount,
    enemyHealthBars,
    setEnemyHealthBars,
    healthBarRefs,
    remotePlayers
  };

  return <GameHudContext.Provider value={value}>{children}</GameHudContext.Provider>;
};

export const useGameHud = () => {
  const context = useContext(GameHudContext);
  if (!context) {
    throw new Error('useGameHud must be used within HudProvider');
  }
  return context;
};


