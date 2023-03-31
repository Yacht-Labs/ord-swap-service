import { exec } from "child_process";
import { promisify } from "util";
import fs from "fs";

export const execAsync = promisify(exec);

export class BitcoinTester {
  protected DATA_DIR: string;

  loadedWallet: string | null = null;

  constructor() {
    this.DATA_DIR = `${__dirname}/data`;
  }

  public deleteData() {
    fs.rm(
      `${this.DATA_DIR}/regtest`,
      { force: true, recursive: true, maxRetries: 2 },
      (err) => {
        if (err) {
          console.error(err);
          return;
        }
        console.log(`Directory regtest has been deleted.`);
      }
    );
  }
}
