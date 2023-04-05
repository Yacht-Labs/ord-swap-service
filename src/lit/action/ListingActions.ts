import { ListingService } from "../../server/services/ListingService";
import { BlockchainInfoUtxoApi } from "../../api/utxo/BlockchainInfoApi";
import { OrdXyzInscriptionAPI } from "../../api/inscription/OrdXyzInscriptionAPI";

const inscriptionAPI = new OrdXyzInscriptionAPI();
const utxoAPI = new BlockchainInfoUtxoApi();
const listingService = new ListingService(inscriptionAPI, utxoAPI);

export async function checkInscriptionStatus(
  pkpBtcAddress: string,
  inscriptionId: string
) {
  const { listingIsConfirmed, utxos, inscription } =
    await listingService.confirmListing({
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
  // have another function that builds the transaction
}
