import { ethers } from "ethers";
import { BIP32Factory, BIP32Interface } from "bip32";
import * as ecc from "tiny-secp256k1";
import ECPairFactory from "ecpair";
import * as bitcoin from "bitcoinjs-lib";
import * as bipSchnorr from "bip-schnorr";
import * as secp256k1 from "secp256k1";
import { bech32, bech32m } from "bech32";
import * as bcrypto from "bcrypto";

const bip32 = BIP32Factory(ecc);
bitcoin.initEccLib(ecc);
const toXOnly = (pubKey: Buffer) =>
  pubKey.length === 32 ? pubKey : pubKey.slice(1, 33);

const ECPair = ECPairFactory(ecc);

function isValidTaprootAddress(
  address: string,
  network: bitcoin.Network
): boolean {
  try {
    const decoded = bitcoin.address.fromBech32(address);

    // Ensure the address has a SegWit version 1 and it's using the correct network
    if (decoded.version === 1 && decoded.prefix === network.bech32) {
      return true;
    }
  } catch (error) {
    // Ignore error as it's likely due to an invalid address
  }

  return false;
}

const simulatedPKPKeyPair = ethers.Wallet.createRandom();
const uncompressedPKPPublicKey = ethers.utils.computePublicKey(
  simulatedPKPKeyPair.publicKey,
  false
);
let messageToSign;
let signature;
let seed;
let root;
let taprootChild: BIP32Interface;
let taprootAddress: string | undefined;

describe("Test Taproot wallet", () => {
  beforeAll(async () => {
    messageToSign = "TaprootCreationSigningMessage";
    signature = await simulatedPKPKeyPair.signMessage(messageToSign);
    seed = ethers.utils.arrayify(
      ethers.utils.keccak256(ethers.utils.arrayify(signature))
    );
    root = bip32.fromSeed(Buffer.from(seed));
    taprootChild = root.derivePath("m/0/0");
    ({ address: taprootAddress } = bitcoin.payments.p2tr({
      internalPubkey: toXOnly(taprootChild.publicKey),
      network: bitcoin.networks.bitcoin,
    }));
  });
  test("It can create a taproot address from uncompressed public key", async () => {
    if (taprootAddress === undefined)
      throw new Error("Taproot address is undefined");
    expect(
      isValidTaprootAddress(taprootAddress, bitcoin.networks.bitcoin)
    ).toBe(true);
  });

  test("It can create a taproot private key from uncompressed public key", async () => {
    const { privateKey } = taprootChild;
    if (privateKey === undefined)
      throw new Error("Taproot address is undefined");
    expect(privateKey.length).toBe(32);
  });
});

// get taproot address from private key
// const hrp = "bc";

// const { publicKey } = ECPair.fromPrivateKey(privateKey, {
//   compressed: true,
// });
// // const TAG32 = Buffer.alloc(32, "TapTweak", "utf8");
// const taprootOutputKey = bitcoin.crypto.taggedHash("TapTweak", publicKey);
// const words = bech32.toWords(taprootOutputKey);
// words.unshift(1); // Add witness version 1
// const testTaprootAddress = bech32m.encode(hrp, words);
// expect(testTaprootAddress).toBe(taprootAddress);
