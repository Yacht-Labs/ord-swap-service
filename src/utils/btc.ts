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
    process.env.NODE_ENV === "test"
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

function getRandomHexNumber(numChars: number) {
  let result = "";
  const characters = "abcdef0123456789";
  for (let i = 0; i < numChars; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

export function generateInscriptionId() {
  const txid = getRandomHexNumber(64); // a Bitcoin transaction ID is a 64-character hexadecimal string
  const n = Math.floor(Math.random() * 10); // a random number between 0 and 9 inclusive
  return `${txid}i${n}`;
}
