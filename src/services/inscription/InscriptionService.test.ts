import { RegtestUtxoAPI } from "../../api/bitcoin/utxo/regtest/RegtestUtxoAPI";
import { HiroInscriptionAPI } from "../../api/inscription/hiro/HiroInscriptionAPI";
import { generateInscriptionId, generateTransactionId } from "../../utils";
import { ListingService } from "../listings/ListingService";
import { InscriptionService } from "./InscriptionService";

const mockConfirmListing = jest.fn().mockResolvedValue("Ready");
jest.mock("../listings/ListingService", () => {
  return {
    ListingService: jest.fn().mockImplementation(() => {
      return {
        confirmListing: jest
          .fn()
          .mockImplementation(() => mockConfirmListing()),
      };
    }),
  };
});

describe("InscriptionService", () => {
  const listingService = new ListingService(
    new HiroInscriptionAPI(),
    new RegtestUtxoAPI()
  );
  const inscriptionService = new InscriptionService(listingService);

  it("Should error if inscription is not ready", async () => {
    mockConfirmListing.mockResolvedValueOnce({
      status: "NeedsOrdinal",
      utxos: [],
      inscription: null,
    });
    await expect(
      inscriptionService.checkInscriptionStatus("address", "inscriptionId")
    ).rejects.toThrowError(
      "The current listing status for inscriptionID: inscriptionId is: NeedsOrdinal"
    );
  });

  it("Should error if inscription is not found", async () => {
    mockConfirmListing.mockResolvedValueOnce({
      status: "Ready",
      utxos: [],
      inscription: null,
    });
    await expect(
      inscriptionService.checkInscriptionStatus("address", "inscriptionId")
    ).rejects.toThrowError(
      "Unknown error checking inscription status for inscriptionID: inscriptionId"
    );
  });

  it("Should return utxos if inscription is ready", async () => {
    const inscriptionTxId = generateInscriptionId();
    const inscriptionVout = Math.floor(Math.random() * 10);
    // const randomSatpoint = Math.floor(Math.random() * 10000000);
    const cardinalUtxo = {
      txId: generateTransactionId(),
      vout: Math.floor(Math.random() * 10),
    };
    const ordinalUtxo = {
      txId: inscriptionTxId,
      vout: inscriptionVout,
    };
    mockConfirmListing.mockResolvedValueOnce({
      status: "Ready",
      utxos: [ordinalUtxo, cardinalUtxo],
      inscription: {
        location: `${inscriptionTxId}:${inscriptionVout}:0`,
      },
    });
    const {
      ordinalUtxo: returnedOrdinalUtxo,
      cardinalUtxo: returnedCardinalUtxo,
    } = await inscriptionService.checkInscriptionStatus(
      "address",
      "inscriptionId"
    );
    expect(returnedOrdinalUtxo).toEqual(ordinalUtxo);
    expect(returnedCardinalUtxo).toEqual(cardinalUtxo);
  });
});
