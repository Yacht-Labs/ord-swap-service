// development.ts
(global as any).pkpBtcAddress = "your_btc_address";
(global as any).pkpEthAddress = "your_eth_address";
(global as any).pkpPublicKey = "your_public_key";
(global as any).btcPayoutAddress = "your_btc_payout_address";

// Fake Lit implementation
const fakeLit: {
  Actions: Action;
  Auth: Auth;
  LitActions: LitActions;
} = {
  Actions: {
    setResponse: (options: { response: string }) => {
      console.log("Fake setResponse called with:", options);
    },
  },
  Auth: {
    authSigAddress: "your_auth_sig_address",
  },
  LitActions: {
    signEcdsa: (options: {
      toSign: Uint8Array;
      publicKey: string;
      sigName: string;
    }) => {
      console.log("Fake signEcdsa called with:", options);
    },
  },
};

(global as any).Lit = fakeLit;

// Import and set ethers as a global variable
import { ethers } from "ethers";
(global as any).ethers = ethers;
