process.env.NODE_ENV = "not-test";
import { LitService } from "../../../services/lit/LitService";
import {
  readGoerliPrivateKey,
  readGoerliPrivateKey2,
  readGoerliPrivateKey3,
  readGoerliRpcUrlEnv,
} from "../../../utils/env";
import { LIT_SWAP_FILE_NAME } from "../../../constants";
import { ethers } from "ethers";
import ecc from "@bitcoinerlab/secp256k1";
import BIP32Factory from "bip32";
import * as bitcoin from "bitcoinjs-lib";
import ECPairFactory, { ECPairInterface } from "ecpair";
import { RegtestUtils } from "regtest-client";
import { sleep, toXOnly, unpadHexString } from "../../../utils";
import { createInscription } from "./inscriber";

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

const losingEthWallet = new ethers.Wallet(
  readGoerliPrivateKey3(),
  new ethers.providers.JsonRpcProvider(readGoerliRpcUrlEnv())
);

describe("InscriptionPkpSwap Integration", () => {
  const litService = new LitService();

  beforeAll(async () => {
    try {
      pkp = await litService.mintPkp();
      console.log("pkp", pkp);

      // pkp = {
      //   tokenId:
      //     "93870482867678313018846126209288215264450473511694137284693118717772537491294",
      //   publicKey:
      //     "0x04a9942e195938a6d31fedf7cb991e0cc119fa7cf4d580b4a26e5b4f3efd441556c2d90643b6e0c094987c0bc24807dc0884715ed463db5bffe0b0c39a7d768c9b",
      //   address: "0x7cDCa4eA5cF3c5527E239D08F89F36EA54F80eCb",
      // };

      // pkpBtcAddress = muGxhFptiSici6KE3b9fhSUm2HG8MAAjp1
      // inscriptionId = b31629489700264f0b184920d8efd21e7e5f0d9bb16debc968b9ada938b2b70bi0

      pkpBtcAddress = litService.generateBtcAddress(pkp.publicKey);
      pkpEthAddress = ethers.utils.computeAddress(pkp.publicKey);

      await regtestUtils.faucet(pkpBtcAddress, 1e10);
      await sleep(2000);
      const inscription = await createInscription(pkpBtcAddress);

      await regtestUtils.mine(1);
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
        .replace("var ethers = require('ethers');", "");
      console.log("litActionCode", litActionCode);
      // grant here mf
      const IPFShash = await LitService.getIPFSHash(litActionCode);
      await litService.addPermittedAction(pkp.tokenId, IPFShash);
    } catch (err) {
      console.log("error minting pkp", err);
    }
  }, 300000);

  xit("should get no signatures when running the lit action on empty pkp", async () => {
    const litActionCode = await litService.loadActionCode(LIT_SWAP_FILE_NAME, {
      ethPrice: ethPrice,
      ethPayoutAddress: sellerEthWallet.address,
      inscriptionId,
      chainId: "1",
    });
    const { response, signatures } = await litService.runLitAction({
      // ipfsCID: "QmSCxGRRznNDJRDri9qd3batstNiSj9xDHRTVhj8j2TKfo",
      pkpPublicKey: pkp.publicKey,
      code: litActionCode,
      authSig: await litService.generateAuthSig(),
      pkpEthAddress,
      pkpBtcAddress,
      btcPayoutAddress: "muGxhFptiSici6KE3b9fhSUm2HG8MAAjp1",
      isUnitTest: false,
    });
    console.log("response", response);
    console.log("signatures", signatures);
    expect(response).toEqual({
      error: "Swap data API call returned not ok: 500: Internal Server Error",
    });
  }, 300000);

  it("should get a signature to transfer eth to the seller", async () => {
    const tx = await buyerEthWallet.sendTransaction({
      to: pkpEthAddress,
      value: ethers.utils.parseEther(ethPrice),
    });

    await tx.wait(1);

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
    });
    console.log("response", response);
    console.log("signatures", signatures);
    expect(signatures.ethWinnerSignature).toBeDefined();
  }, 300000);

  it("should get a signature to send ordinal back to seller if cancelled", async () => {
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
      isCancel: true,
      isUnitTest: false,
    });
    console.log("signatures", signatures);
    expect(signatures.cancelHashForInput0).toBeDefined();
    expect(signatures.cancelHashForInput1).toBeDefined();
  }, 300000);

  it("should get a signature to send the ordinal to the buyer", async () => {
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
    expect(signatures.hashForInput0).toBeDefined();
    expect(signatures.hashForInput1).toBeDefined();
  }, 300000);

  xit("should get a signature to send eth back to the losing wallet", async () => {
    const tx = await losingEthWallet.sendTransaction({
      to: pkpEthAddress,
      value: ethers.utils.parseEther(ethPrice),
    });

    await tx.wait(1);

    const { response, signatures } = await litService.runLitAction({
      pkpPublicKey: pkp.publicKey,
      code: litActionCode,
      authSig: await litService.generateAuthSig(
        1,
        "https://localhost/login",
        "1",
        losingEthWallet
      ),
      pkpEthAddress,
      pkpBtcAddress,
      btcPayoutAddress: "muGxhFptiSici6KE3b9fhSUm2HG8MAAjp1",
      isCancel: false,
      isUnitTest: false,
    });
    console.log(buyerEthWallet.address);
    console.log("signatures", signatures);
    expect(signatures.ethLoserSignature).toBeDefined();
  }, 300000);
});

// mint a pkp

// run the lit action
// expect to get no signatures

// create an inscription
// send the inscription to the pkp address
// send eth to the pkp address

// run the lit action as the seller
// expect to get a signature to transfer eth to the seller

// run the lit action as the buyer
// expect to get a signature to transfer ordinal to buyer

// import { LitService } from "../../../services/lit/LitService";
// import { LIT_SWAP_FILE_NAME } from "../../../constants";

// describe("InscriptionPkpSwap", () => {
//   const litService = new LitService();
//   let pkp: any;

//   beforeAll(async () => {
//     pkp = await litService.mintPkp();
//   }, 60000);

//   it("should not get any signatures if nothing exists on pkp", async () => {
//     const litActionCode = await litService.loadActionCode(LIT_SWAP_FILE_NAME, {
//       ethPrice: listing.ethPrice,
//       ethPayoutAddress: listing.account.ethAddress,
//       inscriptionId: listing.inscriptionId,
//     });
//     const { response, signatures } = await litService.runLitAction({
//       pkpPublicKey: listing.pkpPublicKey,
//       code: litActionCode,
//       authSig: authSig,
//       pkpEthAddress: ethers.utils.computeAddress(listing.pkpPublicKey),
//       pkpBtcAddress: listing.pkpBtcAddress,
//       btcPayoutAddress: taprootAddress,
//     });
//   });
// });
