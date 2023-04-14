// params provided:
// pkpBtcAddress
// pkpEthAddress
// inscriptionId
// ethPayoutAddress (HARDCODED)
// ethPrice (HARDCODED)
// buyer btcAddress
// Run it with an authsig

import { UnsignedTransaction, ethers } from "ethers";

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

export async function getCurrentGasPricesMainnet() {
  try {
    const provider = new ethers.providers.JsonRpcBatchProvider(
      "https://eth-mainnet.g.alchemy.com/v2/IsjpCEWp_VbW4G8ZYWjNrLrWFZDBuPZ1"
    );
    const { maxPriorityFeePerGas, maxFeePerGas } = await provider.getFeeData();
    if (!maxFeePerGas || !maxPriorityFeePerGas) {
      throw new Error("Provider error fetching gas prices");
    }
    return {
      maxPriorityFeePerGas: maxPriorityFeePerGas.toString(),
      maxFeePerGas: maxFeePerGas.toString(),
    };
  } catch (err) {
    throw new Error(
      `Error getting mainnet gas data: ${(err as Error).message}`
    );
  }
}

export async function getCurrentGasPricesForPolygon(chainId: number): Promise<{
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
      maxPriorityFeePerGas: data.fast.maxPriorityFee.toString().slice(0, 6),
      maxFeePerGas: data.fast.maxFee.toString().slice(0, 6),
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
  value: ethers.BigNumber,
  nonce: number,
  maxPriorityFeePerGas: string,
  maxFeePerGas: string,
  chainId: number
) => {
  const transaction = {
    from: fromAddress,
    to: toAddress,
    value: value,
    nonce,
    maxPriorityFeePerGas: ethers.utils.parseUnits(maxPriorityFeePerGas, "gwei"),
    maxFeePerGas: ethers.utils.parseUnits(maxFeePerGas, "gwei"),
    gasLimit: ethers.BigNumber.from("21000"),
    type: 2,
    chainId,
  };

  return transaction;
};

export function findWinnersByTransaction(
  transfers: Transfer[],
  minAmount: string
): { winningTransfer: Transfer | null; losingTransfers: Transfer[] } {
  let winner: Transfer | null = null;
  const losingTransfers: Transfer[] = [];
  const listingPrice = ethers.BigNumber.from(
    ethers.utils.parseEther(minAmount)
  );

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
    transfers: TransferResponse[];
  };
}

interface TransferResponse {
  blockNum: string;
  uniqueId: string;
  hash: string;
  from: string;
  to: string;
  value: number;
  erc721TokenId?: string;
  erc1155Metadata?: null;
  tokenId?: string;
  asset: string;
  category: string;
  rawContract: RawContract;
}
export interface Transfer {
  blockNum: string;
  uniqueId: string;
  hash: string;
  from: string;
  to: string;
  value: ethers.BigNumber;
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
      "https://eth-mainnet.g.alchemy.com/v2/IsjpCEWp_VbW4G8ZYWjNrLrWFZDBuPZ1",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );
    const data = (await response.json()) as ApiResponse;
    return data.result.transfers.map((t) => ({
      ...t,
      value: ethers.BigNumber.from(ethers.utils.parseEther(t.value.toString())),
    }));
  } catch (err) {
    throw new Error(`Error getting eth transfers to pkpEthAddres: ${err}`);
  }
}
