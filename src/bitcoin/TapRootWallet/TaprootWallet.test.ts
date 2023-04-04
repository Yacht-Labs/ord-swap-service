import { ethers } from "ethers";
import { BIP32Interface } from "bip32";
import * as bitcoin from "bitcoinjs-lib";
import * as ethSigUtil from "@metamask/eth-sig-util";
import TaprootWallet from "./TaprootWallet";

const METAMASK_PRIVATE_KEY =
  "bd5cbf402f223d4e2660c60683d9eff376f16a7116e1ea24c95c4fc050348ca3";

const simulatedPKPKeyPair = ethers.Wallet.createRandom();

let messageToSign;
let signature;
let taprootChild: BIP32Interface;
let taprootAddress: string | undefined;

const taprootWallet = new TaprootWallet();

describe("Test Taproot wallet", () => {
  beforeAll(async () => {
    messageToSign = "TaprootCreationSigningMessage";
    signature = await simulatedPKPKeyPair.signMessage(messageToSign);
    taprootChild = await taprootWallet.getTaprootKeyPairFromSignature(
      signature
    );
  });
  test("It can create a taproot address from uncompressed public key", async () => {
    taprootAddress = await TaprootWallet.getTaprootAddressFromTaprootChild(
      taprootChild
    );
    if (taprootAddress === undefined)
      throw new Error("Taproot address is undefined");
    expect(
      TaprootWallet.isValidTaprootAddress(
        taprootAddress,
        bitcoin.networks.bitcoin
      )
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
    const isValid = await taprootWallet.verifyMessageWithTaproot(
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
    const encryptedPrivateKey = TaprootWallet.encryptMessageWithPubkey(
      hexPrivateKey,
      encryptionPublicKey
    );
    console.log("encrypted private key", encryptedPrivateKey);

    expect(encryptedPrivateKey).not.toBeNull();
  });
});
