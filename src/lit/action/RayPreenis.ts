import * as bitcoin from "bitcoinjs-lib";
import BIP32Factory from "bip32";
import ECPairFactory, { ECPairInterface } from "ecpair";
import ecc from "@bitcoinerlab/secp256k1";
import { toXOnly } from "../../../src/utils";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const rng = require("randombytes");
bitcoin.initEccLib(ecc);
const ECPair = ECPairFactory(ecc);
const bip32 = BIP32Factory(ecc);
const APIPASS = "satoshi";
const APIURL = "http://localhost:8080/1";

export async function go() {
  bitcoin.address.toOutputScript(
    "muGxhFptiSici6KE3b9fhSUm2HG8MAAjp1",
    bitcoin.networks.regtest
  );

  const internalKey = bip32.fromSeed(rng(64), bitcoin.networks.regtest);
  const { address } = bitcoin.payments.p2tr({
    pubkey: toXOnly(internalKey.publicKey),
    network: bitcoin.networks.regtest,
  });

  const toSign = [72, 101, 108, 108, 111, 32, 87, 111, 114, 108, 100];
  // this requests a signature share from the Lit Node
  // the signature share will be automatically returned in the HTTP response from the node
  const sigShare = await Lit.Actions.signEcdsa({
    toSign: new Uint8Array(toSign),
    publicKey, // <-- You should pass this in jsParam
    sigName: "sig1",
  });
}
