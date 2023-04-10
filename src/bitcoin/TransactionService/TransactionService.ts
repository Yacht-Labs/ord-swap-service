import { Utxo } from "../../types/models";
import * as bitcoin from "bitcoinjs-lib";
import ecc from "@bitcoinerlab/secp256k1";
import { reverseBuffer } from "../../util/btc";
import { toOutputScript } from "bitcoinjs-lib/src/address";
export class TransactionService {
  private FEE_RATE = 30;
  constructor() {
    bitcoin.initEccLib(ecc);
  }
  public prepareInscriptionTransaction({
    ordinalUtxo,
    cardinalUtxo,
    receivingAddress,
  }: {
    ordinalUtxo: Utxo;
    cardinalUtxo: Utxo;
    receivingAddress: string;
  }) {
    const transaction = new bitcoin.Transaction();
    transaction.addInput(
      reverseBuffer(Buffer.from(ordinalUtxo.txid, "hex")),
      ordinalUtxo.vout
    );
    transaction.addInput(
      reverseBuffer(Buffer.from(cardinalUtxo.txid, "hex")),
      cardinalUtxo.vout
    );
    const outputScript = toOutputScript(receivingAddress);
    transaction.addOutput(outputScript, ordinalUtxo.amount);
    // p2tr have 43 bytes size
    // each p2pkh have under 150 bytes size
    // 12 bytes fixed size
    // total 43*2 + 150*2 + 12 = 400 bytes
    transaction.addOutput(outputScript, cardinalUtxo.amount - 20000);
    const hashForSig0 = transaction.hashForSignature(
      0,
      toOutputScript(ordinalUtxo.address),
      bitcoin.Transaction.SIGHASH_ALL
    );
    const hashForSig1 = transaction.hashForSignature(
      1,
      toOutputScript(cardinalUtxo.address),
      bitcoin.Transaction.SIGHASH_ALL
    );
    return { hashForSig0, hashForSig1, transaction };
  }
}
