import { Utxo } from "../../types/models";
import * as bitcoin from "bitcoinjs-lib";
import ecc from "@bitcoinerlab/secp256k1";
import {
  padHexString,
  reverseBuffer,
  toYachtOutputScript,
} from "../../utils/btc";
import { toOutputScript } from "bitcoinjs-lib/src/address";
import { SignatureData } from "../../types";
import { CryptoApisBroadcasterAPI } from "../../api/bitcoin/broadcaster/CryptoApisBroadcasterAPI";
import { BtcBroadcasterApi } from "../../api/bitcoin/broadcaster/BtcBroadcasterApi";
import { RegtestBroadcasterAPI } from "../../api/bitcoin/broadcaster/RegtestBroadcasterAPI";
export class BtcTransactionService {
  private FEE_RATE = 30;
  private broadcasterApi: BtcBroadcasterApi;
  constructor() {
    bitcoin.initEccLib(ecc);
    this.broadcasterApi =
      process.env.NODE_ENV === "test"
        ? new RegtestBroadcasterAPI()
        : new CryptoApisBroadcasterAPI();
  }

  public prepareInscriptionTransaction({
    ordinalUtxo,
    cardinalUtxo,
    destinationAddress,
  }: {
    ordinalUtxo: Utxo;
    cardinalUtxo: Utxo;
    destinationAddress: string;
  }) {
    const transaction = new bitcoin.Transaction();
    transaction.addInput(
      reverseBuffer(Buffer.from(ordinalUtxo.txId, "hex")),
      ordinalUtxo.vout
    );
    transaction.addInput(
      reverseBuffer(Buffer.from(cardinalUtxo.txId, "hex")),
      cardinalUtxo.vout
    );
    const outputScript = toYachtOutputScript(destinationAddress);
    transaction.addOutput(outputScript, ordinalUtxo.amount);
    // p2tr have 43 bytes size
    // each p2pkh have under 150 bytes size
    // 12 bytes fixed size
    // total 43*2 + 150*2 + 12 = 400 bytes
    transaction.addOutput(outputScript, cardinalUtxo.amount - 20000);
    const hashForInput0 = transaction.hashForSignature(
      0,
      toYachtOutputScript(ordinalUtxo.address),
      bitcoin.Transaction.SIGHASH_ALL
    );
    const hashForInput1 = transaction.hashForSignature(
      1,
      toYachtOutputScript(cardinalUtxo.address),
      bitcoin.Transaction.SIGHASH_ALL
    );
    return { hashForInput0, hashForInput1, transaction };
  }

  private addSignatureToTxInput(
    transaction: bitcoin.Transaction,
    signature: SignatureData,
    compressedPoint: Uint8Array,
    input: number
  ) {
    const sig = Buffer.from(
      padHexString(signature.r) + padHexString(signature.s),
      "hex"
    );
    const signedInput = bitcoin.script.compile([
      bitcoin.script.signature.encode(sig, bitcoin.Transaction.SIGHASH_ALL),
      Buffer.from(compressedPoint.buffer),
    ]);
    transaction.setInputScript(input, signedInput);
  }

  public buildLitBtcTransaction(
    transactionHex: string,
    hashForInput0: SignatureData,
    hashForInput1: SignatureData,
    pkpPublicKey: string
  ): string {
    const transaction = bitcoin.Transaction.fromHex(transactionHex);
    const compressedPoint = ecc.pointCompress(
      Buffer.from(pkpPublicKey.replace("0x", ""), "hex"),
      true
    );
    this.addSignatureToTxInput(transaction, hashForInput0, compressedPoint, 0);
    this.addSignatureToTxInput(transaction, hashForInput1, compressedPoint, 1);
    return transaction.toHex();
  }

  public async broadcastTransaction(transactionHex: string) {
    return this.broadcasterApi.broadcastTransaction(transactionHex);
  }
}
