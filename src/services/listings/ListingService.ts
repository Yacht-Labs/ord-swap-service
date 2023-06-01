import { Listing, ListingStatus } from "@prisma/client";
import { InscriptionAPI } from "../../api/inscription/InscriptionAPI";
import { UtxoAPI } from "../../api/bitcoin/utxo/UtxoAPI";
import { Inscription, Utxo } from "../../types/models";
import { RegtestUtils } from "regtest-client";
import { BITCOIN_NETWORKS, sleep } from "../../utils";
import { readBitcoinNetwork } from "../../utils/env";
type MinimalListing = Pick<Listing, "pkpBtcAddress" | "inscriptionId">;

const regtestUtils = new RegtestUtils({
  APIPASS: "satoshi",
  APIURL: "http://localhost:8080/1",
});

export class ListingService {
  constructor(
    private inscriptionAPI: InscriptionAPI,
    private utxoAPI: UtxoAPI
  ) {}

  async confirmListing(listing: Listing | MinimalListing): Promise<{
    status: ListingStatus;
    utxos: Utxo[];
    inscription: Inscription | null;
  }> {
    try {
      const utxos = await this.utxoAPI.getUtxosByAddress(
        listing.pkpBtcAddress,
        2
      );

      if (utxos.length === 0) {
        return {
          status: ListingStatus.NeedsBoth,
          utxos: [],
          inscription: null,
        };
      }

      if (readBitcoinNetwork() === BITCOIN_NETWORKS.REGTEST) {
        await regtestUtils.mine(2);
        await sleep(5000);
      }

      let inscription: Inscription;
      if (utxos.length === 1) {
        if (
          utxos[0].txId ===
          listing.inscriptionId.substring(
            0,
            listing.inscriptionId.lastIndexOf("i")
          )
        ) {
          inscription = await this.inscriptionAPI.getInscription(
            listing.inscriptionId
          );
          return {
            status: ListingStatus.NeedsCardinal,
            utxos,
            inscription: inscription,
          };
        } else
          return {
            status: ListingStatus.NeedsOrdinal,
            utxos,
            inscription: null,
          };
      }

      inscription = await this.inscriptionAPI.getInscription(
        listing.inscriptionId
      );

      if (inscription.address !== listing.pkpBtcAddress) {
        return { status: ListingStatus.NeedsOrdinal, utxos, inscription: null };
      }

      return { status: ListingStatus.Ready, utxos, inscription };
    } catch (e) {
      throw e;
    }
  }
}
