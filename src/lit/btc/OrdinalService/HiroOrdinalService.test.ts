// Import the necessary dependencies and the class you want to test
import { HiroOrdinalService, InscriptionResponse } from "./HiroOrdinalService";
import { UtxoService } from "../UtxoService/UtxoService";

// Mock the global fetch
global.fetch = jest.fn();

// Mock the UtxoService
jest.mock("../UtxoService/UtxoService", () => {
  return {
    UtxoService: jest.fn().mockImplementation(() => {
      return { getUtxos: jest.fn() };
    }),
  };
});

describe("HiroOrdinalService", () => {
  let validIdOrNumber: string;
  const validInscriptionResponse: InscriptionResponse = {
    id: "validId",
    number: 1,
    address: "validAddress",
    genesis_address: "validGenesisAddress",
    genesis_block_height: 100,
    genesis_block_hash: "validGenesisBlockHash",
    genesis_tx_id: "validGenesisTxId",
    genesis_fee: "10",
    genesis_timestamp: 1000,
    location:
      "ee7f1cc58090de74caa601aeafa758558602d33af3228d1b7242a5d6b5e303bc:0:0",
    output: "validOutput",
    value: "10",
    offset: "1",
    sat_ordinal: "1",
    sat_rarity: "1",
    sat_coinbase_height: 100,
    mime_type: "validMimeType",
    content_type: "validContentType",
    content_length: 100,
    timestamp: 1000,
  };

  beforeEach(() => {
    validIdOrNumber = (Math.floor(Math.random() * 100000) + 1).toString();
  });
  afterEach(() => {
    // Clear all instances and calls to constructor and all methods:
    (global.fetch as jest.Mock).mockClear();
  });

  test("It should error on invalid inscription id or number", async () => {
    const hiroOrdinalService = new HiroOrdinalService("invalidInput");

    await expect(hiroOrdinalService.getInscriptionDetails()).rejects.toThrow(
      "Invalid Inscription idOrNumber"
    );
  });

  test("It should error if fetch fails", async () => {
    (global.fetch as jest.Mock).mockRejectedValue(new Error("Fetch failed"));

    const hiroOrdinalService = new HiroOrdinalService(validIdOrNumber);

    await expect(hiroOrdinalService.getInscriptionDetails()).rejects.toThrow(
      "Failed to retrieve inscription details: Fetch failed"
    );
  });

  test("It should error if there wasn't a proper inscription response", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      json: async () => ({
        status: "success",
        id: "validId",
      }),
    });

    const hiroOrdinalService = new HiroOrdinalService(validIdOrNumber);

    await expect(hiroOrdinalService.getInscriptionDetails()).rejects.toThrow(
      "Invalid Inscription Response"
    );
  });

  test("It should return an inscription if everything works", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      json: async () => ({
        status: "success",
        ...validInscriptionResponse,
      }),
    });
    const hiroOrdinalService = new HiroOrdinalService(validIdOrNumber);

    const result = await hiroOrdinalService.getInscriptionDetails();

    expect(result).toEqual({ ...validInscriptionResponse, status: "success" });
  });
  describe("HiroOrdinalService - getInputs", () => {
    beforeEach(() => {
      validIdOrNumber = (Math.floor(Math.random() * 100000) + 1).toString();
    });

    beforeEach(() => {
      (global.fetch as jest.Mock).mockResolvedValue({
        json: async () => ({
          status: "success",
          ...validInscriptionResponse,
        }),
      });
    });

    test("It fails if the address doesn't own the inscription", async () => {
      const hiroOrdinalService = new HiroOrdinalService(validIdOrNumber);
      hiroOrdinalService.getInscriptionDetails = jest.fn().mockResolvedValue({
        ...validInscriptionResponse,
        address: "differentAddress",
      });
      await expect(
        hiroOrdinalService.getInputs("invalidAddress")
      ).rejects.toThrow("The address does not own the inscription");
    });

    test("It fails if there's not two UTXOs in the address", async () => {
      const hiroOrdinalService = new HiroOrdinalService(validIdOrNumber);
      hiroOrdinalService.getInscriptionDetails = jest.fn().mockResolvedValue({
        ...validInscriptionResponse,
        address: "validAddress",
      });
      const utxoService = new UtxoService();
      utxoService.getUtxos = jest.fn().mockResolvedValue([
        {
          txid: "validTxId",
          vout: 0,
          value: 100,
          address: "validAddress",
        },
      ]);
      hiroOrdinalService.utxoService = utxoService;

      await expect(
        hiroOrdinalService.getInputs("validAddress")
      ).rejects.toThrow("There are not two UTXOs in the address");
    });

    test("It works in the case that everything is valid", async () => {
      const hiroOrdinalService = new HiroOrdinalService(validIdOrNumber);
      hiroOrdinalService.getInscriptionDetails = jest.fn().mockResolvedValue({
        ...validInscriptionResponse,
        address: "validAddress",
      });
      const utxoService = new UtxoService();
      const utxos = [
        {
          txHash: validInscriptionResponse.location.split(":")[0],
          vout: validInscriptionResponse.location.split(":")[1],
          value: 100,
        },
        {
          tx_hash: "validTxId2",
          vout: 1,
          value: 100,
        },
      ];
      utxoService.getUtxos = jest.fn().mockResolvedValue(utxos);
      hiroOrdinalService.utxoService = utxoService;

      const result = await hiroOrdinalService.getInputs("validAddress");

      expect(result).toEqual({
        ordinalUtxo: utxos[0],
        cardinalUtxo: utxos[1],
      });
    });
  });
});
