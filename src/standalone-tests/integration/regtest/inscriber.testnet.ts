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

const seed =
  "6d2fac7bcf58e7b25e16552c684dc6fe3e04fd38705de4cc943047498c828ba57cd01391f25e3d02e478237a66f873369a06a2145d1cf7d8e66517d9feaa795b";
const keypair = bip32.fromSeed(Buffer.from(seed, "hex"), testnet);
const seckey = new SecretKey(seed, { type: "taproot" });
const pubkey = seckey.pub;

const { address } = bitcoin.payments.p2pkh({
  pubkey: keypair.publicKey,
  network: testnet,
});

const scriptPubKey = bitcoin.address.toOutputScript(address!, testnet);
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

(async () => {
  const unspents = await mempoolSpaceAPI.getUtxosByAddress(address!);
  if (!unspents.length) {
    console.log("No unspents found");
    return;
  }
  const unspent = unspents[0];
  const txid = unspent.txId;
  const vout = unspent.vout;
  const input_sat = unspent.amount;

  const tx = new bitcoin.Transaction();
  tx.addInput(Buffer.from(txid, "hex").reverse(), vout);
  tx.addOutput(toOutputScript(taprootAddress!, testnet), 20000);
  tx.addOutput(toOutputScript(address!, testnet), input_sat - 20000 - 1000);

  const hashForSig = tx.hashForSignature(
    0,
    toOutputScript(address!, testnet),
    bitcoin.Transaction.SIGHASH_ALL
  );

  const signature0 = keypair.sign(hashForSig);

  const signedInput = bitcoin.script.compile([
    bitcoin.script.signature.encode(
      signature0,
      bitcoin.Transaction.SIGHASH_ALL
    ),
    keypair.publicKey,
  ]);
  tx.setInputScript(0, signedInput);
  console.log("p2trID: ", tx.getId());

  console.log("p2trHEX: ", tx.toHex());

  // console.log("here");
  // console.log("There")
  const txdata = Tx.create({
    vin: [
      {
        // Use the txid of the funding transaction used to send the sats.
        txid: tx.getId(),
        // Specify the index value of the output that you are going to spend from.
        vout: 0,
        // Also include the value and script of that ouput.
        prevout: {
          // Feel free to change this if you sent a different amount.
          value: 20_000,
          // This is what our address looks like in script form.
          scriptPubKey: ["OP_1", tpubkey],
        },
      },
    ],
    vout: [
      {
        // We are leaving behind 10,000 sats as a fee to the miners.
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
  console.log("inscriptionRevealID: ", txId);
  console.log("inscriptionRevealHEX: ", Tx.encode(txdata).hex);
})();
