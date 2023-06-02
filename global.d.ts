// global.d.ts

declare global {
  const ethers: typeof import("ethers");

  const pkpBtcAddress: string;
  const pkpEthAddress: string;
  const pkpPublicKey: string;
  const publicKey: string;
  const btcPayoutAddress: string;
  const isCancel: boolean;
  const isUnitTest: boolean;
  const ordinalUtxo: Utxo;
  const cardinalUtxo: Utxo;
  const hashForInput0: string;
  const hashForInput1: string;
  const transaction: string;
  const winningTransfer: EthTransfer | null;
  const losingTransfers: EthTransfer[];
  const maxPriorityFeePerGas: string;
  const maxFeePerGas: string;

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
