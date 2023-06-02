import { LitService } from "../../../services/lit/LitService";
import ecc from "@bitcoinerlab/secp256k1";
import * as bitcoin from "bitcoinjs-lib";
import { RegtestUtils } from "regtest-client";
import { generateRandomBtcAddress, sleep } from "../../../utils";
import { BtcTransactionService } from "../../../services/bitcoin/BtcTransactionService";
import { HiroInscriptionAPI } from "../../../api/inscription/hiro/HiroInscriptionAPI";
import request from "supertest";
import { startServer } from "../../../server/server";
import { sellerEthWallet, buyerEthWallet } from "../../../utils";
import { setUpPkpIntegrationTest } from "../../../utils/lit";
import { ethers, Signature } from "ethers";
// eslint-disable-next-line import/no-extraneous-dependencies
import { serialize, UnsignedTransaction } from "@ethersproject/transactions";
import { readGoerliRpcUrlEnv } from "../../../utils/env";

let server: any;
bitcoin.initEccLib(ecc);
const regtestUtils = new RegtestUtils();
const btcPayoutAddress = generateRandomBtcAddress();
const ethPrice = "0.000001";
let inscriptionId: string;
let pkp: any;
let pkpBtcAddress: string;
let pkpEthAddress: string;
let litActionCode: string;

const litService = new LitService();

describe("InscriptionPkpSwap Buyer Withdraw Integration", () => {
  beforeAll(async () => {
    try {
      server = await startServer(3002);
      ({ pkp, pkpBtcAddress, pkpEthAddress, inscriptionId, litActionCode } =
        await setUpPkpIntegrationTest(
          ethPrice,
          sellerEthWallet,
          buyerEthWallet
        ));
    } catch (err) {
      console.log("error setting up integration test", err);
    }
  }, 300000);

  afterAll(async () => {
    await server.close();
  });

  xit("should get a signature to send the ordinal to the buyer", async () => {
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
    } = res.body;
    const { response, signatures } = await litService.runLitAction({
      pkpPublicKey: pkp.publicKey,
      code: litActionCode,
      authSig: await litService.generateAuthSig(
        1,
        "https://localhost/login",
        "1",
        buyerEthWallet
      ),
      pkpEthAddress,
      pkpBtcAddress,
      btcPayoutAddress,
      isCancel: false,
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
    });
    expect(signatures.hashForInput0).toBeDefined();
    expect(signatures.hashForInput1).toBeDefined();

    const txManager = new BtcTransactionService();
    const tx = txManager.buildLitBtcTransaction(
      response.response!.btcTransaction!,
      signatures.hashForInput0,
      signatures.hashForInput1,
      pkp.publicKey
    );
    const hiroAPI = new HiroInscriptionAPI();
    await regtestUtils.broadcast(tx);
    await regtestUtils.mine(1);
    await sleep(4000);
    const inscription = await hiroAPI.getInscription(inscriptionId);
    expect(inscription.address).toEqual(btcPayoutAddress);
  }, 300000);

  it("should get a signature to send the eth to the seller", async () => {
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
    } = res.body;
    const { response, signatures } = await litService.runLitAction({
      pkpPublicKey: pkp.publicKey,
      code: litActionCode,
      authSig: await litService.generateAuthSig(
        1,
        "https://localhost/login",
        "1",
        sellerEthWallet
      ),
      pkpEthAddress,
      pkpBtcAddress,
      btcPayoutAddress: "muGxhFptiSici6KE3b9fhSUm2HG8MAAjp1",
      isCancel: false,
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
    });
    // TODO: Check for empties
    const unsignedEthTransaction = response.response!
      .unsignedEthTransaction as UnsignedTransaction;
    const signedTx = serialize(
      unsignedEthTransaction,
      signatures!.ethWinnerSignature!.signature
    );
    const provider = new ethers.providers.JsonRpcProvider(
      readGoerliRpcUrlEnv()
    );
    const tx = await provider.sendTransaction(signedTx);
    const receipt = await tx.wait(1);
    console.log("eth transaction: ", receipt.transactionHash);
  }, 3000000);

  xit("should get a signature to send the ordinal to the seller on cancel", async () => {
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
    } = res.body;
    const { response, signatures } = await litService.runLitAction({
      pkpPublicKey: pkp.publicKey,
      code: litActionCode,
      authSig: await litService.generateAuthSig(
        1,
        "https://localhost/login",
        "1",
        sellerEthWallet
      ),
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
    });
    expect(signatures.hashForInput0).toBeDefined();
    expect(signatures.hashForInput1).toBeDefined();

    const txManager = new BtcTransactionService();
    const tx = txManager.buildLitBtcTransaction(
      response.response!.btcTransaction!,
      signatures.hashForInput0,
      signatures.hashForInput1,
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
