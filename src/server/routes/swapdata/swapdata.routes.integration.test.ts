// /* eslint-disable @typescript-eslint/no-explicit-any */
import request from "supertest";
import { startServer } from "../../server"; // Import your server start function
import { LitService } from "../../../services/lit/LitService";
import { sleep } from "../../../utils";

import * as bitcoin from "bitcoinjs-lib";
import { RegtestUtils } from "regtest-client";
import { BIP32Factory } from "bip32";
import ECPairFactory, { ECPairInterface } from "ecpair";
import ecc from "@bitcoinerlab/secp256k1";
import { createInscription } from "../../../standalone-tests/integration/regtest/inscriber";

import { ethers } from "ethers";
import {
  readGoerliPrivateKey,
  readGoerliPrivateKey2,
  readGoerliRpcUrlEnv,
} from "../../../utils/env";

let server: any;
const litService = new LitService();
let pkp: any;
let pkpBtcAddress: string;
let inscriptionId: string;
let pkpEthAddress: string;
const ethPrice = ".000001";

const rng = require("randombytes");
bitcoin.initEccLib(ecc);
const ECPair = ECPairFactory(ecc);
const bip32 = BIP32Factory(ecc);
const APIPASS = "satoshi";
const APIURL = "http://localhost:8080/1";
const regtestUtils = new RegtestUtils({ APIPASS, APIURL });

const sourceWallet = new ethers.Wallet(
  readGoerliPrivateKey(),
  new ethers.providers.JsonRpcProvider(readGoerliRpcUrlEnv())
);

const sourceWallet2 = new ethers.Wallet(
  readGoerliPrivateKey2(),
  new ethers.providers.JsonRpcProvider(readGoerliRpcUrlEnv())
);

beforeAll(async () => {
  server = await startServer(3002);
  pkp = await litService.mintPkp();
  pkpBtcAddress = litService.generateBtcAddress(pkp.publicKey);
  pkpEthAddress = pkp.address;
}, 80000);

afterAll(async () => {
  server.close();
});

describe("Swapdata route", () => {
  xit("should error if no ordinal or eth exists on PKP", async () => {
    const res = await request(server)
      .get(
        `/swapdata?pkpBtcAddress=${pkpBtcAddress}&inscriptionId=${inscriptionId}&pkpEthAddress=${pkpEthAddress}&ethPrice=${ethPrice}`
      )
      .expect(200);
  }, 80000);

  it("should return swap data if ordinal and eth exists on PKP", async () => {
    const inscription = await createInscription(pkpBtcAddress);
    await regtestUtils.faucet(pkpBtcAddress, 1e10);
    await sleep(2000);

    inscriptionId = inscription.inscriptionId;
    console.log("inscriptionId", inscriptionId);
    //send eth from sourceWallet to destinationAddress
    const tx = await sourceWallet.sendTransaction({
      to: pkpEthAddress,
      value: ethers.utils.parseEther(ethPrice),
    });

    //wait for the transaction to be confirmed
    await tx.wait(1);

    //send eth from sourceWallet2 to destinationAddress
    const tx2 = await sourceWallet2.sendTransaction({
      to: pkpEthAddress,
      value: ethers.utils.parseEther(ethPrice),
    });

    //wait for the transaction to be confirmed
    await tx2.wait(1);

    const res = await request(server)
      .get(
        `/swapdata?pkpBtcAddress=${pkpBtcAddress}&inscriptionId=${inscriptionId}&pkpEthAddress=${pkpEthAddress}&ethPrice=${ethPrice}`
      )
      .expect(200);

    console.log("res", res.body);
  }, 80000);
});
