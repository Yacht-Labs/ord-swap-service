import { LitService } from "../../../services/lit/LitService";
import {
  readGoerliPrivateKey,
  readGoerliPrivateKey2,
  readGoerliRpcUrlEnv,
} from "../../../utils/env";
import { LIT_SWAP_FILE_NAME } from "../../../constants";
import { ethers } from "ethers";
import ecc from "@bitcoinerlab/secp256k1";
import * as bitcoin from "bitcoinjs-lib";
import { RegtestUtils } from "regtest-client";
import { sleep } from "../../../utils";
import { createInscription } from "../../../standalone-tests/integration/regtest/inscriber";
import { BtcTransactionService } from "../../../services/bitcoin/BtcTransactionService";
import { HiroInscriptionAPI } from "../../../api/inscription/hiro/HiroInscriptionAPI";

// eslint-disable-next-line @typescript-eslint/no-var-requires
bitcoin.initEccLib(ecc);
const APIPASS = "satoshi";
const APIURL = "http://localhost:8080/1";
const regtestUtils = new RegtestUtils({ APIPASS, APIURL });

const ethPrice = "0.000001";
let inscriptionId: string;
let pkp: any;
let pkpBtcAddress: string;
let pkpEthAddress: string;
let litActionCode: string;

const sellerEthWallet = new ethers.Wallet(
  readGoerliPrivateKey(),
  new ethers.providers.JsonRpcProvider(readGoerliRpcUrlEnv())
);

const buyerEthWallet = new ethers.Wallet(
  readGoerliPrivateKey2(),
  new ethers.providers.JsonRpcProvider(readGoerliRpcUrlEnv())
);

const litService = new LitService();

describe("InscriptionPkpSwap Buyer Withdraw Integration", () => {
  beforeAll(async () => {
    try {
      pkp = await litService.mintPkp();
      console.log("pkp", pkp);

      pkpBtcAddress = litService.generateBtcAddress(pkp.publicKey);
      pkpEthAddress = ethers.utils.computeAddress(pkp.publicKey);

      await regtestUtils.faucet(pkpBtcAddress, 1e10);
      await sleep(2000);
      const inscription = await createInscription(pkpBtcAddress);

      // await regtestUtils.mine(1);
      inscriptionId = inscription.inscriptionId;

      litActionCode = (
        await litService.loadActionCode(LIT_SWAP_FILE_NAME, {
          ethPrice: ethPrice,
          ethPayoutAddress: sellerEthWallet.address,
          inscriptionId,
          chainId: "1",
        })
      )
        .replace(/ethers\.ethers/g, "ethers")
        .replace("exports.go = go;", "")
        .replace("var ethers = require('ethers');", "")
        .replace("require('bitcoinjs-lib');", "");
      console.log("litActionCode", litActionCode);
      // grant here mf
      const IPFShash = await LitService.getIPFSHash(litActionCode);
      await litService.addPermittedAction(pkp.tokenId, IPFShash);

      const tx = await buyerEthWallet.sendTransaction({
        to: pkpEthAddress,
        value: ethers.utils.parseEther(ethPrice),
      });

      await tx.wait(1);
    } catch (err) {
      console.log("error minting pkp", err);
    }
  }, 300000);

  it("should get a signature to send the ordinal to the buyer", async () => {
    console.log(process.env.NODE_ENV);
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
      btcPayoutAddress: "muGxhFptiSici6KE3b9fhSUm2HG8MAAjp1",
      isCancel: false,
      isUnitTest: false,
    });
    console.log(buyerEthWallet.address);
    console.log("signatures", signatures);
    console.log("response", response);
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
