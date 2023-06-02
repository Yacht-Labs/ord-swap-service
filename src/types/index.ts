import { UnsignedTransaction } from "ethers";
import { Utxo } from "./models";
import { Transaction } from "bitcoinjs-lib";

export type AuthSignature = {
  sig: string;
  derivedVia: string;
  signedMessage: string;
  address: string;
};

export type LitUnsignedEthTransaction = UnsignedTransaction & { from: string };

export type EthTransfer = {
  blockNum: string;
  from: string;
  value: string;
};

export type SignatureData = {
  r: string;
  s: string;
  v?: number;
  signature: string;
};

export type LitResponseBody = {
  response?: {
    btcTransaction?: string;
    unsignedEthTransaction?: LitUnsignedEthTransaction;
  };
  btcTransactionHex?: string;
  error?: string;
};

export type LitActionResponse = {
  response: LitResponseBody;
  signatures: {
    hashForInput0: SignatureData;
    hashForInput1: SignatureData;
    ethTransactionSignature: SignatureData;
    ethWinnerSignature: SignatureData | undefined;
    cancelHashForInput0: SignatureData | undefined;
    cancelHashForInput1: SignatureData | undefined;
    ethLoserSignature: SignatureData | undefined;
  };
};

export type SwapData = {
  ordinalUtxo: Utxo;
  cardinalUtxo: Utxo;
  hashForInput0: Uint8Array | string;
  hashForInput1: Uint8Array | string;
  transaction: string;
  winningTransfer: EthTransfer | null;
  losingTransfers: EthTransfer[];
  maxPriorityFeePerGas: string;
  maxFeePerGas: string;
};
