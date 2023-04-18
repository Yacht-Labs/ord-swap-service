import { BaseAPI } from "../../base//BaseApi";

export abstract class BtcBroadcasterApi extends BaseAPI {
  public abstract broadcastTransaction(transactionHex: string): Promise<string>;
}
