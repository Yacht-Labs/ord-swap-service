// global.d.ts

declare global {
  const ethers: typeof import("ethers");

  const pkpBtcAddress: string;
  const pkpEthAddress: string;
  const pkpPublicKey: string;
  const btcPayoutAddress: string;
  const isCancel: boolean;
  const btcCancelAddress: string;

  interface Action {
    setResponse: (options: { response: any }) => void;
    signEcdsa: (options: {
      toSign: Uint8Array;
      publicKey: string;
      sigName: string;
    }) => void;
  }

  interface LitActions {
    signEcdsa: (options: {
      toSign: Uint8Array;
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
