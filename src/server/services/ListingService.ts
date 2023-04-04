import { Listing } from "@prisma/client";
import { InscriptionAPI } from "src/api/inscription/InscriptionAPI";
import { UtxoAPI } from "src/api/utxo/UtxoAPI";

type MinimalListing = Pick<Listing, "pkpBtcAddress" | "inscriptionId">;

export class ListingService {
  constructor(
    private inscriptionAPI: InscriptionAPI,
    private utxoAPI: UtxoAPI
  ) {}

  public async confirmListing(listing: Listing | MinimalListing) {
    {
      const utxos = await this.utxoAPI.getUtxosByAddress(
        listing.pkpBtcAddress,
        2
      );
      if (utxos.length === 0 || utxos.length === 1) {
        throw new Error(
          "Seller does not have two UTXOs in the PKP Bitcoin Address"
        );
      }

      const inscription = await this.inscriptionAPI.getInscription(
        listing.inscriptionId
      );
      if (inscription.address !== listing.pkpBtcAddress) {
        throw new Error(
          "Seller needs to send their inscription to the PKP Address"
        );
      }

      return { listingIsConfirmed: true, utxos, inscription };
    }
  }
}
