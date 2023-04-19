import { ListingService } from "./listings/ListingService";

export class InscriptionManager {
  constructor(private listingService: ListingService) {}

  async checkInscriptionStatus(pkpBtcAddress: string, inscriptionId: string) {
    const { status, utxos, inscription } =
      await this.listingService.confirmListing({
        inscriptionId,
        pkpBtcAddress,
      });
    if (status !== "Ready") {
      throw new Error(`The current listing status is: ${status}}`);
    }
    if (inscription && utxos) {
      const [inscriptionTxId, inscriptionVout, offset] =
        inscription.location.split(":");
      const [ordinalUtxo] = utxos.filter(
        (u) =>
          u.txid === inscriptionTxId && u.vout.toString() === inscriptionVout
      );
      const [cardinalUtxo] = utxos.filter(
        (u) => u.txid !== ordinalUtxo.txid || u.vout !== ordinalUtxo.vout
      );
      return { ordinalUtxo, cardinalUtxo };
    }
    throw new Error(`Unknown error checking inscription status`);
  }
}
