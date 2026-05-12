import { createContext, useContext, useState } from "react";
import { type ShipType, type Team } from "../interfaces/player";

interface UserContextValue {
  username: string;
  setUsername: (name: string) => void;
  team: Team;
  setTeam: (team: Team) => void;
  shipType: ShipType;
  setShipType: (shipType: ShipType) => void;
}

const UserContext = createContext<UserContextValue | null>(null);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [username, setUsername] = useState<string>("");
  const [team, setTeam] = useState<Team>("red");
  const [shipType, setShipType] = useState<ShipType>("pirate");

  const values: UserContextValue = {
    username,
    setUsername,
    team,
    setTeam,
    shipType,
    setShipType
  }

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
