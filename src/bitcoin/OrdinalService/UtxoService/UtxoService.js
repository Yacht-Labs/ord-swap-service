"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UtxoService = void 0;
class UtxoService {
  baseUrl = "https://blockchain.info";
  getUtxos = async (address, confirmations = 2) => {
    try {
      const response = await fetch(
        `${this.baseUrl}/unspent?active=${address}&confirmations=${confirmations}&cors=true`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch");
      }
      const data = await response.json();
      if (!data || !data.unspent_outputs || data.unspent_outputs.length === 0) {
        throw new Error("The response is empty");
      }
      if (data.unspent_outputs.length < 2) {
        throw new Error("There is only one UTXO in the address");
      }
      if (
        data.unspent_outputs.some(
          (output) => output.confirmations < confirmations
        )
      ) {
        throw new Error(
          "Please wait for two confirmations on each transaction"
        );
      }
      return data.unspent_outputs.map((output) => {
        return {
          txHash: output.tx_hash,
          vout: output.tx_output_n,
          script: output.script,
          value: output.value,
        };
      });
    } catch (e) {
      throw new Error(`Failed to retrieve UTXOs: ${e.message}`);
    }
  };
}
exports.UtxoService = UtxoService;
//# sourceMappingURL=UtxoService.js.map
