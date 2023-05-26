import { ListingService } from "./../listings/ListingService";
import { InscriptionService } from "./../inscription/InscriptionService";
import { BtcTransactionService } from "./BtcTransactionService";
import { HiroInscriptionAPI } from "../../api/inscription/hiro/HiroInscriptionAPI";
import { RegtestUtxoAPI } from "../../api/bitcoin/utxo/regtest/RegtestUtxoAPI";
import ecc from "@bitcoinerlab/secp256k1";
import BIP32Factory from "bip32";
import * as bitcoin from "bitcoinjs-lib";
import ECPairFactory, { ECPairInterface } from "ecpair";
import { RegtestUtils } from "regtest-client";
import { sleep, toXOnly, unpadHexString } from "../../utils";
import { createInscription } from "../../standalone-tests/integration/regtest/inscriber";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const rng = require("randombytes");
bitcoin.initEccLib(ecc);
const bip32 = BIP32Factory(ecc);
const ECPair = ECPairFactory(ecc);
const APIPASS = "satoshi";
const APIURL = "http://localhost:8080/1";
const regtestUtils = new RegtestUtils({ APIPASS, APIURL });

describe("Bitcoin Transaction Service", () => {
  let keyPair: ECPairInterface;
  let p2pkh: string;
  let p2tr: string;
  let inscriptionId: string;

  const inscriptionAPI = new HiroInscriptionAPI();
  const utxoAPI = new RegtestUtxoAPI();
  const listingService = new ListingService(inscriptionAPI, utxoAPI);
  const inscriptionService = new InscriptionService(listingService);
  const btcTransactionService = new BtcTransactionService();

  beforeEach(async () => {
    const internalKey = bip32.fromSeed(rng(64), bitcoin.networks.regtest);
    const { address: p2trAddress } = bitcoin.payments.p2tr({
      pubkey: toXOnly(internalKey.publicKey),
      network: bitcoin.networks.regtest,
    });
    p2tr = p2trAddress!;

    keyPair = ECPair.fromPrivateKey(internalKey.privateKey!);
    const { address: p2pkhAddress } = bitcoin.payments.p2pkh({
      pubkey: keyPair.publicKey,
      network: bitcoin.networks.regtest,
    });
    p2pkh = p2pkhAddress!;

    await regtestUtils.faucet(p2pkh, 1e10);
    const inscription = await createInscription(p2pkh);
    inscriptionId = inscription.inscriptionId;
  });

  it("Prepares a transaction with a cardinal input and ordinal output to buyer address", async () => {
    // get a cardinal and ordinal utxo using InscriptionService
    // prepare a transaction using BtcTransactionService
    // check that the transaction has the correct inputs and outputs

    const { ordinalUtxo, cardinalUtxo } =
      await inscriptionService.checkInscriptionStatus(p2pkh, inscriptionId);

    const { hashForInput0, hashForInput1, transaction } =
      await btcTransactionService.prepareInscriptionTransaction({
        ordinalUtxo,
        cardinalUtxo,
        destinationAddress: p2tr,
      });

    const signature0 = keyPair.sign(hashForInput0);
    const signature1 = keyPair.sign(hashForInput1);

    const compiledSignature0 = bitcoin.script.compile([
      bitcoin.script.signature.encode(
        signature0,
        bitcoin.Transaction.SIGHASH_ALL
      ),
      keyPair.publicKey,
    ]);

    const compiledSignature1 = bitcoin.script.compile([
      bitcoin.script.signature.encode(
        signature1,
        bitcoin.Transaction.SIGHASH_ALL
      ),
      keyPair.publicKey,
    ]);

    transaction.setInputScript(0, compiledSignature0);
    transaction.setInputScript(1, compiledSignature1);

    const txHex = transaction.toHex();
    const txId = transaction.getId();

    await regtestUtils.broadcast(txHex);

    const inscriptionTx = await regtestUtils.fetch(txId);
    await regtestUtils.mine(1);
    await sleep(5000);
    const inscription = await inscriptionAPI.getInscription(inscriptionId);
    expect(inscription.address).toEqual(p2tr);
    expect(inscription.location.split(":")[0]).toEqual(txId);
  }, 600000);

  // TODO: Negative cases
  it("Can add a Lit Action signature to the transaction", async () => {
    const { ordinalUtxo, cardinalUtxo } =
      await inscriptionService.checkInscriptionStatus(p2pkh, inscriptionId);

    const { hashForInput0, hashForInput1, transaction } =
      await btcTransactionService.prepareInscriptionTransaction({
        ordinalUtxo,
        cardinalUtxo,
        destinationAddress: p2tr,
      });

    const signature0 = keyPair.sign(hashForInput0);
    const signature1 = keyPair.sign(hashForInput1);

    const txHex = btcTransactionService.buildLitBtcTransaction(
      transaction.toHex(),
      unpadHexString(signature0),
      unpadHexString(signature1),
      keyPair.publicKey.toString("hex")
    );
    const transactionObject = bitcoin.Transaction.fromHex(txHex);
    const txId = transactionObject.getId();
    await regtestUtils.broadcast(txHex);

    const inscriptionTx = await regtestUtils.fetch(txId);
    await regtestUtils.mine(1);
    await sleep(5000);
    const inscription = await inscriptionAPI.getInscription(inscriptionId);
    expect(inscription.address).toEqual(p2tr);
    expect(inscription.location.split(":")[0]).toEqual(txId);
  }, 20000);
});
