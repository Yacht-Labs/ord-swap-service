import { ethers } from "ethers";
import { BIP32Factory, BIP32Interface, BIP32API } from "bip32";
import * as ecc from "tiny-secp256k1";
import * as bitcoin from "bitcoinjs-lib";
import * as secp from "@noble/secp256k1";
import * as ethSigUtil from "@metamask/eth-sig-util";
import { EthEncryptedData } from "eth-sig-util";

class TaprootWallet {
  private readonly bip32: BIP32API;

  private readonly bitcoin: any;

  private readonly secp: any;

  private readonly ethSigUtil: any;

  constructor() {
    this.bip32 = BIP32Factory(ecc);
    this.bitcoin = bitcoin;
    this.bitcoin.initEccLib(ecc);
    this.secp = secp;
    this.ethSigUtil = ethSigUtil;
  }

  private static toXOnly = (pubKey: Buffer) =>
    pubKey.length === 32 ? pubKey : pubKey.slice(1, 33);

  public static isValidTaprootAddress(
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

  public async getTaprootKeyPairFromSignature(
    signature: string
  ): Promise<BIP32Interface> {
    const seed = ethers.utils.arrayify(
      ethers.utils.keccak256(ethers.utils.arrayify(signature))
    );
    const root = this.bip32.fromSeed(Buffer.from(seed));
    return root.derivePath("m/0/0");
  }

  public static async getTaprootAddressFromTaprootChild(
    taprootChild: BIP32Interface
  ): Promise<string | undefined> {
    const { address: taprootAddress } = bitcoin.payments.p2tr({
      internalPubkey: TaprootWallet.toXOnly(taprootChild.publicKey),
      network: bitcoin.networks.bitcoin,
    });
    return taprootAddress;
  }

  public async verifyMessageWithTaproot(
    message: string,
    privateKey: string
  ): Promise<boolean> {
    const messageHash = await this.secp.utils.sha256(Buffer.from(message));
    const rpub = this.secp.schnorr.getPublicKey(privateKey);
    const sig = await this.secp.schnorr.sign(messageHash, privateKey);
    const isValid = await this.secp.schnorr.verify(sig, messageHash, rpub);
    return isValid;
  }

  public static encryptMessageWithPubkey(
    message: string,
    pubkey: string
  ): EthEncryptedData {
    const encryptedPrivateKey = ethSigUtil.encrypt({
      publicKey: pubkey,
      data: message,
      version: "x25519-xsalsa20-poly1305",
    });
    return encryptedPrivateKey;
  }
}
export default TaprootWallet;
