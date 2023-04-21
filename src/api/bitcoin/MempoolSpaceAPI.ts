import { UtxoAPI } from "./utxo/UtxoAPI";
import { BtcBroadcasterApi } from "./broadcaster/BtcBroadcasterApi";
import { readBtcNetworkEnv } from "../../utils/env";
import { Utxo } from "../../types/models";

type MempoolUtxo = {
  txid: string;
  vout: number;
  status: {
    confirmed: boolean;
    block_height: number;
    block_hash: string;
    block_time: number;
  };
  value: number;
};

export class MempoolSpaceAPI extends UtxoAPI {
  protected baseURL: string;
  constructor() {
    super();
    this.baseURL = `https://mempool.space/${
      readBtcNetworkEnv() === "TESTNET" ? "testnet/" : ""
    }api`;
  }

  public getUtxosByAddress = async (address: string, confirmations = 0) => {
    try {
      const URL = `/address/${address}/utxo`;
      const response = (await this.fetchData(URL)) as MempoolUtxo[];
      return response
        .filter((u) => u.status.confirmed)
        .map((utxo: MempoolUtxo) => ({
          ...this.normalizeUtxoResponse(utxo),
          address,
        }));
    } catch (err) {
      throw new Error(`Failed to retrieve UTXOs: ${(err as Error).message}`);
    }
  };

  public normalizeUtxoResponse(mempoolUtxo: MempoolUtxo): Utxo {
    return {
      txid: mempoolUtxo.txid,
      vout: mempoolUtxo.vout,
      address: "", // You'll need to provide the address information from a different source
      scriptPubKey: null, // You'll need to provide the scriptPubKey information from a different source
      amount: mempoolUtxo.value / 1e8, // Assuming the value is in satoshis and you want to convert it to BTC
      confirmations: 2,
    };
  }
}
