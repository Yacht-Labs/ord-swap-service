import * as bitcoin from "bitcoinjs-lib";

export class TransactionBuilder {
  constructor(public network: bitcoin.Network) {
    this.network = network;
  }
}
