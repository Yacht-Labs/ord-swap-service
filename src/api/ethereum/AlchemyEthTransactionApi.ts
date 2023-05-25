import { ETH_GOERLI } from "../../constants";
import { Transfer } from "../../lit/action/test/ordinalSwapAction";
import { EthTransfer } from "../../types";
import { readEthNetwork } from "../../utils/env";
import { EthereumAPI } from "./EthTransactionAPI";
import { ethers } from "ethers";

interface ApiResponse {
  jsonrpc: string;
  id: number;
  result: {
    transfers: Transfer[];
  };
}

export class AlchemyEthTransactionAPI extends EthereumAPI {
  protected baseURL: string;

  constructor() {
    super();
    this.baseURL =
      readEthNetwork() === ETH_GOERLI
        ? "https://eth-goerli.g.alchemy.com/v2/WMADuqR-b2Yr2fWGK40lyt_BVXrlpsgW"
        : "https://eth-mainnet.g.alchemy.com/v2/IsjpCEWp_VbW4G8ZYWjNrLrWFZDBuPZ1";
  }

  async getInboundTransactions(pkpEthAddress: string) {
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
    try {
      const response = (await this.postData("", payload)) as ApiResponse;
      return this.normalizeEthTransferResponse(response.result.transfers);
    } catch (err) {
      throw new Error(`Error getting eth transfers to pkpEthAddres: ${err}`);
    }
  }

  public normalizeEthTransferResponse(transfers: any[]): EthTransfer[] {
    return transfers.map(
      (t) =>
        ({
          blockNum: t.blockNum,
          from: t.from,
          value: ethers.utils.parseEther(t.value.toString()).toString(),
        } as EthTransfer)
    );
  }

  public async getCurrentGasPrices() {
    try {
      const provider = new ethers.providers.JsonRpcBatchProvider(this.baseURL);
      const { maxPriorityFeePerGas, maxFeePerGas } =
        await provider.getFeeData();
      if (!maxFeePerGas || !maxPriorityFeePerGas) {
        throw new Error("Provider error fetching gas prices");
      }
      return {
        maxPriorityFeePerGas: maxPriorityFeePerGas.toString(),
        maxFeePerGas: maxFeePerGas.toString(),
      };
    } catch (err) {
      throw new Error(
        `Error getting Ethereum gas data: ${(err as Error).message}`
      );
    }
  }
}
