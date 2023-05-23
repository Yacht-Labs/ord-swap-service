import BIP32Factory from "bip32";
import * as bitcoin from "bitcoinjs-lib";
import ECPairFactory, { ECPairInterface } from "ecpair";
import { RegtestUtils } from "regtest-client";
import ecc from "@bitcoinerlab/secp256k1";
import { toXOnly } from "../../../../utils";
import { RegtestUtxoAPI } from "./RegtestUtxoAPI";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const rng = require("randombytes");
bitcoin.initEccLib(ecc);
const ECPair = ECPairFactory(ecc);
const bip32 = BIP32Factory(ecc);
const APIPASS = "satoshi";
const APIURL = "http://localhost:8080/1";
const regtestUtils = new RegtestUtils({ APIPASS, APIURL });

describe("Regtest UTXO API", () => {
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

  it("Can retrieve utxos from regtest", async () => {
    const regtestUtxoApi = new RegtestUtxoAPI();
    // TODO: Write tests for the rest of address types
    if (!p2trAddress) throw new Error("Address is null");
    const faucet1 = await regtestUtils.faucet(p2trAddress, 1e10);
    const faucet2 = await regtestUtils.faucet(p2trAddress, 2e10);
    const unspents = await regtestUtxoApi.getUtxosByAddress(p2trAddress);
    expect(unspents).toHaveLength(2);
    expect(
      unspents.some((u) => u.txid === faucet1.txId && u.vout === faucet1.vout)
    );
    expect(
      unspents.some((u) => u.txid === faucet2.txId && u.vout === faucet2.vout)
    );
    expect(unspents.every((u) => (u.address = p2trAddress)));
  });
});
