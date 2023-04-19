import { Transfer } from "../../lit/action/test/ordinalSwapAction";
import { BaseAPI } from "../base/BaseApi";

export abstract class EthTransactionApi extends BaseAPI {
  public abstract getInboundTransactions(address: string): Promise<Transfer[]>;
}
