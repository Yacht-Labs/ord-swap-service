import { UtxoAPI } from "./UtxoAPI";
import { BtcBroadcasterApi } from "../broadcaster/BtcBroadcasterApi";
import { readBtcNetwork } from "../../../utils/env";
import { Utxo } from "../../../types/models";
import mempoolJS from "@mempool/mempool.js";
import { AddressInstance } from "@mempool/mempool.js/lib/interfaces/bitcoin/addresses";

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
  public api: AddressInstance;
  public baseURL = "";
  constructor() {
    super();
    const {
      bitcoin: { addresses },
    } = mempoolJS({ hostname: "mempool.space", network: readBtcNetwork() });
    this.api = addresses;
  }

  public getUtxosByAddress = async (address: string, confirmations = 0) => {
    try {
      const addressTxsUtxo = await this.api.getAddressTxsUtxo({ address });
      // if (!addressTxsUtxo) {
      //   addressTxsUtxo = await this.api.getAddressTxsMempool({ address });
      // }
      const utxos = addressTxsUtxo
        .filter((utxo) => utxo.status.confirmed)
        .map((utxo) => this.normalizeUtxoResponse(utxo));
      return utxos;
    } catch (err) {
      throw new Error(`Failed to retrieve UTXOs: ${(err as Error).message}`);
    }
  };

  public normalizeUtxoResponse(mempoolUtxo: MempoolUtxo): Utxo {
    return {
      txId: mempoolUtxo.txid,
      vout: mempoolUtxo.vout,
      address: "", // You'll need to provide the address information from a different source
      scriptPubKey: null, // You'll need to provide the scriptPubKey information from a different source
      amount: mempoolUtxo.value, // Assuming the value is in satoshis and you want to convert it to BTC
      confirmations: 2,
    };
  }
}
