import { Utxo } from "../../types/models";
import { Transaction, script } from "bitcoinjs-lib";
import ecc from "@bitcoinerlab/secp256k1";
import {
  padHexString,
  reverseBuffer,
  toYachtOutputScript,
} from "../../utils/btc";
import { SignatureData } from "../../types";
export class BtcTransactionService {
  private FEE_RATE = 30;

  public prepareInscriptionTransaction({
    ordinalUtxo,
    cardinalUtxo,
    destinationAddress,
  }: {
    ordinalUtxo: Utxo;
    cardinalUtxo: Utxo;
    destinationAddress: string;
  }) {
    const transaction = new Transaction();
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
      Transaction.SIGHASH_ALL
    );
    const hashForInput1 = transaction.hashForSignature(
      1,
      toYachtOutputScript(cardinalUtxo.address),
      Transaction.SIGHASH_ALL
    );
    return { hashForInput0, hashForInput1, transaction };
  }

  private addSignatureToTxInput(
    transaction: Transaction,
    signature: SignatureData,
    compressedPoint: Uint8Array,
    input: number
  ) {
    const sig = Buffer.from(
      padHexString(signature.r) + padHexString(signature.s),
      "hex"
    );
    const signedInput = script.compile([
      script.signature.encode(sig, Transaction.SIGHASH_ALL),
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
    const transaction = Transaction.fromHex(transactionHex);
    const compressedPoint = ecc.pointCompress(
      Buffer.from(pkpPublicKey.replace("0x", ""), "hex"),
      true
    );
    this.addSignatureToTxInput(transaction, hashForInput0, compressedPoint, 0);
    this.addSignatureToTxInput(transaction, hashForInput1, compressedPoint, 1);
    return transaction.toHex();
  }
}
