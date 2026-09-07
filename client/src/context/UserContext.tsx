import { createContext, useContext, useState } from "react";
import { type ShipType, type Team } from "../interfaces/player";

interface UserContextValue {
  userId: string;
  setUserId: (id: string) => void;
  username: string;
  setUsername: (name: string) => void;
  team: Team;
  setTeam: (team: Team) => void;
  shipType: ShipType;
  setShipType: (shipType: ShipType) => void;
  isGuest: boolean;
  setIsGuest: (isGuest: boolean) => void;
  email: string;
  setEmail: (email: string) => void;
  avatarUrl: string;
  setAvatarUrl: (url: string) => void;
  gold: number;
  setGold: (gold: number) => void;
  level: number;
  setLevel: (level: number) => void;
}

const UserContext = createContext<UserContextValue | null>(null);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [userId, setUserId] = useState<string>(() => {
    return localStorage.getItem("pirate_user_id") || "";
  });
  const [username, setUsername] = useState<string>(() => {
    return localStorage.getItem("pirate_username") || "";
  });
  const [team, setTeam] = useState<Team>("red");
  const [shipType, setShipType] = useState<ShipType>("pirate");
  const [isGuest, setIsGuest] = useState<boolean>(() => {
    return localStorage.getItem("pirate_is_guest") !== "false";
  });
  const [email, setEmail] = useState<string>(() => {
    return localStorage.getItem("pirate_email") || "";
  });
  const [avatarUrl, setAvatarUrl] = useState<string>(() => {
    return localStorage.getItem("pirate_avatar") || "";
  });
  const [gold, setGold] = useState<number>(() => {
    const saved = localStorage.getItem("pirate_gold");
    return saved ? parseInt(saved, 10) : 0;
  });
  const [level, setLevel] = useState<number>(() => {
    const saved = localStorage.getItem("pirate_level");
    return saved ? parseInt(saved, 10) : 1;
  });

  const updateUserId = (id: string) => {
    setUserId(id);
    localStorage.setItem("pirate_user_id", id);
  };

  const updateUsername = (name: string) => {
    setUsername(name);
    localStorage.setItem("pirate_username", name);
  };

  const updateIsGuest = (guest: boolean) => {
    setIsGuest(guest);
    localStorage.setItem("pirate_is_guest", String(guest));
  };

  const updateEmail = (userEmail: string) => {
    setEmail(userEmail);
    localStorage.setItem("pirate_email", userEmail);
  };

  const updateAvatarUrl = (url: string) => {
    setAvatarUrl(url);
    localStorage.setItem("pirate_avatar", url);
  };

  const updateGold = (amt: number) => {
    setGold(amt);
    localStorage.setItem("pirate_gold", String(amt));
    const userStr = localStorage.getItem("pirate_user");
    if (userStr) {
      try {
        const u = JSON.parse(userStr);
        u.gold = amt;
        localStorage.setItem("pirate_user", JSON.stringify(u));
      } catch {}
    }
  };

  const updateLevel = (lvl: number) => {
    setLevel(lvl);
    localStorage.setItem("pirate_level", String(lvl));
    const userStr = localStorage.getItem("pirate_user");
    if (userStr) {
      try {
        const u = JSON.parse(userStr);
        u.level = lvl;
        localStorage.setItem("pirate_user", JSON.stringify(u));
      } catch {}
    }
  };

  const values: UserContextValue = {
    userId,
    setUserId: updateUserId,
    username,
    setUsername: updateUsername,
    team,
    setTeam,
    shipType,
    setShipType,
    isGuest,
    setIsGuest: updateIsGuest,
    email,
    setEmail: updateEmail,
    avatarUrl,
    setAvatarUrl: updateAvatarUrl,
    gold,
    setGold: updateGold,
    level,
    setLevel: updateLevel,
  };

  return (
    <UserContext.Provider value={values}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be used within UserProvider");
  return ctx;
};

