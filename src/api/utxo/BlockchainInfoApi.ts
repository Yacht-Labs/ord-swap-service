import { UtxoAPI } from "./UtxoAPI";
import { Utxo } from "src/models/Utxo";

type BlockchainInfoUtxoResponse = {
  notice: string;
  unspent_outputs: BlockchainInfoUtxo[];
};

type BlockchainInfoUtxo = {
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
      id: `${output.tx_hash}:${output.tx_output_n}`,
      txid: output.tx_hash,
      vout: output.tx_output_n,
      scriptPubKey: output.script,
      amount: output.value,
      confirmations: output.confirmations,
      address: "",
    };
  }
}
