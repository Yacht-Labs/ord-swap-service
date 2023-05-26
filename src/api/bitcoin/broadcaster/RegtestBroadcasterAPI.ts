import { RegtestUtils } from "regtest-client";
import { ApiError } from "../../../types/errors";
import { BtcBroadcasterApi } from "./BtcBroadcasterApi";

type ApiResponse = {
  apiVersion: string;
  requestId: string;
  context: string;
  data: {
    item: {
      transactionId: string;
    };
  };
};

export class RegtestBroadcasterAPI extends BtcBroadcasterApi {
  protected baseURL: string;
  constructor() {
    super();
    this.baseURL = "https://rest.cryptoapis.io";
  }
  public broadcastTransaction = async (transactionHex: string) => {
    const regtestUtils = new RegtestUtils();
    try {
      const response = await regtestUtils.broadcast(transactionHex);
      return "success";
    } catch (err) {
      throw new ApiError(
        `RegtestBroadcaster API failed to broadcast transaction: ${
          (err as Error).message
        }`
      );
    }
  };
}
