import { RegtestUtxoAPI } from "./../../api/bitcoin/utxo/regtest/RegtestUtxoAPI";
import * as bitcoin from "bitcoinjs-lib";
import { RegtestUtils } from "regtest-client";
import { BIP32Factory } from "bip32";
import ECPairFactory, { ECPairInterface } from "ecpair";
import ecc from "@bitcoinerlab/secp256k1";
import { HiroInscriptionAPI } from "../../api/inscription/hiro/HiroInscriptionAPI";
import { createInscription } from "../../standalone-tests/integration/regtest/inscriber";
import { ListingService } from "./ListingService";
import { sleep, toXOnly } from "../../utils";
import { ListingStatus } from "@prisma/client";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const rng = require("randombytes");
bitcoin.initEccLib(ecc);
const ECPair = ECPairFactory(ecc);
const bip32 = BIP32Factory(ecc);
const APIPASS = "satoshi";
const APIURL = "http://localhost:8080/1";
const regtestUtils = new RegtestUtils({ APIPASS, APIURL });

describe("ListingService Integration", () => {
  let keyPair: ECPairInterface;
  let p2trAddress: string;
  const hiroInscriptionApi = new HiroInscriptionAPI();
  const regtestUtxoAPI = new RegtestUtxoAPI();
  const listingService = new ListingService(hiroInscriptionApi, regtestUtxoAPI);

  beforeEach(async () => {
    const internalKey = bip32.fromSeed(rng(64), bitcoin.networks.regtest);
    const { address } = bitcoin.payments.p2tr({
      pubkey: toXOnly(internalKey.publicKey),
      network: bitcoin.networks.regtest,
    });
    p2trAddress = address!;
  });

  it("Should respond with NEEDS BOTH if no utxos", async () => {
    const { status, utxos, inscription } = await listingService.confirmListing({
      pkpBtcAddress: p2trAddress,
      inscriptionId: "123",
    });
    expect(status).toBe(ListingStatus.NeedsBoth);
    expect(utxos).toHaveLength(0);
    expect(inscription).toBeNull();
  });

  it("Should respond with NEEDS CARDINAL if no cardinal utxos", async () => {
    const { inscriptionId } = await createInscription(p2trAddress);
    const { status, utxos, inscription } = await listingService.confirmListing({
      pkpBtcAddress: p2trAddress,
      inscriptionId: inscriptionId,
    });
    expect(status).toBe(ListingStatus.NeedsCardinal);
    expect(utxos).toHaveLength(1);
    expect(inscription).toHaveProperty("id", inscriptionId);
  });

  it("Should respond with NEEDS ORDINAL if no ordinal utxos", async () => {});

  it("Should respond with READY if both utxos", async () => {});
});
