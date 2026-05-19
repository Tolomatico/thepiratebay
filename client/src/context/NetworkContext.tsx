import React, { createContext, useContext, useState } from "react";
import { NetworkManager } from "../network/NetworkManager";

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