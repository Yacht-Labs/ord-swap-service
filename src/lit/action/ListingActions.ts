import { ListingService } from "src/server/services/ListingService";
import { HiroInscriptionAPI } from "src/api/inscription/HiroInscriptionAPI";
import { BlockchainInfoUtxoApi } from "src/api/utxo/BlockchainInfoApi";

const INSCRIPTION_ID = "";
const PKP_BTC_ADDRESS = "";
const inscriptionAPI = new HiroInscriptionAPI();
const utxoAPI = new BlockchainInfoUtxoApi();
const listingService = new ListingService(inscriptionAPI, utxoAPI);

(async () => {
  const { listingIsConfirmed, utxos, inscription } =
    await listingService.confirmListing({
      inscriptionId: PKP_BTC_ADDRESS,
      pkpBtcAddress: PKP_BTC_ADDRESS,
    });
  if (!listingIsConfirmed) {
    throw new Error(
      "We are not able to confirm that the seller's listing is ready for sale"
    );
  }
  const [inscriptionTxId, inscriptionVout, offset] =
    inscription.location.split(":");

  const [ordinalUtxo] = utxos.filter(
    (u) => u.id === inscriptionTxId && u.vout.toString() === inscriptionVout
  );
  const cardinalUtxo = utxos.filter(
    (u) => u.txid !== ordinalUtxo.txid || u.vout !== ordinalUtxo.vout
  );

  // create a transaction for signature that has the ordinalUtxo as first input followed by cardinalUtxo.  First output goes to buyer BTC address
})();
