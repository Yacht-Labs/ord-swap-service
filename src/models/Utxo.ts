export type Utxo = {
  txid: string;
  vout: number;
  address: string;
  scriptPubKey: string | null;
  amount: number;
  confirmations: number | null;
};
