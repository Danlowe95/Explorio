import React from "react";

interface UserContextInterface {
  walletAddress: string | null;
  setWalletAddress(newAddress: string | null): void;
}

const UserContext: React.Context<UserContextInterface> =
  React.createContext<UserContextInterface>({
    walletAddress: null,
    setWalletAddress: (newAddress) => {},
  });
export default UserContext;
