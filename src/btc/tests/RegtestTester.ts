/* eslint-disable no-useless-constructor */
/* eslint-disable no-console */
/* eslint-disable lines-between-class-members */
/* eslint-disable no-promise-executor-return */
/* eslint-disable no-param-reassign */
import BigNumber from "bignumber.js";

import fs from "fs";
import { BitcoinTester, execAsync } from "./BitcoinTester";

export class RegtestTester extends BitcoinTester {
  constructor() {
    super();
  }
  static amountToSatoshis(val: number | string) {
    const num = new BigNumber(val);
    return Number(num.multipliedBy(100000000).toFixed(8));
  }

  static reverseBuffer(buffer: Buffer): Buffer {
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

  static sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  public startServer = async () => {
    this.deleteData();
    await execAsync(
      `bitcoind -regtest -daemon -txindex -fallbackfee=0.00002 -datadir=${__dirname}`
    );
  };

  public async createWallet(name: string, legacy = false) {
    await execAsync(
      `bitcoin-cli -regtest -datadir=${this.DATA_DIR} createwallet ${name} ${
        legacy ? 'false false "" false false' : null
      }`
    );
  }

  public async loadWallet(name: string) {
    await execAsync(
      `bitcoin-cli -regtest -datadir=${this.DATA_DIR} loadwallet ${name}`
    );
    this.loadedWallet = name;
  }

  public async createAddress(legacy = false) {
    const { stdout } = await execAsync(
      `bitcoin-cli -regtest -datadir=${this.DATA_DIR} getnewaddress ${
        legacy ? '"" "legacy"' : null
      }}`
    );
    return stdout.trim();
  }
}
