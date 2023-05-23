import "./polyfill.js";
import { Buff } from "@cmdcode/buff-utils";
import { SecretKey } from "@cmdcode/crypto-utils";
import { Address, Signer, Tap, Tx } from "@cmdcode/tapscript";
import * as bitcoin from "bitcoinjs-lib";
import ecc from "@bitcoinerlab/secp256k1";
import { RegtestUtils } from "regtest-client";
import { ECPairFactory } from "ecpair";

bitcoin.initEccLib(ecc);
const ECPair = ECPairFactory(ecc);

const APIPASS = process.env.APIPASS || "satoshi";
const APIURL = process.env.APIURL || "http://localhost:8080/1";
const regtestUtils = new RegtestUtils({ APIPASS, APIURL });
const regtest = bitcoin.networks.regtest;

const secret =
  "0a7d01d1c2e1592a02ea7671bb79ecd31d8d5e660b008f4b10e67787f4f24712";
const seckey = new SecretKey(secret, { type: "taproot" });
const pubkey = seckey.pub;

// const address = process.argv[2];
// const keyPair = ECPair.makeRandom({ network: bitcoin.networks.regtest });
// const { address } = bitcoin.payments.p2wpkh({
//   pubkey: keyPair.publicKey,
//   network: bitcoin.networks.regtest,
// });
// const scriptPubKey = bitcoin.address.toOutputScript(address!, regtest);
// console.log("Address in module: ", address)

export async function createInscription(scriptPubKey: Buffer) {
  const script = [
    pubkey,
    "OP_CHECKSIG",
    "OP_0",
    "OP_IF",
    Buff.encode("ord"),
    "01",
    Buff.encode("image/png"),
    "OP_0",
    new Uint8Array(11),
    "OP_ENDIF",
  ];
  const tapleaf = Tap.encodeScript(script);
  const [tpubkey, cblock] = Tap.getPubKey(pubkey, { target: tapleaf });
  const taprootAddress = Address.p2tr.fromPubKey(tpubkey, "regtest");

  // console.log("here");
  const unspent = await regtestUtils.faucet(taprootAddress, 100_000);
  // console.log("There")
  const txdata = Tx.create({
    vin: [
      {
        // Use the txid of the funding transaction used to send the sats.
        txid: unspent.txId,
        // Specify the index value of the output that you are going to spend from.
        vout: unspent.vout,
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
  // const f = async () => {
  await regtestUtils.broadcast(Tx.encode(txdata).hex);
  // console.log("Tx ID: ", Tx.util.getTxid(txdata));
  // console.log("done broadcasting");
  // }
  // await f();
  // await regtestUtils.faucet(address, 100_000);
  // await regtestUtils.mine(1);
  // console.log("Calling unspents with: ", scriptPubKey.toString('hex'))
  // const unspents = await regtestUtils.unspents(address!);
  // console.log("Unspents in Module: ", unspents);
  // await regtestUtils.mine(1);
  //scriptPubKey.toString('hex'));
  // console.log("Address: ", bitcoin.address.fromOutputScript(scriptPubKey, regtest));
  // console.log(JSON.stringify(unspents));
  // console.log("script: ", scriptPubKey.toString('hex'));
}

// regtestUtils.unspents(bitcoin.address.toOutputScript("bcrt1qdfymkmyw3lhllv68vfeduaxwptx2qmu2d8lng5", bitcoin.networks.regtest).toString("hex")).then(console.log);
// regtestUtils.fetch("601131d38d029b4f568c9f7ea758204a9eb5129deaed15175a2b1f7b99e645bfi0").then(console.log);