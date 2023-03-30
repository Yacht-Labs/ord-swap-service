/* eslint-disable no-promise-executor-return */
import { exec } from "child_process";
import { promisify } from "util";
import fs from "fs";
import path from "path";

const execAsync = promisify(exec);

const DATA_DIR_NAME = `data-${Math.random().toString().slice(3)}`;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const createTempDataDir = (dirName: string) => {
  const confDir = path.resolve("./src/btc");
  const tempDataDir = path.join(confDir, dirName);
  if (!fs.existsSync(tempDataDir)) {
    fs.mkdirSync(tempDataDir);
  }
  return tempDataDir;
};

const removeTempDataDir = (dirName: string) => {
  const confDir = path.resolve("./src/btc");
  const tempDataDir = path.join(confDir, dirName);
  if (fs.existsSync(tempDataDir)) {
    fs.rmdirSync(tempDataDir, { recursive: true });
  }
};

let tempDataDir: string;
function getBaseCommand() {
  return `bitcoin-cli -regtest -rpccookiefile=${`${tempDataDir}/regtest/.cookie`}`;
}

async function startBitcoindRegtest() {
  removeTempDataDir(DATA_DIR_NAME);
  tempDataDir = createTempDataDir(DATA_DIR_NAME);

  await execAsync("bitcoin-cli -regtest stop").catch((err) => {});
  await execAsync("killall bitcoind").catch((err) => {});
  await sleep(1000);

  await execAsync(
    `bitcoind -regtest -daemon -fallbackfee=0.0002 -txindex=1 -datadir=${tempDataDir}`
  );

  await sleep(4000);
  try {
    await execAsync(`${getBaseCommand()} loadwallet test_wallet`);
  } catch (err) {
    await execAsync(`${getBaseCommand()} createwallet test_wallet`);
  }
  await execAsync(`${getBaseCommand()} -generate 101`);
}

async function stopBitcoindRegtest() {
  await execAsync(`${getBaseCommand()} stop`).catch((err) => {});
  await execAsync("killall bitcoind").catch((err) => {});
  await sleep(1000);
  removeTempDataDir(DATA_DIR_NAME);
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
        `${getBaseCommand()} getnewaddress`
      );
      const recipientAddress = addressStdout.trim();
      // Send a transaction
      const amount = 0.1;
      const { stdout: sendTxStdout } = await execAsync(
        `${getBaseCommand()} sendtoaddress ${recipientAddress} ${amount}`
      );
      const txid = sendTxStdout.trim();
      // Generate a block to confirm the transaction
      await execAsync(`${getBaseCommand()} -generate 1`);
      // Verify the transaction
      const { stdout: txStdout } = await execAsync(
        `${getBaseCommand()} gettransaction ${txid}`
      );
      const transaction = JSON.parse(txStdout);
      expect(transaction.confirmations).toBeGreaterThan(0);
    } catch (error) {
      console.error("Error:", error);
      throw error;
    }
  });
});

describe("Ordinals", () => {
  beforeAll(async () => {
    await startBitcoindRegtest();
  }, 10000);

  afterAll(async () => {
    await stopBitcoindRegtest();
  });

  it("Can verify that an address owns an ordinal", async () => {});
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
