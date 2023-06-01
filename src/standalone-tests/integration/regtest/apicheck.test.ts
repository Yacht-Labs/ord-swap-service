import { ListingService } from "../../../services/listings/ListingService";
import { InscriptionService } from "../../../services/inscription/InscriptionService";
import { BtcTransactionService } from "../../../services/bitcoin/BtcTransactionService";
import { HiroInscriptionAPI } from "../../../api/inscription/hiro/HiroInscriptionAPI";
import { RegtestUtxoAPI } from "../../../api/bitcoin/utxo/regtest/RegtestUtxoAPI";
import ecc from "@bitcoinerlab/secp256k1";
import BIP32Factory from "bip32";
import * as bitcoin from "bitcoinjs-lib";
import ECPairFactory, { ECPairInterface } from "ecpair";
import { RegtestUtils } from "regtest-client";
import { sleep, toXOnly, unpadHexString } from "../../../utils";
import { createInscription } from "../../../standalone-tests/integration/regtest/inscriber";

const inscriptionAPI = new HiroInscriptionAPI();
const utxoAPI = new RegtestUtxoAPI();
const listingService = new ListingService(inscriptionAPI, utxoAPI);
const inscriptionService = new InscriptionService(listingService);

describe("Bitcoin Transaction Service", () => {
  it("should have cardinal and ordinal utxos", async () => {
    const { ordinalUtxo, cardinalUtxo } =
      await inscriptionService.checkInscriptionStatus(
        "muGxhFptiSici6KE3b9fhSUm2HG8MAAjp1",
        "b31629489700264f0b184920d8efd21e7e5f0d9bb16debc968b9ada938b2b70bi0"
      );
    console.log("ordinalUtxo", ordinalUtxo);
    console.log("cardinalUtxo", cardinalUtxo);
    expect(ordinalUtxo).toBeDefined();
    expect(cardinalUtxo).toBeDefined();
  }, 10000);
});
