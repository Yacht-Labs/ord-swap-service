import { BusinessLogicError } from "../../types/errors";
import { UnknownError } from "../../types/errors";
import { Utxo } from "../../types/models";
import { ListingService } from "../listings/ListingService";

export class InscriptionService {
  constructor(private listingService: ListingService) {}

  async checkInscriptionStatus(
    pkpBtcAddress: string,
    inscriptionId: string
  ): Promise<{
    ordinalUtxo: Utxo;
    cardinalUtxo: Utxo;
  }> {
    try {
      const { status, utxos, inscription } =
        await this.listingService.confirmListing({
          inscriptionId,
          pkpBtcAddress,
        });
      if (status !== "Ready") {
        throw new BusinessLogicError(
          `The current listing status for inscriptionID: ${inscriptionId} is: ${status}}`
        );
      }
      if (inscription && utxos) {
        const [inscriptionTxId, inscriptionVout, offset] =
          inscription.location.split(":");
        const [ordinalUtxo] = utxos.filter(
          (u) =>
            u.txId === inscriptionTxId && u.vout.toString() === inscriptionVout
        );
        const [cardinalUtxo] = utxos.filter(
          (u) => u.txId !== ordinalUtxo.txId || u.vout !== ordinalUtxo.vout
        );
        return { ordinalUtxo, cardinalUtxo };
      }
      throw new UnknownError(
        `Unknown error checking inscription status for inscriptionID: ${inscriptionId}`
      );
    } catch (e) {
      throw e;
    }
  }
}
