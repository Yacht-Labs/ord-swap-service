import * as LitJsSdk from "@lit-protocol/lit-node-client-nodejs";
import { ethers } from "ethers";
import Hash from "ipfs-only-hash";
import * as bitcoin from "bitcoinjs-lib";
import * as ecc from "tiny-secp256k1";
import fs from "fs";
import pkpNftContract from "../../abis/PKPNFT.json";
import { PKP_CONTRACT_ADDRESS_MUMBAI } from "../../constants/index";
import { readMumbaiPrivateKeyEnv, readMumbaiRpcUrlEnv } from "../../util/env";
import { PKPNFT } from "../../../typechain-types/contracts/PKPNFT";
import { generateAuthSig } from "../../util/lit";

export class LitService {
  private litClient: any;

  private pkpContract: PKPNFT;

  private signer: ethers.Wallet;

  private btcTestNet: boolean;

  constructor({ btcTestNet = false }) {
    const privateKey = readMumbaiPrivateKeyEnv();
    this.btcTestNet = btcTestNet;
    this.signer = new ethers.Wallet(
      privateKey,
      new ethers.providers.JsonRpcProvider(readMumbaiRpcUrlEnv())
    );
    this.litClient = new LitJsSdk.LitNodeClientNodeJs({
      alertWhenUnauthorized: false,
      litNetwork: "serrano",
      debug: false,
    });
    this.pkpContract = new ethers.Contract(
      PKP_CONTRACT_ADDRESS_MUMBAI,
      pkpNftContract.abi,
      this.signer
    ) as PKPNFT;
  }

  private async connect() {
    try {
      await this.litClient.connect();
    } catch (err) {
      throw new Error(`Error connecting with LitJsSDK: ${err}`);
    }
  }

  /**
   * Converts an Ethereum public key to a Bitcoin address
   * @param {string} ethKey - Ethereum public key (compressed or uncompressed)
   * @returns {string} Bitcoin address
   * @example
   * const btcAddress = generateBtcAddress("0x043fd854ac22b8c80eadd4d8354ab8e74325265a065e566d82a21d578da4ef4d7af05d27e935d38ed28d5fda657e46a0dc4bab62960b4ad586b9c22d77f786789a");
   */
  generateBtcAddress(ethKey: string): string {
    let compressedPoint: Uint8Array;
    if (ethKey.length === 130) {
      compressedPoint = ecc.pointCompress(Buffer.from(ethKey, "hex"), true);
    } else if (ethKey.length === 132) {
      if (ethKey.slice(0, 2) !== "0x") {
        throw new Error("Invalid Ethereum public key");
      }
      compressedPoint = ecc.pointCompress(
        Buffer.from(ethKey.slice(2), "hex"),
        true
      );
    } else if (ethKey.length === 66) {
      compressedPoint = Buffer.from(ethKey, "hex");
    } else if (ethKey.length === 68) {
      if (ethKey.slice(0, 2) !== "0x") {
        throw new Error("Invalid Ethereum public key");
      }
      compressedPoint = Buffer.from(ethKey.slice(2), "hex");
    } else {
      throw new Error("Invalid Ethereum public key");
    }

    const { address } = bitcoin.payments.p2pkh({
      pubkey: Buffer.from(compressedPoint),
      network: this.btcTestNet
        ? bitcoin.networks.testnet
        : bitcoin.networks.bitcoin,
    });
    if (!address) throw new Error("Could not generate address");
    return address;
  }

  /**
   *
   * @param code - The Lit Action code to be hashed
   * @returns The IPFS CID
   */
  static async getIPFSHash(code: string): Promise<string> {
    try {
      return await Hash.of(code);
    } catch (err) {
      throw new Error(`Error hashing Lit Action code: ${err}`);
    }
  }

  /**
   * Mints a PKP NFT on the Polygon Mumbai network using the provided signer
   * @returns {Promise<{tokenId: string; publicKey: string; address: string}>} tokenId, publicKey, and address of the minted NFT
   * @throws Error if signer not set
   * @throws Error if signer provider not set
   * @example
   * const { tokenId, publicKey, address } = await litClient.mintPkp();
   */
  async mintPkp(): Promise<{
    tokenId: string;
    publicKey: string;
    address: string;
  }> {
    if (!this.signer) {
      throw new Error("Signer not set");
    }
    if (!this.signer.provider) {
      throw new Error("Signer provider not set, required to get gas info");
    }
    try {
      const feeData = await this.signer.provider.getFeeData();
      const mintPkpTx = await this.pkpContract.mintNext(2, {
        value: 1e14,
        maxFeePerGas: feeData.maxFeePerGas as ethers.BigNumber,
      });
      const minedMintPkpTx = await mintPkpTx.wait(2);
      const pkpTokenId = ethers.BigNumber.from(
        minedMintPkpTx.logs[1].topics[3]
      ).toString();
      const publicKey = await this.getPubKeyByPKPTokenId(pkpTokenId);
      return {
        tokenId: pkpTokenId,
        publicKey,
        address: ethers.utils.computeAddress(publicKey),
      };
    } catch (err) {
      throw new Error(`Error minting PKP: ${err}`);
    }
  }

  private async getPubKeyByPKPTokenId(tokenId: string): Promise<string> {
    try {
      return await this.pkpContract.getPubkey(tokenId);
    } catch (err) {
      throw new Error(`Error getting pkp public key: ${err}`);
    }
  }

  /**
   * Generates an auth sig to be used for executing a Lit Action.  All parameters are optional and do not need to be changed.
   * @param [chainId]
   * @param [uri]
   * @param [version]
   * @returns A valid auth sig for use with the Lit Protocol
   */
  async generateAuthSig(
    chainId = 1,
    uri = "https://localhost/login",
    version = "1"
  ) {
    return generateAuthSig(this.signer, chainId, uri, version);
  }

  static async loadJsFile(filePath: string): Promise<string> {
    return new Promise((resolve, reject) => {
      fs.readFile(filePath, "utf8", (err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      });
    });
  }

  async runLitAction({
    pkpPublicKey,
    ipfsCID,
    code,
    authSig,
    ethPrice,
    pkpEthAddress,
    pkpBtcAddress,
    btcAddress,
    ethPayoutAddress,
  }: {
    pkpPublicKey: string;
    ipfsCID?: string;
    code?: string;
    authSig?: any;
    ethPrice: number;
    pkpEthAddress: string;
    pkpBtcAddress: string;
    btcAddress: string;
    ethPayoutAddress: string;
  }) {
    try {
      await this.litClient.connect();
      const response = await this.litClient.executeJs({
        ipfsId: ipfsCID,
        code,
        authSig: authSig || (await this.generateAuthSig()),
        jsParams: {
          pkpAddress: ethers.utils.computeAddress(pkpPublicKey),
          pkpPublicKey,
          authSig: authSig || (await this.generateAuthSig()),
          ethPrice,
          pkpEthAddress,
          pkpBtcAddress,
          btcAddress,
          ethPayoutAddress,
        },
      });
      return response;
    } catch (err) {
      console.log(err);
    }
  }
}