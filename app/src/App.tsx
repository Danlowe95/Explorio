import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import {
  getPhantomWallet,
  getSolflareWallet,
  getSolletWallet,
} from "@solana/wallet-adapter-wallets";
import {
  WalletProvider,
  ConnectionProvider,
} from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";

import { ChakraProvider } from "@chakra-ui/react";
import "@fontsource/roboto/400.css";

import UserContext from "./context/UserContext";
import Home from "./pages/Home";
import Hunt from "./pages/Hunt";
import Information from "./pages/Information";
import Marketplace from "./pages/Marketplace";
import theme from "./theme";
import { WalletAddress } from "./types";
import HowToPlay from "./pages/HowToPlay";

const App = () => {
  const [walletAddress, setWalletAddress] = React.useState<WalletAddress>(null);
  const wallets = React.useMemo(
    () => [getPhantomWallet(), getSolflareWallet(), getSolletWallet()],
    []
  );
  return (
    <ChakraProvider theme={theme}>
      <ConnectionProvider endpoint="http://127.0.0.1:8899">
        <WalletProvider wallets={wallets} autoConnect>
          <WalletModalProvider>
            <UserContext.Provider
              value={{
                walletAddress,
                setWalletAddress: (newAddress) => setWalletAddress(newAddress),
              }}
            >
              <BrowserRouter>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/how-to-play" element={<HowToPlay />} />
                  <Route path="hunt" element={<Hunt />} />
                  <Route path="information" element={<Information />} />
                  <Route path="marketplace" element={<Marketplace />} />
                  <Route
                    path="*"
                    element={
                      <main style={{ padding: "1rem" }}>
                        <p>There's nothing here!</p>
                      </main>
                    }
                  />
                </Routes>
              </BrowserRouter>
            </UserContext.Provider>
          </WalletModalProvider>
        </WalletProvider>
      </ConnectionProvider>
    </ChakraProvider>
  );
};

export default App;
