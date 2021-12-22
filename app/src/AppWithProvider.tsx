import { useState } from "react";

import { getPhantomWallet } from "@solana/wallet-adapter-wallets";
import {
  useWallet,
  WalletProvider,
  ConnectionProvider,
} from "@solana/wallet-adapter-react";
import {
  WalletModalProvider,
  WalletMultiButton,
} from "@solana/wallet-adapter-react-ui";
import { createCounter, increment } from "./solana/counter";

require("@solana/wallet-adapter-react-ui/styles.css");
const wallets = [
  /* view list of available wallets at https://github.com/solana-labs/wallet-adapter#wallets */
  getPhantomWallet(),
];

function AppProvider() {
  const [value, setValue] = useState(null);
  const wallet = useWallet();

  if (!wallet.connected) {
    /* If the user's wallet is not connected, display connect wallet button. */
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          marginTop: "100px",
        }}
      >
        <WalletMultiButton />
      </div>
    );
  } else {
    return (
      <div className="App">
        <div>
          {!value && (
            <button
              onClick={() =>
                createCounter(wallet).then((resl) => setValue(resl))
              }
            >
              Create counter
            </button>
          )}
          {value && (
            <button
              onClick={() => increment(wallet).then((resl) => setValue(resl))}
            >
              Increment counter
            </button>
          )}

          {value && value >= Number(0) ? (
            <h2>{value}</h2>
          ) : (
            <h3>Please create the counter.</h3>
          )}
        </div>
      </div>
    );
  }
}

/* wallet configuration as specified here: https://github.com/solana-labs/wallet-adapter#setup */
const AppWithProvider = () => (
  <ConnectionProvider endpoint="http://127.0.0.1:8899">
    <WalletProvider wallets={wallets} autoConnect>
      <WalletModalProvider>
        <AppProvider />
      </WalletModalProvider>
    </WalletProvider>
  </ConnectionProvider>
);

export default AppWithProvider;
