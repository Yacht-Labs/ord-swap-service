import { Listing, Account } from "@prisma/client";

export type ListingWithAccount = Listing & {
  account: Account;
};

export type Inscription = {
  id: string;
  number: number;
  address: string;
  location: string;
  output: string;
  value: string;
  offset: string;
  error?: any;
};

export type Utxo = {
  txId: string;
  vout: number;
  address: string;
  scriptPubKey: string | null;
  amount: number;
  confirmations: number | null;
};
