import { Listing, ListingStatus } from "@prisma/client";
import { InscriptionAPI } from "../../api/inscription/InscriptionAPI";
import { UtxoAPI } from "../../api/bitcoin/utxo/UtxoAPI";
type MinimalListing = Pick<Listing, "pkpBtcAddress" | "inscriptionId">;

export class ListingService {
  constructor(
    private inscriptionAPI: InscriptionAPI,
    private utxoAPI: UtxoAPI
  ) {}

  async confirmListing(
    listing: Listing | MinimalListing
  ): Promise<ListingStatus> {
    const utxos = await this.utxoAPI.getUtxosByAddress(
      listing.pkpBtcAddress,
      2
    );
    if (utxos.length === 0) {
      return ListingStatus.NeedsBoth;
    }
    const inscription = await this.inscriptionAPI.getInscription(
      listing.inscriptionId
    );
    if (inscription.address !== listing.pkpBtcAddress) {
      return ListingStatus.NeedsOrdinal;
    }
    if (utxos.length === 1) {
      return ListingStatus.NeedsCardinal;
    }
    return ListingStatus.Ready;
  }
}
