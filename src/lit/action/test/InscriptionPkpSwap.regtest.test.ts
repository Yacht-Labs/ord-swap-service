global.fetch = require("jest-fetch-mock");
import { go } from "../InscriptionPkpSwap";
import {
  mockLitActionSignEcdsa,
  mockLitActionSetResponse,
} from "../../../../development";
import { FetchMock } from "jest-fetch-mock";
import { setLitActionAuthAddress } from "../../../../development";
const fetchMock = fetch as FetchMock;

jest.mock("../../../services/bitcoin/BtcTransactionService", () => {
  return {
    BtcTransactionService: jest.fn().mockImplementation(() => {
      return {
        prepareInscriptionTransaction: jest.fn().mockReturnValue({
          hashForInput0: "mockHashForInput0",
          hashForInput1: "mockHashForInput1",
          transaction: "mockTransaction",
        }),
      };
    }),
  };
});

describe("InscriptionPKPSwap", () => {
  it("should respond with error if ordinal utxo is null", async () => {
    const mockApiResponse = {
      results: {
        ordinalUtxo: null,
        cardinalUtxo: "test2",
        winningTransfer: {
          blockNum: "0",
          from: "0xec9C0179538D8416890d53fD50c87fb2CE9eB45e",
          value: "0",
        },
        losingTransfers: [
          {
            blockNum: "0",
            from: "0xec9C0179538D8416890d53fD50c87fb2CE9eB45e",
            value: "0",
          },
        ],
        maxPriorityFeePerGas: "100",
        maxFeePerGas: "100",
      },
    };

    fetchMock.mockResponseOnce(JSON.stringify(mockApiResponse));

    const result = await go();
    expect(mockLitActionSetResponse.mock.calls[0][0].response).toBe(
      '{"error":"The ordinal has not been sent to the PKP address"}'
    );
  });

  it("should respond with error if cardinal utxo is null", async () => {
    const mockApiResponse = {
      results: {
        ordinalUtxo: "test",
        cardinalUtxo: null,
        winningTransfer: {
          blockNum: "0",
          from: "0xec9C0179538D8416890d53fD50c87fb2CE9eB45e",
          value: "0",
        },
        losingTransfers: [
          {
            blockNum: "0",
            from: "0xec9C0179538D8416890d53fD50c87fb2CE9eB45e",
            value: "0",
          },
        ],
        maxPriorityFeePerGas: "100",
        maxFeePerGas: "100",
      },
    };

    fetchMock.mockResponseOnce(JSON.stringify(mockApiResponse));

    const result = await go();
    expect(mockLitActionSetResponse.mock.calls[1][0].response).toBe(
      '{"error":"The cardinal has not been sent to the PKP address"}'
    );
  });

  it("should return ethWinnerSignature if there is a winning transfer", async () => {
    const mockApiResponse = {
      results: {
        ordinalUtxo: "test1",
        cardinalUtxo: "test2",
        winningTransfer: {
          blockNum: "0",
          from: "0xec9C0179538D8416890d53fD50c87fb2CE9eB45e",
          value: "0",
        },
        losingTransfers: [
          {
            blockNum: "0",
            from: "0xec9C0179538D8416890d53fD50c87fb2CE9eB45e",
            value: "0",
          },
        ],
        maxPriorityFeePerGas: "100",
        maxFeePerGas: "100",
      },
    };
    fetchMock.mockResponseOnce(JSON.stringify(mockApiResponse));
    const result = await go();
    expect(mockLitActionSignEcdsa.mock.calls[0][0].sigName).toEqual(
      "ethWinnerSignature"
    );
  });

  it("should send correct bitcoin txs if user cancels listing", async () => {
    setLitActionAuthAddress("0x6fa1deB6AE1792Cf2f3A78283Cb2B8da2C620808");
    const mockApiResponse = {
      results: {
        ordinalUtxo: "test1",
        cardinalUtxo: "test2",
        winningTransfer: null,
        losingTransfers: null,
        maxPriorityFeePerGas: "100",
        maxFeePerGas: "100",
      },
    };
    fetchMock.mockResponseOnce(JSON.stringify(mockApiResponse));
    const result = await go();
    console.log(mockLitActionSignEcdsa.mock.calls);
    expect(mockLitActionSignEcdsa.mock.calls[1][0].sigName).toEqual(
      "cancelHashForInput0"
    );
    expect(mockLitActionSignEcdsa.mock.calls[2][0].sigName).toEqual(
      "cancelHashForInput1"
    );
  });

  it("should send losing eth signatures if auth user is a loser", async () => {
    setLitActionAuthAddress("0xc41df6bA129067291F61c7f3dBcad9227E3fba57");
    const mockApiResponse = {
      results: {
        ordinalUtxo: "test1",
        cardinalUtxo: "test2",
        winningTransfer: null,
        losingTransfers: [
          {
            blockNum: "0",
            from: "0xc41df6bA129067291F61c7f3dBcad9227E3fba57",
            value: "0",
          },
        ],
        maxPriorityFeePerGas: "100",
        maxFeePerGas: "100",
      },
    };
    fetchMock.mockResponseOnce(JSON.stringify(mockApiResponse));
    const result = await go();
    expect(mockLitActionSignEcdsa.mock.calls[3][0].sigName).toEqual(
      "ethLoserSignature"
    );
  });
  it("should send the correct btc transactions if auth user is the winner", async () => {
    setLitActionAuthAddress("0xE1b89ef648A6068fb4e7bCd943E3a9f4Dc5c530b");
    const mockApiResponse = {
      results: {
        ordinalUtxo: "test1",
        cardinalUtxo: "test2",
        winningTransfer: {
          blockNum: "0",
          from: "0xE1b89ef648A6068fb4e7bCd943E3a9f4Dc5c530b",
          value: "0",
        },
        losingTransfers: [
          {
            blockNum: "0",
            from: "0xec9C0179538D8416890d53fD50c87fb2CE9eB45e",
            value: "0",
          },
        ],
        maxPriorityFeePerGas: "100",
        maxFeePerGas: "100",
      },
    };
    fetchMock.mockResponseOnce(JSON.stringify(mockApiResponse));
    const result = await go();
    console.log(mockLitActionSignEcdsa.mock.calls);
    expect(mockLitActionSignEcdsa.mock.calls[5][0].sigName).toEqual(
      "hashForInput0"
    );
    expect(mockLitActionSignEcdsa.mock.calls[6][0].sigName).toEqual(
      "hashForInput1"
    );
  });
});
