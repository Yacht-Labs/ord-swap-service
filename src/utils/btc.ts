import { networks, Network } from "bitcoinjs-lib";
import { readBtcNetworkEnv } from "./env";
import * as bitcoin from "bitcoinjs-lib";
import ecc from "@bitcoinerlab/secp256k1";
import { ECPairFactory } from "ecpair";

/* eslint-disable no-param-reassign */
export function reverseBuffer(buffer: Buffer): Buffer {
  if (buffer.length < 1) return buffer;
  let j = buffer.length - 1;
  let tmp = 0;
  for (let i = 0; i < buffer.length / 2; i++) {
    tmp = buffer[i];
    buffer[i] = buffer[j];
    buffer[j] = tmp;
    j--;
  }
  return buffer;
}

export function toYachtOutputScript(address: string) {
  return bitcoin.address.toOutputScript(
    address,
    process.env.NODE_ENV === "test" || process.env.NODE_ENV === "dev"
      ? bitcoin.networks.regtest
      : bitcoin.networks.bitcoin
  );
}

export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function getBtcNetwork(): Network {
  const network = readBtcNetworkEnv();
  switch (network) {
    case "testnet":
      return networks.testnet;
    case "regtest":
      return networks.regtest;
    default:
      return networks.bitcoin;
  }
}

export const toXOnly = (pubKey: Buffer) =>
  pubKey.length === 32 ? pubKey : pubKey.slice(1, 33);

export function padHexString(hexString: string) {
  return hexString.length % 2 === 0 ? hexString : "0" + hexString;
}

export function unpadHexString(buffer: Buffer): { r: string; s: string } {
  // Convert buffer to hex string
  const hexString = buffer.toString("hex");

  // Length of hexString should be even (due to padding) and be split equally into r and s
  if (hexString.length % 2 !== 0 || hexString.length % 4 !== 0) {
    throw new Error("Invalid hex string length");
  }

  const elementLength = hexString.length / 2;

  const r = hexString.substring(0, elementLength);
  const s = hexString.substring(elementLength);

  return { r, s };
}

function getRandomHexNumber(numChars: number) {
  let result = "";
  const characters = "abcdef0123456789";
  for (let i = 0; i < numChars; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

export function generateTransactionId() {
  return getRandomHexNumber(64); // a Bitcoin transaction ID is a 64-character hexadecimal string
}

export function generateInscriptionId() {
  const txId = generateTransactionId(); // a Bitcoin transaction ID is a 64-character hexadecimal string
  const n = Math.floor(Math.random() * 10); // a random number between 0 and 9 inclusive
  return `${txId}i${n}`;
}

export enum BITCOIN_NETWORKS {
  MAINNET = "mainnet",
  TESTNET = "testnet",
  REGTEST = "regtest",
}

export function getBitcoinLibJsNetwork() {
  const network = readBtcNetworkEnv();
  switch (network) {
    case BITCOIN_NETWORKS.TESTNET:
      return bitcoin.networks.testnet;
    case BITCOIN_NETWORKS.REGTEST:
      return bitcoin.networks.regtest;
    case BITCOIN_NETWORKS.MAINNET:
      return bitcoin.networks.bitcoin;
    default:
      throw new Error(`Invalid Bitcoin network: ${network}`);
  }
}
