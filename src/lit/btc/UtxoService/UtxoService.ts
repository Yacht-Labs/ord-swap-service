export type UnspentOutput = {
  tx_hash: string;
  tx_index: number;
  tx_output_n: number;
  script: string;
  value: number;
  value_hex: string;
  confirmations: number;
};

export type UTXOResponse = {
  unspent_outputs: Array<UnspentOutput>;
};

export class UtxoService {
  private baseUrl = "https://blockchain.info";

  public getUtxos = async (address: string, confirmations = 2) => {
    try {
      const response = await fetch(
        `${this.baseUrl}/unspent?active=${address}&confirmations=${confirmations}&cors=true`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch");
      }
      const data = (await response.json()) as UTXOResponse;

      if (!data || !data.unspent_outputs || data.unspent_outputs.length === 0) {
        throw new Error("The response is empty");
      }

      if (data.unspent_outputs.length < 2) {
        throw new Error("There is only one UTXO in the address");
      }

      if (
        data.unspent_outputs.some(
          (output: any) => output.confirmations < confirmations
        )
      ) {
        throw new Error(
          "Please wait for two confirmations on each transaction"
        );
      }

      return data.unspent_outputs.map((output: any) => {
        return {
          txHash: output.tx_hash,
          vout: output.tx_output_n,
          script: output.script,
          value: output.value,
        };
      });
    } catch (e) {
      throw new Error(`Failed to retrieve UTXOs: ${(e as Error).message}`);
    }
  };
}
