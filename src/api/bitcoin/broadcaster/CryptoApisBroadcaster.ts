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

export class CryptoApisBroadcaster extends BtcBroadcasterApi {
  protected baseURL: string;
  constructor() {
    super();
    this.baseURL = "https://rest.cryptoapis.io";
  }
  public broadcastTransaction = async (transactionHex: string) => {
    try {
      const URL = `/blockchain-tools/bitcoin/mainnet/transactions/broadcast?context=${transactionHex}`;
      const response = (await this.fetchData(URL)) as ApiResponse;
      return response.data.item.transactionId;
    } catch (err) {
      throw new ApiError(
        `CryptoApisBroadcaster API failed to broadcast transaction: ${
          (err as Error).message
        }`
      );
    }
  };
}
