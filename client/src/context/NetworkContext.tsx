import { createContext, useContext } from "react";
import { NetworkManager } from "../network/NetworkManager";
import { useState } from "react";

const NetworkContext = createContext<NetworkManager | null>(null);

export const NetworkProvider = ({ children }: { children: React.ReactNode }) => {
  const [networkManager] = useState(() => new NetworkManager());

  return <NetworkContext.Provider value={networkManager}>{children}</NetworkContext.Provider>;
};

export const useNetwork = () => {
  const networkManager = useContext(NetworkContext);

  if (!networkManager) {
    throw new Error("useNetwork must be used within NetworkProvider");
  }

  return networkManager;
}