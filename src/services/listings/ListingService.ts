import { Listing } from "@prisma/client";
import { InscriptionAPI } from "../../api/inscription/InscriptionAPI";
import { UtxoAPI } from "../../api/bitcoin/UtxoAPI";
import prisma from "../../db/prisma";
type MinimalListing = Pick<Listing, "pkpBtcAddress" | "inscriptionId">;

export class ListingService {
  constructor(
    private inscriptionAPI: InscriptionAPI,
    private utxoAPI: UtxoAPI
  ) {}

  static async getBoughtListings(accountId: string): Promise<Listing[] | null> {
    try {
      const listings = await prisma.listing.findMany({
        where: { buyerAccountId: accountId },
      });
      return listings;
    } catch (err) {
      throw err;
    }
  }

  async confirmListing(listing: Listing | MinimalListing) {
    try {
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
    } catch (err) {
      throw new Error(`Error confirming listing: ${(err as Error).message}`);
    }
  }
}
