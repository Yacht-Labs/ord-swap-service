// params provided:
// pkpBtcAddress
// pkpEthAddress
// inscriptionId
// ethPayoutAddress (HARDCODED)
// ethPrice (HARDCODED)
// buyer btcAddress
// Run it with an authsig

import { UnsignedTransaction } from "ethers";

// first check if the ordinal UTXO is on the pkpBtcAddress
// second check if the cardinal UTXO is on the pkpBtcAddress

// third check if any ETH transactions have been sent to the pkpEthAddress

// iterate through the ETH transactions and choose the one that has above the ethPrice and lowest ethAddress
//

// if there is an ETH transaction that satisfies the above conditions
// actionExecutorEthAddress === sentFrom address of the transaction then return:
// 1: signed bitcoin ordinal transaction that will transfer the ordinal UTXO to the buyer's btcAddress
// 2: signed ETH transaction that will transfer the ethPrice - platform fee to the ethPayoutAddress

// if there is are additional ETH transactions that did not win the bid proceed with the following logic:
// then return:
// 1: signed ETH transactions returning the full transaction amount to the from address on the losing ETH transactions

// there's a buyer
// we know that so we send the eth to the seller
// If you're not buyer returns winners address
// if you are buyer returns the inscription transfer transactions to the btc address of your choice

// it has been bought and we've transferred the ETH
// how do we determine either to return winner address or send the inscription

// and we dont have an authsig so don't send inscription to buyer

const ethPrice = "{{hardEthPrice}}".slice(1, -1);
const ethPayoutAddress = "{{hardEthPayoutAddress}}";

const pkpEthAddress = "";
export const hashTransaction = (tx: UnsignedTransaction) => {
  return ethers.utils.arrayify(
    ethers.utils.keccak256(
      ethers.utils.arrayify(ethers.utils.serializeTransaction(tx))
    )
  );
};

type GasProviderApiResponse = {
  safeLow: {
    maxPriorityFee: number;
    maxFee: number;
  };
  standard: {
    maxPriorityFee: number;
    maxFee: number;
  };
  fast: {
    maxPriorityFee: number;
    maxFee: number;
  };
  estimatedBaseFee: number;
  blockTime: number;
  blockNumber: number;
};

export async function getCurrentGasPrices(chainId: number): Promise<{
  maxPriorityFeePerGas: string;
  maxFeePerGas: string;
}> {
  let url;
  switch (chainId) {
    case 137:
      url = "https://gasstation-mainnet.matic.network/v2";
      break;
    case 80001:
      url = "https://gasstation-mumbai.matic.today/v2";
      break;
    default:
      throw new Error("Unsupported chain ID");
  }
  try {
    const response = await fetch(url);
    const data = (await response.json()) as GasProviderApiResponse;
    return {
      maxPriorityFeePerGas: data.fast.maxPriorityFee.toString(),
      maxFeePerGas: data.fast.maxFee.toString(),
    };
  } catch (error) {
    console.log(`Error fetching gas prices: ${error}`);
    return {
      maxPriorityFeePerGas: "10",
      maxFeePerGas: "100",
    };
  }
}

const createUnsignedTransaction = (
  fromAddress: string,
  toAddress: string,
  value: string,
  nonce: number,
  maxPriorityFeePerGas: string,
  maxFeePerGas: string,
  chainId: number
) => {
  const transaction = {
    from: fromAddress,
    to: toAddress,
    value: ethers.utils.parseEther(value),
    nonce,
    maxPriorityFeePerGas: ethers.utils.parseUnits(maxPriorityFeePerGas, "gwei"),
    maxFeePerGas: ethers.utils.parseUnits(maxFeePerGas, "gwei"),
    gasLimit: ethers.BigNumber.from("21000"),
    type: 2,
    chainId,
  };

  return transaction;
};

async function signEthPayoutTx() {
  const gasPrices = await getCurrentGasPrices(80001);
  const unsignedTx = createUnsignedTransaction(
    pkpEthAddress,
    ethPayoutAddress,
    "0.1",
    0,
    gasPrices.maxPriorityFeePerGas,
    gasPrices.maxFeePerGas,
    80001
  );

  Lit.Actions.setResponse({
    response: JSON.stringify(unsignedTx),
  });

  await Lit.LitActions.signEcdsa({
    toSign: hashTransaction(unsignedTx),
    publicKey: pkpPublicKey,
    sigName: "ethPayoutSignature",
  });
}

async function createTaprootSeedSig() {
  await Lit.LitActions.signEcdsa({
    toSign: "TaprootSeedSigner",
    publicKey: pkpPublicKey,
    sigName: "taprootSig",
  });
}

export function findWinnersByTransaction(
  transfers: Transfer[],
  minAmount: string
): { winningTransfer: Transfer | null; losingTransfers: Transfer[] } {
  let winner: Transfer | null = null;
  const losingTransfers: Transfer[] = [];
  const listingPrice = ethers.BigNumber.from(minAmount);

  for (const transfer of transfers) {
    const blockNum = parseInt(transfer.blockNum, 16);
    const value = ethers.BigNumber.from(transfer.value);

    if (value.gte(listingPrice)) {
      if (
        !winner ||
        blockNum < parseInt(winner.blockNum, 16) ||
        (blockNum === parseInt(winner.blockNum, 16) &&
          transfer.from < winner.from)
      ) {
        if (winner) {
          losingTransfers.push(winner);
        }
        winner = transfer;
      } else {
        losingTransfers.push(transfer);
      }
    }
  }

  return {
    winningTransfer: winner ? winner : null,
    losingTransfers,
  };
}

interface ApiResponse {
  jsonrpc: string;
  id: number;
  result: {
    transfers: Transfer[];
  };
}

interface Transfer {
  blockNum: string;
  uniqueId: string;
  hash: string;
  from: string;
  to: string;
  value: string;
  erc721TokenId?: string;
  erc1155Metadata?: null;
  tokenId?: string;
  asset: string;
  category: string;
  rawContract: RawContract;
}

interface RawContract {
  value: string;
  address: null;
  decimal: string;
}

export function mapTransferToTransaction(
  transfer: Transfer,
  to: string,
  nonce: number,
  maxPriorityFeePerGas: string,
  maxFeePerGas: string,
  chainId: number
) {
  const { from, value } = transfer;
  const unsignedTransaction = createUnsignedTransaction(
    from,
    to,
    value,
    nonce,
    maxPriorityFeePerGas,
    maxFeePerGas,
    chainId
  );
  return unsignedTransaction;
}

export async function getInboundEthTransactions(pkpEthAddress: string) {
  try {
    const payload = {
      id: 1,
      jsonrpc: "2.0",
      method: "alchemy_getAssetTransfers",
      params: {
        fromBlock: "0x0",
        toBlock: "latest",
        toAddress: pkpEthAddress,
        category: ["external"],
        withMetadata: true,
      },
    };

    const response = await fetch(
      "https://polygon-mumbai.g.alchemy.com/v2/Agko3FEsqf1Kez7aSFPZViQnUd8sI3rJ",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );
    const data = (await response.json()) as ApiResponse;
    return data.result.transfers;
  } catch (err) {
    throw new Error(`Error getting eth transfers to pkpEthAddres: ${err}`);
  }
}

async function main() {
  const executorAddress = Lit.Auth.authSigAddress;
  await createTaprootSeedSig();
  await signEthPayoutTx();
}
main();
