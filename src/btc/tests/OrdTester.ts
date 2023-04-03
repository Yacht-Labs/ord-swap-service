import { BitcoinTester, execAsync } from "./BitcoinTester";

export class OrdTester extends BitcoinTester {
  private ORD_COMMAND = `ord --regtest --bitcoin-data-dir=${this.DATA_DIR} --data-dir=${this.DATA_DIR}`;

  public async index() {
    await execAsync(`${this.ORD_COMMAND} index`);
  }
}
