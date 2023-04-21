import { EthTransfer } from "../../types";
import { BaseAPI } from "../base/BaseApi";

export abstract class EthereumAPI extends BaseAPI {
  public abstract getInboundTransactions(
    address: string
  ): Promise<EthTransfer[]>;
  public abstract normalizeEthTransferResponse(transfers: any[]): EthTransfer[];
}
