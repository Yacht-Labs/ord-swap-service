import { UnsignedTransaction } from "ethers";

export type AuthSignature = {
  sig: string;
  derivedVia: string;
  signedMessage: string;
  address: string;
};

export type LitUnsignedEthTransaction = UnsignedTransaction & { from: string };

export type SignatureData = {
  r: string;
  s: string;
  v?: string;
};

export type LitResponseBody = {
  btcTransactionHex?: string;
  unsignedEthTransaction?: LitUnsignedEthTransaction;
  error?: string;
};

export type LitActionResponse = {
  response: LitResponseBody;
  signatures: {
    hashForInput0: SignatureData;
    hashForInput1: SignatureData;
    winningEthTransaction: SignatureData;
  };
};
