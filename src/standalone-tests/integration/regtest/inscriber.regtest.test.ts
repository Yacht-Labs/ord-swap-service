import { HiroInscriptionAPI } from "./../../../api/inscription/HiroInscriptionAPI";
import child_process from "child_process";
import { ECPairFactory } from "ecpair";
import ecc from "@bitcoinerlab/secp256k1";
import * as bitcoin from "bitcoinjs-lib";
import { RegtestUtils } from "regtest-client";
import { BtcTransactionService } from "../../../services/bitcoin/BtcTransactionService";
import { sleep } from "../../../utils";
import { createInscription } from "./inscriber";

describe("Insciber", () => {
  bitcoin.initEccLib(ecc);
  const ECPair = ECPairFactory(ecc);
  const APIPASS = "satoshi";
  const APIURL = "http://localhost:8080/1";
  const regtestUtils = new RegtestUtils({ APIPASS, APIURL });

  it("should be able to create a new inscription", async () => {
    // send to legacy, segwit and taproot addresses
    const keyPair = ECPair.makeRandom({ network: bitcoin.networks.regtest });
    const { address } = bitcoin.payments.p2wpkh({
      pubkey: keyPair.publicKey,
      network: bitcoin.networks.regtest,
    });

    const scriptPubKey = bitcoin.address.toOutputScript(
      address!,
      regtestUtils.network
    );
    await createInscription(scriptPubKey);

    const cardinal = await regtestUtils.unspents(address!);
    expect(cardinal).toHaveLength(1);

    await regtestUtils.faucet(address!, 1e5);
    await regtestUtils.mine(1);
    const unspents = await regtestUtils.unspents(address!);
    expect(unspents).toHaveLength(2);

    const hiroApi = new HiroInscriptionAPI();
    const inscription = await hiroApi.getInscriptionsByAddress(address!);
    expect(inscription).not.toBeNull();

    const btcTransactionService = new BtcTransactionService();
    const receivingAddress = regtestUtils.RANDOM_ADDRESS;

    const ordinalUtxo = unspents.find(
      (u) => u.txId === inscription.txid && u.vout === inscription.vout
    );

    const cardinalUtxo = unspents.find(
      (u) => u.txId !== inscription.txid || u.vout !== inscription.vout
    );

    // map ordinal to a UTXO
    // cardinal is the other one
    // map them to
    // const transaction = await btcTransactionService.constructTransaction();

    // construct btc transaction with inscription first and other unspent second to destination address
    // console.log(inscription);

    // const transaction = new bitcoin.Transaction();

    // compute fee

    // sign the transaction

    // send the transaction

    // mine

    // check that inscription is at the destination address

    // child_process.exec(
    //   `ts-node /Users/traus/dev/yacht/btc/inscriber/inscriberModule.ts ${address}`,
    //   async (err, out) => {
    //     try {
    //       if (err) {
    //         console.log(err);
    //         return;
    //       }
    //       const unspents = await regtestUtils.unspents(
    //         bitcoin.address
    //           .toOutputScript(address!, bitcoin.networks.regtest)
    //           .toString("hex")
    //       );
    //       expect(unspents).toHaveLength(1);
    //       console.log("done");
    //       done();
    //     } catch (err) {
    //       done(err);
    //     }
    //   }
    // );

    //   done();
    // } catch (err) {
    //   done(err);
    // }
  }, 60000);

  xit("should be able to send an inscription from a taproot address to a segwit address", () => {});

  xit("Should be able to send an inscription from a segwit address to a taproot address", () => {});
});
