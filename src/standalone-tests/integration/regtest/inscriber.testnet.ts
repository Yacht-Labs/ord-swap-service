import { ETH_GOERLI } from "../../../constants/index";
import "./polyfill.js";
import { Buff } from "@cmdcode/buff-utils";
import { SecretKey } from "@cmdcode/crypto-utils";
import { Address, Signer, Tap, Tx } from "@cmdcode/tapscript";
import * as bitcoin from "bitcoinjs-lib";
import ecc from "@bitcoinerlab/secp256k1";
import curve from "tiny-secp256k1";
import { BIP32Factory } from "bip32";
import { RegtestUtils } from "regtest-client";
import { ECPairFactory } from "ecpair";
import { MempoolSpaceAPI } from "../../../api/bitcoin/utxo/MempoolSpaceAPI";
import { toOutputScript } from "bitcoinjs-lib/src/address";

const mempoolSpaceAPI = new MempoolSpaceAPI();

bitcoin.initEccLib(ecc);
const bip32 = BIP32Factory(ecc);
const testnet = bitcoin.networks.testnet;

// Create a keypair and save its seed
// get the taproot address
// get the unspent txs

const tweak = true;
function createKeySpendOutput(publicKey: string) {
  // x-only pubkey (remove 1 byte y parity)
  const myXOnlyPubkey = Buffer.from(publicKey.slice(1, 33), "hex");
  if (tweak) {
    const commitHash = bitcoin.crypto.taggedHash("TapTweak", myXOnlyPubkey);
    const tweakResult = curve.xOnlyPointAddTweak(myXOnlyPubkey, commitHash);
    if (tweakResult === null) throw new Error("Invalid Tweak");
    const { xOnlyPubkey: tweaked } = tweakResult;
    // incomplete scriptPubkey
    return Buffer.from(tweaked);
  }
  return myXOnlyPubkey;
}

const seed =
  "6d2fac7bcf58e7b25e16552c684dc6fe3e04fd38705de4cc943047498c828ba57cd01391f25e3d02e478237a66f873369a06a2145d1cf7d8e66517d9feaa795b";
const keypair = bip32.fromSeed(Buffer.from(seed, "hex"), testnet);
const seckey = new SecretKey(keypair.privateKey!, { type: "taproot" });
const pubkey = seckey.pub;
const faucetAddress = Address.p2tr.fromPubKey(pubkey, "testnet");

console.log({ faucetAddress });
(async () => {
  const unspents = await mempoolSpaceAPI.getUtxosByAddress(faucetAddress);
  if (!unspents) throw new Error("No unspents!");

  const scriptPubKey = bitcoin.address.toOutputScript(faucetAddress, testnet);
  const script = [
    pubkey,
    "OP_CHECKSIG",
    "OP_0",
    "OP_IF",
    Buff.encode("ord"),
    "01",
    Buff.encode("image/png"),
    "OP_0",
    new Uint8Array(
      Array.from({ length: 32 }, () => Math.floor(Math.random() * 256))
    ),
    "OP_ENDIF",
  ];

  const tapleaf = Tap.encodeScript(script);
  const [tpubkey, cblock] = Tap.getPubKey(pubkey, { target: tapleaf });
  const taprootAddress = Address.p2tr.fromPubKey(tpubkey, "testnet");

  console.log({ taprootAddress });

  const value = 20000;

  const transaction = new bitcoin.Transaction();
  transaction.addInput(
    Buffer.from(unspents[0].txId, "hex").reverse(),
    unspents[0].vout
  );
  transaction.addOutput(toOutputScript(taprootAddress, testnet), value);
  transaction.addOutput(
    toOutputScript(faucetAddress, testnet),
    unspents[0].amount - value - 1000
  );
  transaction.version = 2;
  const sighash = transaction.hashForWitnessV1(
    0, // which input
    [
      bitcoin.script.compile([
        bitcoin.opcodes.OP_1,
        createKeySpendOutput(pubkey.toString()),
      ]),
    ], // All previous outputs of all inputs
    [unspents[0].amount], // All previous values of all inputs
    bitcoin.Transaction.SIGHASH_DEFAULT // sighash flag, DEFAULT is schnorr-only (DEFAULT == ALL)
  );

  const signature = seckey.sign(sighash);
  transaction.setWitness(0, [signature]);
})();

export async function createInscription(address: string) {
  const scriptPubKey = bitcoin.address.toOutputScript(address, testnet);
  const script = [
    pubkey,
    "OP_CHECKSIG",
    "OP_0",
    "OP_IF",
    Buff.encode("ord"),
    "01",
    Buff.encode("image/png"),
    "OP_0",
    new Uint8Array(
      Array.from({ length: 32 }, () => Math.floor(Math.random() * 256))
    ),
    "OP_ENDIF",
  ];

  const tapleaf = Tap.encodeScript(script);
  const [tpubkey, cblock] = Tap.getPubKey(pubkey, { target: tapleaf });
  const taprootAddress = Address.p2tr.fromPubKey(tpubkey, "testnet");

  console.log({ taprootAddress });

  const txdata = Tx.create({
    vin: [
      {
        // Use the txid of the funding transaction used to send the sats.
        txid: "1",
        // Specify the index value of the output that you are going to spend from.
        vout: 1,
        // Also include the value and script of that ouput.
        prevout: {
          // Feel free to change this if you sent a different amount.
          value: 100_000,
          // This is what our address looks like in script form.
          scriptPubKey: ["OP_1", tpubkey],
        },
      },
    ],
    vout: [
      {
        // We are leaving behind 1000 sats as a fee to the miners.
        value: 10_000,
        // This is the new script that we are locking our funds to.
        // scriptPubKey: Address.toScriptPubKey(randomAddress)
        scriptPubKey,
      },
    ],
  });

  const sig = Signer.taproot.sign(seckey, txdata, 0, { extension: tapleaf });
  txdata.vin[0].witness = [sig, script, cblock];
  const txId = Tx.util.getTxid(txdata);
  // await regtestUtils.broadcast(Tx.encode(txdata).hex);
  return { inscriptionId: `${txId}i0` };
}
// createInscription(
//   "bcrt1ph55s2cr9dv7k834jd2nr29h4uazhwp9hngq04quga2capn65k3vsdh5xyl"
// ).then(console.log);
// regtestUtils.unspents(bitcoin.address.toOutputScript("bcrt1qdfymkmyw3lhllv68vfeduaxwptx2qmu2d8lng5", bitcoin.networks.regtest).toString("hex")).then(console.log);
// regtestUtils.fetch("601131d38d029b4f568c9f7ea758204a9eb5129deaed15175a2b1f7b99e645bfi0").then(console.log);
