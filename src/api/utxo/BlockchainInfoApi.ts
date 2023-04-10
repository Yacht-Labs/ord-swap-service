import { UtxoAPI } from "./UtxoAPI";
import { Utxo } from "../../types/models";

type BlockchainInfoUtxoResponse = {
  notice: string;
  unspent_outputs: BlockchainInfoUtxo[];
};

type BlockchainInfoUtxo = {
  tx_hash_big_endian: string;
  tx_hash: string;
  tx_index: number;
  tx_output_n: number;
  script: string;
  value: number;
  value_hex: string;
  confirmations: number;
};

export class BlockchainInfoUtxoApi extends UtxoAPI {
  protected baseURL: string;
  constructor() {
    super();
    this.baseURL = "https://blockchain.info";
  }
  public getUtxosByAddress = async (address: string, confirmations = 0) => {
    try {
      const URL = `/unspent?active=${address}&confirmations=${confirmations}&cors=true`;
      const response = (await this.fetchData(
        URL
      )) as BlockchainInfoUtxoResponse;
      return response.unspent_outputs.map((utxo) => ({
        ...this.normalizeUtxoResponse(utxo),
        address,
      }));
    } catch (err) {
      throw new Error(`Failed to retrieve UTXOs: ${(err as Error).message}`);
    }
  };

  public normalizeUtxoResponse(output: BlockchainInfoUtxo): Utxo {
    return {
      txid: output.tx_hash_big_endian,
      vout: output.tx_output_n,
      scriptPubKey: output.script,
      amount: output.value,
      confirmations: output.confirmations,
      address: "",
    };
  }
}
