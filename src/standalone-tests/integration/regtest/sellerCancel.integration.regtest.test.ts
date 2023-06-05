import { LitService } from "../../../services/lit/LitService";
import ecc from "@bitcoinerlab/secp256k1";
import * as bitcoin from "bitcoinjs-lib";
import { RegtestUtils } from "regtest-client";
import { getBtcNetwork, sleep } from "../../../utils";
import { BtcTransactionService } from "../../../services/bitcoin/BtcTransactionService";
import { HiroInscriptionAPI } from "../../../api/inscription/hiro/HiroInscriptionAPI";
import request from "supertest";
import { startServer } from "../../../server/server";
import {
  sellerEthWallet,
  buyerEthWallet,
  loserEthWallet,
} from "../../../utils";
import { setUpPkpIntegrationTest } from "../../../utils/lit";

import ECPairFactory, { ECPairInterface } from "ecpair";

bitcoin.initEccLib(ecc);
const ECPair = ECPairFactory(ecc);

export function generateRandomBtcAddress() {
  const keyPair = ECPair.makeRandom({ network: getBtcNetwork() });
  const { address } = bitcoin.payments.p2pkh({
    pubkey: keyPair.publicKey,
    network: getBtcNetwork(),
  });
  return address;
}

let server: any;
bitcoin.initEccLib(ecc);
const regtestUtils = new RegtestUtils();
const btcPayoutAddress = generateRandomBtcAddress();
const ethPrice = "0";
let inscriptionId: string;
let pkp: any;
let pkpBtcAddress: string;
let pkpEthAddress: string;
let litActionCode: string;

const litService = new LitService();

describe("InscriptionPkpSwap Seller Cancel Integration", () => {
  beforeAll(async () => {
    try {
      server = await startServer(3002);
      ({ pkp, pkpBtcAddress, pkpEthAddress, inscriptionId, litActionCode } =
        await setUpPkpIntegrationTest(
          ethPrice,
          sellerEthWallet,
          buyerEthWallet,
          loserEthWallet
        ));
    } catch (err) {
      console.log("error setting up integration test", err);
    }
  }, 300000);

  afterAll(async () => {
    await server.close();
  });
  it("should get a signature to send the ordinal to the seller on cancel", async () => {
    const res = await request(server).get(`/swapdata`).query({
      pkpBtcAddress,
      inscriptionId,
      pkpEthAddress,
      ethPrice,
      btcPayoutAddress,
    });
    const {
      cardinalUtxo,
      ordinalUtxo,
      hashForInput0,
      hashForInput1,
      transaction,
      winningTransfer,
      losingTransfers,
      maxPriorityFeePerGas,
      maxFeePerGas,
      accountAddress,
    } = res.body;
    const { response, signatures } = await litService.runLitAction({
      pkpPublicKey: pkp.publicKey,
      code: litActionCode,
      authSig: await litService.generateAuthSig(),
      pkpEthAddress,
      pkpBtcAddress,
      btcPayoutAddress,
      isCancel: true,
      isUnitTest: false,
      cardinalUtxo,
      ordinalUtxo,
      hashForInput0,
      hashForInput1,
      transaction,
      winningTransfer,
      losingTransfers,
      maxPriorityFeePerGas,
      maxFeePerGas,
      accountAddress: sellerEthWallet.address,
    });
    expect(signatures.cancelHashForInput0).toBeDefined();
    expect(signatures.cancelHashForInput1).toBeDefined();

    const txManager = new BtcTransactionService();
    const tx = txManager.buildLitBtcTransaction(
      response.response!.btcTransaction!,
      signatures.cancelHashForInput0!,
      signatures.cancelHashForInput1!,
      pkp.publicKey
    );
    const hiroAPI = new HiroInscriptionAPI();
    await regtestUtils.broadcast(tx);
    await regtestUtils.mine(1);
    await sleep(4000);
    const inscription = await hiroAPI.getInscription(inscriptionId);
    expect(inscription.address).toEqual(btcPayoutAddress);
  }, 300000);
});
