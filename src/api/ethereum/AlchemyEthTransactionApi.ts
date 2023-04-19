import { Transfer } from "../../lit/action/test/ordinalSwapAction";
import { readAlchemyKey } from "../../utils/env";
import { EthTransactionApi } from "./EthTransactionApi";

interface ApiResponse {
  jsonrpc: string;
  id: number;
  result: {
    transfers: Transfer[];
  };
}

export class AlchemyEthTransactionApi extends EthTransactionApi {
  protected baseURL: string;
  private payload = {
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

  constructor() {
    super();
    this.baseURL = `https://eth-mainnet.g.alchemy.com/v2/${readAlchemyKey}`;
  }

  public async getInboundTransactions(address: string): Promise<Transfer[]> {
    const response = await fetch(
      "https://eth-mainnet.g.alchemy.com/v2/IsjpCEWp_VbW4G8ZYWjNrLrWFZDBuPZ1",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(this.payload),
      }
    );
    const data = (await response.json()) as ApiResponse;
    return data.result.transfers.map((t) => ({
      ...t,
      value: ethers.BigNumber.from(ethers.utils.parseEther(t.value.toString())),
    }));
  }
}
