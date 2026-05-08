import { createContext, useContext, useState } from "react";

interface UserContextValue {
  username: string;
  setUsername: (name: string) => void;
  team: string;
  setTeam: (team: string) => void;
  shipType: string;
  setShipType: (shipType: string) => void;
}

const UserContext = createContext<UserContextValue | null>(null);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [username, setUsername] = useState<string>("");
  const [team, setTeam] = useState<string>("");
  const [shipType, setShipType] = useState<string>("");

  const values:UserContextValue={
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
