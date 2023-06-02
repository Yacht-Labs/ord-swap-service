import {
  readGoerliPrivateKey,
  readGoerliPrivateKey2,
  readGoerliPrivateKey3,
  readGoerliRpcUrlEnv,
} from "./env";
import { ethers } from "ethers";

export function generateEthereumAddress(): string {
  const length = 40;
  const number: string = [...Array(length)]
    .map(() => {
      return Math.floor(Math.random() * 16).toString(16);
    })
    .join("");
  return `0x${number}`;
}

export const sellerEthWallet = new ethers.Wallet(
  readGoerliPrivateKey(),
  new ethers.providers.JsonRpcProvider(readGoerliRpcUrlEnv())
);

export const buyerEthWallet = new ethers.Wallet(
  readGoerliPrivateKey2(),
  new ethers.providers.JsonRpcProvider(readGoerliRpcUrlEnv())
);

export const loserEthWallet = new ethers.Wallet(
  readGoerliPrivateKey3(),
  new ethers.providers.JsonRpcProvider(readGoerliRpcUrlEnv())
);
