export type Inscription = {
  id: string;
  number: number;
  address: string;
  location: string;
  output: string;
  value: string;
  offset: string;
};

export type Utxo = {
  txid: string;
  vout: number;
  address: string;
  scriptPubKey: string | null;
  amount: number;
  confirmations: number | null;
};
