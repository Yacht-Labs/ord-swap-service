import { YachtLitSdk } from "lit-swap-sdk";
import { ethers } from "ethers";
import { readMumbaiPrivateKeyEnv, readMumbaiRpcUrlEnv } from "../../util/env";

export class LitService {
  litService: YachtLitSdk;

  constructor() {
    const privateKey = readMumbaiPrivateKeyEnv();
    const wallet = new ethers.Wallet(
      privateKey,
      new ethers.providers.JsonRpcProvider(readMumbaiRpcUrlEnv())
    );
    this.litService = new YachtLitSdk({ signer: wallet });
  }

  async generatePkp() {
    const { publicKey, address } = await this.litService.mintPkp();
    return { publicKey, address };
  }
}
