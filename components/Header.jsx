import React, { useEffect } from "react";
import { useMoralis } from "react-moralis";

const Header = () => {
  const {
    enableWeb3,
    account,
    isWeb3Enabled,
    Moralis,
    deactivateWeb3,
    isWeb3EnableLoading,
  } = useMoralis();

  useEffect(() => {
    if (isWeb3Enabled) {
      return;
    }
    if (localStorage.getItem("connected") === "metamask") {
      enableWeb3();
    }
  }, [isWeb3Enabled]);

  useEffect(() => {
    Moralis.onAccountChanged((account) => {
      if (!account) {
        localStorage.removeItem("connected");
        deactivateWeb3();
      }
    });
  }, []);

  return (
    <div>
      {!account ? (
        <button
          disabled={isWeb3EnableLoading}
          onClick={async () => {
            await enableWeb3();
            localStorage.setItem("connected", "metamask");
          }}
        >
          Connect
        </button>
      ) : (
        <div>
          Connected to {account.slice(0, 6)}...
          {account.slice(-4)}
        </div>
      )}
    </div>
  );
};

export default Header;
