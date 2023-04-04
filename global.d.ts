// global.d.ts

declare global {
  const ethers: typeof import("ethers");
  interface Action {
    setResponse: (options: { response: string }) => void;
  }

  const pkpBtcAddress: string;
  const pkpEthAddress: string;
  const pkpPublicKey: string;
  const btcPayoutAddress: string;

  interface LitActions {
    signEcdsa: (options: {
      toSign: UInt8Array;
      publicKey: string;
      sigName: string;
    }) => void;
  }

  interface Auth {
    authSigAddress: string;
  }

  const Lit: {
    Actions: Action;
    Auth: Auth;
    LitActions: LitActions;
  };
}

// This is necessary to allow exporting in a global declaration file
export {};
