import { networks, Network } from "bitcoinjs-lib";
import { BigNumber } from "ethers";
import { readBtcNetworkEnv } from "./env";

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
