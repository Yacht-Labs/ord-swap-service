import { Utxo } from "../../models/Utxo";
import * as bitcoin from "bitcoinjs-lib";
import * as ecc from "tiny-secp256k1";
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
      0
    );
    transaction.addInput(
      reverseBuffer(Buffer.from(cardinalUtxo.txid, "hex")),
      1
    );
    const outputScript = toOutputScript(receivingAddress);
    transaction.addOutput(outputScript, ordinalUtxo.amount);
    // p2tr have 43 bytes size
    // each p2pkh have under 150 bytes size
    // 12 bytes fixed size
    // total 43*2 + 150*2 + 12 = 400 bytes
    transaction.addOutput(
      outputScript,
      cardinalUtxo.amount + ordinalUtxo.amount - 20000
    );
    const hashForSig0 = transaction.hashForSignature(
      0,
      toOutputScript(ordinalUtxo.address),
      bitcoin.Transaction.SIGHASH_ALL
    );
    const hashForSig1 = transaction.hashForSignature(
      0,
      toOutputScript(ordinalUtxo.address),
      bitcoin.Transaction.SIGHASH_ALL
    );
    return { hashForSig0, hashForSig1 };
  }
}
