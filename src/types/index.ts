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
    ethTransactionSignature: SignatureData;
    ethWinnerSignature: SignatureData | undefined;
    cancelHashForInput0: SignatureData | undefined;
    cancelHashForInput1: SignatureData | undefined;
    ethLoserSignature: SignatureData | undefined;
  };
};

export type SwapData = {
  ordinalUtxo: Utxo | null;
  cardinalUtxo: Utxo | null;
  hashForInput0: Buffer | null;
  hashForInput1: Buffer | null;
  transaction: string;
  winningTransfer: EthTransfer | null;
  losingTransfers: EthTransfer[] | null;
  maxPriorityFeePerGas: string;
  maxFeePerGas: string;
};
