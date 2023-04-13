import { ListingService } from "./ListingService";

export class InscriptionManager {
  constructor(private listingService: ListingService) {}

  async checkInscriptionStatus(pkpBtcAddress: string, inscriptionId: string) {
    const { listingIsConfirmed, utxos, inscription } =
      await this.listingService.confirmListing({
        inscriptionId,
        pkpBtcAddress,
      });
    if (!listingIsConfirmed) {
      throw new Error(
        "We are not able to confirm that the seller's listing is ready for sale"
      );
    }

    const [inscriptionTxId, inscriptionVout, offset] =
      inscription.location.split(":");

    const [ordinalUtxo] = utxos.filter(
      (u) => u.txid === inscriptionTxId && u.vout.toString() === inscriptionVout
    );
    const [cardinalUtxo] = utxos.filter(
      (u) => u.txid !== ordinalUtxo.txid || u.vout !== ordinalUtxo.vout
    );

    return { ordinalUtxo, cardinalUtxo };
  }
}
