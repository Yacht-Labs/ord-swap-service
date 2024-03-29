import * as LitJsSdk from "@lit-protocol/lit-node-client-nodejs";
import { ethers } from "ethers";
import Hash from "ipfs-only-hash";
import * as bitcoin from "bitcoinjs-lib";
import * as ecc from "tiny-secp256k1";
import fs from "fs";
import path from "path";
import pkpNftContract from "../../abis/PKPNFT.json";
import pkpNftPermissionsContract from "../../abis/PKPPermissions.json";
import {
  PKP_CONTRACT_ADDRESS_LIT,
  PKP_PERMISSIONS_CONTRACT_ADDRESS,
} from "../../constants/index";
import {
  readPKPPrivateKey,
  readLitRpcURL,
  readBtcNetwork,
} from "../../utils/env";
import { PKPNFT, PKPPermissions } from "../../types/typechain-types/contracts";
import { generateAuthSig } from "../../utils/lit";
import { EthTransfer, LitActionResponse } from "../../types";
import { LitError } from "../../types/errors";
import { getBytesFromMultihash } from "../../utils/lit";
import { BITCOIN_NETWORKS } from "../../utils";
import { Utxo } from "../../types/models";

export class LitService {
  private litClient: any;
  public pkpContract: PKPNFT;
  public pkpPermissionsContract: PKPPermissions;
  private signer: ethers.Wallet;
  private btcTestNet: boolean;

  constructor() {
    this.btcTestNet = readBtcNetwork() === BITCOIN_NETWORKS.REGTEST;
    this.signer = new ethers.Wallet(
      readPKPPrivateKey(),
      new ethers.providers.JsonRpcProvider(readLitRpcURL())
    );
    this.litClient = new LitJsSdk.LitNodeClientNodeJs({
      alertWhenUnauthorized: false,
      litNetwork: "serrano",
      debug: true,
    });
    this.pkpContract = new ethers.Contract(
      PKP_CONTRACT_ADDRESS_LIT,
      pkpNftContract.abi,
      this.signer
    ) as PKPNFT;
    this.pkpPermissionsContract = new ethers.Contract(
      PKP_PERMISSIONS_CONTRACT_ADDRESS,
      pkpNftPermissionsContract.abi,
      this.signer
    ) as PKPPermissions;
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
        ? bitcoin.networks.regtest
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
   * Mints a PKP NFT on the network specified by Lit RPC URL
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
      throw new Error("Lit Service signer not set");
    }
    if (!this.signer.provider) {
      throw new Error("Lit Service provider not set, required to get gas info");
    }
    try {
      // const feeData = await this.signer.provider.getFeeData();
      const mintPkpTx = await this.pkpContract.mintNext(2, {
        value: ethers.BigNumber.from("1"),
        gasPrice: ethers.BigNumber.from("1000000"),
      });
      const minedMintPkpTx = await mintPkpTx.wait();
      const pkpMintedEventTopic = ethers.utils.id("PKPMinted(uint256,bytes)");
      const eventLog = minedMintPkpTx.logs.find(
        (log) => log.topics[0] === pkpMintedEventTopic
      );
      if (eventLog) {
        const pkpTokenId = ethers.BigNumber.from(eventLog.topics[1]);
        const publicKey = await this.getPubKeyByPKPTokenId(
          pkpTokenId.toString()
        );
        return {
          tokenId: pkpTokenId.toString(),
          publicKey,
          address: ethers.utils.computeAddress(publicKey),
        };
      } else {
        throw new Error("PKP minted event not found");
      }
    } catch (err) {
      throw new Error(`Error minting PKP: ${err}`);
    }
  }

  public async addPermittedAction(tokenId: string, ipfsCID: string) {
    if (!this.signer) {
      throw new Error("Lit Service signer not set");
    }
    if (!this.signer.provider) {
      throw new Error("Lit Service provider not set, required to get gas info");
    }
    const ipfsBytes = getBytesFromMultihash(ipfsCID);
    try {
      const addTx = await this.pkpPermissionsContract.addPermittedAction(
        tokenId,
        ipfsBytes,
        []
      );
      const minedAddTx = await addTx.wait();
    } catch (err) {
      throw new Error(`Error adding permitted action: ${err}`);
    }
  }

  public async isPermittedAction(
    tokenId: string,
    ipfsCID: string
  ): Promise<boolean> {
    if (!this.signer) {
      throw new Error("Lit Service signer not set");
    }
    if (!this.signer.provider) {
      throw new Error("Lit Service provider not set, required to get gas info");
    }
    try {
      const permitted = await this.pkpPermissionsContract.isPermittedAction(
        tokenId,
        getBytesFromMultihash(ipfsCID)
      );
      return permitted;
    } catch (err) {
      throw new Error(`Error checking if action is permitted: ${err}`);
    }
  }

  public async getPubKeyByPKPTokenId(tokenId: string): Promise<string> {
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
    version = "1",
    signer = this.signer
  ) {
    return generateAuthSig(signer, chainId, uri, version);
  }

  async loadActionCode(
    fileName: string,
    variables: Record<string, string>
  ): Promise<string> {
    const filePath = path.join(
      __dirname,
      "..",
      "..",
      "lit",
      "action",
      "javascript",
      `${fileName}.js`
    );

    const code = await new Promise<string>((resolve, reject) => {
      fs.readFile(filePath, "utf8", (err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      });
    });

    return this.replaceCodeVariables(code, variables)
      .replace(/ethers\.ethers/g, "ethers")
      .replace("exports.go = go;", "")
      .replace("var ethers = require('ethers');", "")
      .replace("require('bitcoinjs-lib');", "");
  }

  /* 
  example usage: 
  const variables = {
    hardEthPrice: "42069",
    hardEthPayoutAddress: "0x48F9E3AD6fe234b60c90dAa2A4f9eb5a247a74C3",
  };
  replaceVariables(code, variables);
  */
  private replaceCodeVariables(content: string, variables: any) {
    let result = content;
    for (const key in variables) {
      const placeholder = `{{${key}}}`;
      const value = variables[key];
      result = result.split(placeholder).join(value);
    }
    return result;
  }

  async runLitAction({
    pkpPublicKey,
    ipfsCID,
    code,
    authSig,
    pkpEthAddress,
    pkpBtcAddress,
    btcPayoutAddress,
    isCancel,
    isUnitTest,
    ordinalUtxo,
    cardinalUtxo,
    hashForInput0,
    hashForInput1,
    transaction,
    winningTransfer,
    losingTransfers,
    maxPriorityFeePerGas,
    maxFeePerGas,
    accountAddress,
  }: {
    pkpPublicKey: string;
    ipfsCID?: string;
    code?: string;
    authSig?: any;
    pkpEthAddress: string;
    pkpBtcAddress: string;
    btcPayoutAddress?: string;
    isCancel?: boolean;
    isUnitTest: boolean;
    ordinalUtxo?: Utxo;
    cardinalUtxo?: Utxo;
    hashForInput0?: Uint8Array | string;
    hashForInput1?: Uint8Array | string;
    transaction?: string;
    winningTransfer?: EthTransfer | null;
    losingTransfers?: EthTransfer[];
    maxPriorityFeePerGas?: string;
    maxFeePerGas?: string;
    accountAddress?: string;
  }): Promise<LitActionResponse> {
    try {
      await this.litClient.connect();
      const response = await this.litClient.executeJs({
        ipfsId: ipfsCID,
        code,
        authSig: authSig || (await this.generateAuthSig()),
        jsParams: {
          pkpAddress: ethers.utils.computeAddress(pkpPublicKey),
          publicKey: pkpPublicKey,
          authSig: authSig || (await this.generateAuthSig()),
          pkpEthAddress,
          pkpBtcAddress,
          btcPayoutAddress,
          isCancel,
          isUnitTest,
          ordinalUtxo,
          cardinalUtxo,
          hashForInput0,
          hashForInput1,
          transaction,
          winningTransfer,
          losingTransfers,
          maxFeePerGas,
          maxPriorityFeePerGas,
          accountAddress,
        },
      });
      if (response?.error) {
        throw new Error(response.error);
      }
      return response as LitActionResponse;
    } catch (err) {
      throw new LitError(`Error running Lit Action: ${(err as Error).message}`);
    }
  }
}
