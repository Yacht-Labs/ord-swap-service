/* eslint-disable no-promise-executor-return */
import { exec } from "child_process";
import { promisify } from "util";
import fs from "fs";
import os from "os";
import path from "path";

const execAsync = promisify(exec);

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

let tempDataDir: string;
let tempWallet: string;
const rpcUser = "testuser";
const rpcPassword = "testpassword";
const rpcPort = 18443;

function getBaseCommand() {
  return `bitcoin-cli -regtest -datadir=${tempDataDir} -rpcuser=${rpcUser} -rpcpassword=${rpcPassword} -rpcport=${rpcPort}`;
}

async function startBitcoindRegtest() {
  // Create a temporary directory for regtest data
  tempDataDir = fs.mkdtempSync(path.join(os.tmpdir(), "regtest-"));
  const bitcoinConfPath = path.join(tempDataDir, "bitcoin.conf");
  fs.writeFileSync(
    bitcoinConfPath,
    `regtest=1
[regtest]
rpcuser=${rpcUser}
rpcpassword=${rpcPassword}
rpcbind=0.0.0.0
rpcallowip=0.0.0.0/0
server=1
`
  );

  // Read and log the contents of the bitcoin.conf file
  const bitcoinConfContent = fs.readFileSync(bitcoinConfPath, "utf-8");
  console.log("bitcoin.conf content:", bitcoinConfContent);

  // generate a random wallet name

  await execAsync("bitcoin-cli -regtest stop").catch((err) => {});
  await sleep(1000);
  await execAsync(
    `bitcoind -regtest -daemon -fallbackfee=0.0002 -txindex=1 -datadir=${tempDataDir}`
  );
  await sleep(4000);

  tempWallet = `wallet-${Math.random().toString(36).substring(7)}`;
  try {
    await execAsync(`${getBaseCommand()} loadwallet ${tempWallet}`);
  } catch (err) {
    await execAsync(`${getBaseCommand()} createwallet ${tempWallet}`);
  }
  await execAsync(`${getBaseCommand()} -wallet${tempWallet} -generate 101`);
}

async function stopBitcoindRegtest() {
  if (!tempDataDir) {
    return;
  }
  fs.rmdirSync(tempDataDir, { recursive: true });
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
        `${getBaseCommand()} -wallet=${tempWallet} getnewaddress`
      );
      const recipientAddress = addressStdout.trim();

      // Send a transaction
      const amount = 0.1;
      const { stdout: sendTxStdout } = await execAsync(
        `${getBaseCommand()} sendtoaddress ${recipientAddress} ${amount}`
      );
      const txid = sendTxStdout.trim();

      // Generate a block to confirm the transaction
      await execAsync(`${getBaseCommand()} -wallet=${tempWallet} -generate 1`);

      // Verify the transaction
      const { stdout: txStdout } = await execAsync(
        `${getBaseCommand()} -wallet=${tempWallet} gettransaction ${txid}`
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
