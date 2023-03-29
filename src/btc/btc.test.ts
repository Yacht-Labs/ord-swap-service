/* eslint-disable no-promise-executor-return */
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function startBitcoindRegtest() {
  await execAsync("bitcoin-cli -regtest stop").catch((err) => {});
  await sleep(1000);
  await execAsync("bitcoind -regtest -daemon -fallbackfee=0.0002");
  await sleep(4000);
  try {
    await execAsync("bitcoin-cli -regtest loadwallet test_wallet");
  } catch (err) {
    await execAsync("bitcoin-cli -regtest createwallet test_wallet");
  }
  await execAsync("bitcoin-cli -chain=regtest -generate 101");
}

async function stopBitcoindRegtest() {
  await execAsync("bitcoin-cli -regtest stop").catch((err) => {});
}

describe("Bitcoin regtest server", () => {
  beforeAll(async () => {
    await startBitcoindRegtest();
  }, 10000);

  afterAll(async () => {
    await stopBitcoindRegtest();
  });

  test("Send a transaction and verify it to prove BTC regtest server works", async () => {
    try {
      // Get a new address
      const { stdout: addressStdout } = await execAsync(
        "bitcoin-cli -regtest getnewaddress"
      );
      const recipientAddress = addressStdout.trim();

      // Send a transaction
      const amount = 0.1;
      const { stdout: sendTxStdout } = await execAsync(
        `bitcoin-cli -regtest sendtoaddress ${recipientAddress} ${amount}`
      );
      const txid = sendTxStdout.trim();

      // Generate a block to confirm the transaction
      await execAsync("bitcoin-cli -regtest -generate 1");

      // Verify the transaction
      const { stdout: txStdout } = await execAsync(
        `bitcoin-cli -regtest gettransaction ${txid}`
      );
      const transaction = JSON.parse(txStdout);

      expect(transaction.confirmations).toBeGreaterThan(0);
    } catch (error) {
      console.error("Error:", error);
      throw error;
    }
  });
});
