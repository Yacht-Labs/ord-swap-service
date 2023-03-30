import { ethers } from "ethers";
import { BIP32Factory, BIP32Interface } from "bip32";
import * as ecc from "tiny-secp256k1";
import * as bitcoin from "bitcoinjs-lib";
import * as secp from "@noble/secp256k1";
import * as ethSigUtil from "@metamask/eth-sig-util";

const METAMASK_PRIVATE_KEY =
  "bd5cbf402f223d4e2660c60683d9eff376f16a7116e1ea24c95c4fc050348ca3";

const bip32 = BIP32Factory(ecc);
bitcoin.initEccLib(ecc);
const toXOnly = (pubKey: Buffer) =>
  pubKey.length === 32 ? pubKey : pubKey.slice(1, 33);

// const ECPair = ECPairFactory(ecc);

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

async function getTaprootKeyPairFromSignature(
  signature: string
): Promise<BIP32Interface> {
  const seed = ethers.utils.arrayify(
    ethers.utils.keccak256(ethers.utils.arrayify(signature))
  );
  const root = bip32.fromSeed(Buffer.from(seed));
  return root.derivePath("m/0/0");
}

async function verifyMessageWithTaproot(
  message: string,
  privateKey: string
): Promise<boolean> {
  const messageHash = await secp.utils.sha256(Buffer.from(message));
  const rpub = secp.schnorr.getPublicKey(privateKey);
  const sig = await secp.schnorr.sign(messageHash, privateKey);
  const isValid = await secp.schnorr.verify(sig, messageHash, rpub);
  return isValid;
}

const simulatedPKPKeyPair = ethers.Wallet.createRandom();

let messageToSign;
let signature;
let taprootChild: BIP32Interface;
let taprootAddress: string | undefined;

describe("Test Taproot wallet", () => {
  beforeAll(async () => {
    messageToSign = "TaprootCreationSigningMessage";
    signature = await simulatedPKPKeyPair.signMessage(messageToSign);
    taprootChild = await getTaprootKeyPairFromSignature(signature);
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

  test("It can sign a valid message with the taproot private key", async () => {
    const message = "TaprootSigningMessage";
    const { privateKey } = taprootChild;
    if (privateKey === undefined)
      throw new Error("Taproot address is undefined");
    const isValid = await verifyMessageWithTaproot(
      message,
      privateKey.toString("hex")
    );
    expect(isValid).toBe(true);
  });

  test("It can encrypt the taproot private key with an ethereum private key", async () => {
    // get the encryption public key
    const encryptionPublicKey =
      ethSigUtil.getEncryptionPublicKey(METAMASK_PRIVATE_KEY);
    const { privateKey } = taprootChild;
    if (privateKey === undefined)
      throw new Error("Taproot address is undefined");
    const hexPrivateKey = privateKey.toString("hex");

    console.log("taproot private key", hexPrivateKey);
    // encrypt the taproot private key
    const encryptedPrivateKey = ethSigUtil.encrypt({
      publicKey: encryptionPublicKey,
      data: hexPrivateKey,
      version: "x25519-xsalsa20-poly1305",
    });
    console.log("encrypted private key", encryptedPrivateKey);

    expect(true).toBe(true);
  });
});
