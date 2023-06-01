import BIP32Factory from "bip32";
import * as bitcoin from "bitcoinjs-lib";
import ECPairFactory, { ECPairInterface } from "ecpair";
import { RegtestUtils } from "regtest-client";
import ecc from "@bitcoinerlab/secp256k1";
import { sleep, toXOnly } from "../../../utils";
import { HiroInscriptionAPI } from "./HiroInscriptionAPI";
import { createInscription } from "../../../standalone-tests/integration/regtest/inscriber";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const rng = require("randombytes");
bitcoin.initEccLib(ecc);
const ECPair = ECPairFactory(ecc);
const bip32 = BIP32Factory(ecc);
const APIPASS = "satoshi";
const APIURL = "http://localhost:8080/1";
const regtestUtils = new RegtestUtils({ APIPASS, APIURL });

describe("HiroInscriptionAPI", () => {
  let keyPair: ECPairInterface;
  let p2trAddress: string;

  beforeEach(async () => {
    const internalKey = bip32.fromSeed(rng(64), bitcoin.networks.regtest);
    const { address } = bitcoin.payments.p2tr({
      pubkey: toXOnly(internalKey.publicKey),
      network: bitcoin.networks.regtest,
    });
    p2trAddress = address!;
  });

  it("Can create and retrieve inscriptions from regtest", async () => {
    if (!p2trAddress) throw new Error("Address is null");
    const hiroInscriptionApi = new HiroInscriptionAPI();
    await createInscription(p2trAddress);
    await regtestUtils.mine(2);
    await sleep(2000);
    const inscriptions = await hiroInscriptionApi.getInscriptionsByAddress(
      p2trAddress
    );
    expect(inscriptions).toHaveLength(1);
    expect(inscriptions[0].address).toBe(p2trAddress);
  }, 60000);
});
