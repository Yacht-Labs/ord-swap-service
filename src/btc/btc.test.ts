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
// bcrt1p7sxhjcrcjygy7de40t3mjw0g0alyx07jpxx5hhx0g0w32m553ssqcjemt4
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

// to send money to the ord address
// make sure you have the fallback fee set on the bitcoind
// index the btc testnet blockchain
// create a bitcoin address on the bitcoin-cli
// create an ord wallet with the ord cli
// load the bitcoin wallet in the bitcoin-cli
// generate 101 transactions
// get a receiving address from ord wallet
// run this command: bitcoin-cli -regtest -rpcwallet=send_to_ord sendtoaddress bcrt1p7sxhjcrcjygy7de40t3mjw0g0alyx07jpxx5hhx0g0w32m553ssqcjemt4 1 "" "" true true
// generate a block: bitcoin-cli -regtest -rpcwallet=send_to_ord -generate 1
// check the balance of the ord wallet
// send more than one transaction so that it has a cardinal
// inscribe: ord --regtest wallet inscribe --fee-rate 30 YachtLogo.JPG

// make sure you reindex chain state: bitcoind -regtest -daemon -fallbackfee=0.0002 -txindex=1

// create a new taproot wallet: bitcoin-cli -regtest createwallet "my_taproot_wallet2" false
// bitcoin-cli -regtest -rpcwallet=my_taproot_wallet2 -named getnewaddress label=generic-p2tr address_type=bech32m

// generate a new block
// at this point we need to use the ordinal utils to try and send an inscription
