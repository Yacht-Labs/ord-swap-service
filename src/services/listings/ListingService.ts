import { Listing, ListingStatus } from "@prisma/client";
import { InscriptionAPI } from "../../api/inscription/InscriptionAPI";
import { UtxoAPI } from "../../api/bitcoin/utxo/UtxoAPI";
import { Inscription, Utxo } from "../../types/models";
type MinimalListing = Pick<Listing, "pkpBtcAddress" | "inscriptionId">;

export class ListingService {
  constructor(
    private inscriptionAPI: InscriptionAPI,
    private utxoAPI: UtxoAPI
  ) {}

  async confirmListing(listing: Listing | MinimalListing): Promise<{
    status: ListingStatus;
    utxos?: Utxo[];
    inscription?: Inscription;
  }> {
    const utxos = await this.utxoAPI.getUtxosByAddress(
      listing.pkpBtcAddress,
      2
    );
    if (utxos.length === 0) {
      return { status: ListingStatus.NeedsBoth };
    }
    const inscription = await this.inscriptionAPI.getInscription(
      listing.inscriptionId
    );
    if (inscription.address !== listing.pkpBtcAddress) {
      return { status: ListingStatus.NeedsOrdinal };
    }
    if (utxos.length === 1) {
      return { status: ListingStatus.NeedsCardinal };
    }
    return { status: ListingStatus.Ready, utxos, inscription };
  }
}
