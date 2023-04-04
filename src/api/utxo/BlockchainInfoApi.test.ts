// import { UtxoService, UnspentOutput, UTXOResponse } from "./UtxoService";

// global.fetch = jest.fn();

// function mockFetch(data: UTXOResponse, ok = true) {
//   (global.fetch as jest.Mock).mockResolvedValue({
//     ok,
//     json: async () => data,
//   });
// }

// describe("UtxoService", () => {
//   afterEach(() => {
//     jest.clearAllMocks();
//   });

//   it("should return the correct UTXO data when successful", async () => {
//     const sampleUtxoResponse: UTXOResponse = {
//       unspent_outputs: [
//         {
//           tx_hash: "sample_tx_hash1",
//           tx_index: 1,
//           tx_output_n: 0,
//           script: "sample_script1",
//           value: 1000,
//           value_hex: "3e8",
//           confirmations: 3,
//         },
//         {
//           tx_hash: "sample_tx_hash2",
//           tx_index: 2,
//           tx_output_n: 1,
//           script: "sample_script2",
//           value: 2000,
//           value_hex: "7d0",
//           confirmations: 4,
//         },
//       ],
//     };

//     mockFetch(sampleUtxoResponse);

//     const utxoService = new UtxoService();
//     const result = await utxoService.getUtxos("sample_address");

//     expect(global.fetch).toHaveBeenCalledTimes(1);
//     expect(global.fetch).toHaveBeenCalledWith(
//       "https://blockchain.info/unspent?active=sample_address&confirmations=2&cors=true"
//     );

//     expect(result).toEqual([
//       {
//         txHash: "sample_tx_hash1",
//         vout: 0,
//         script: "sample_script1",
//         value: 1000,
//       },
//       {
//         txHash: "sample_tx_hash2",
//         vout: 1,
//         script: "sample_script2",
//         value: 2000,
//       },
//     ]);
//   });

//   it("should throw an error when the fetch fails", async () => {
//     mockFetch(null as unknown as UTXOResponse, false);

//     const utxoService = new UtxoService();

//     await expect(utxoService.getUtxos("sample_address")).rejects.toThrow(
//       "Failed to retrieve UTXOs: Failed to fetch"
//     );
//   });

//   it("should throw an error when the response is not valid", async () => {
//     mockFetch({} as UTXOResponse);

//     const utxoService = new UtxoService();

//     await expect(utxoService.getUtxos("sample_address")).rejects.toThrow(
//       "Failed to retrieve UTXOs: The response is empty"
//     );
//   });

//   it("should throw an error when there is only one UTXOs", async () => {
//     mockFetch({
//       unspent_outputs: [
//         {
//           tx_hash: "sample_tx_hash1",
//           tx_index: 1,
//           tx_output_n: 0,
//           script: "sample_script1",
//           value: 1000,
//           value_hex: "3e8",
//           confirmations: 3,
//         },
//       ],
//     });

//     const utxoService = new UtxoService();

//     await expect(utxoService.getUtxos("sample_address")).rejects.toThrow(
//       "Failed to retrieve UTXOs: There is only one UTXO in the address"
//     );
//   });

//   it("should throw an error when the UTXOs are not confirmed", async () => {
//     mockFetch({
//       unspent_outputs: [
//         {
//           tx_hash: "sample_tx_hash1",
//           tx_index: 1,
//           tx_output_n: 0,
//           script: "sample_script1",
//           value: 1000,
//           value_hex: "3e8",
//           confirmations: 3,
//         },
//         {
//           tx_hash: "sample_tx_hash2",
//           tx_index: 1,
//           tx_output_n: 0,
//           script: "sample_script2",
//           value: 1000,
//           value_hex: "3e8",
//           confirmations: 1,
//         },
//       ],
//     });

//     const utxoService = new UtxoService();

//     await expect(utxoService.getUtxos("sample_address")).rejects.toThrow(
//       "Failed to retrieve UTXOs: Please wait for two confirmations on each transaction"
//     );
//   });
// });
