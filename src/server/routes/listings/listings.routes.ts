import { Router, Request, Response } from "express";
// eslint-disable-next-line import/no-extraneous-dependencies
import { ethers } from "ethers";
import * as bitcoin from "bitcoinjs-lib";
import { LitService } from "../../services/LitService";
import prisma from "../../../db/prisma";
import { TransactionService } from "src/bitcoin/TransactionService/TransactionService";
import { checkInscriptionStatus } from "src/lit/action/ListingActions";
import * as ecc from "tiny-secp256k1";

const router = Router();
router.post("/", async (req: Request, res: Response) => {
  try {
    const { ethAddress, ethPrice, inscriptionId, inscriptionNumber } = req.body;
    let account = await prisma.account.findUnique({ where: { ethAddress } });
    if (!account) {
      account = await prisma.account.create({
        data: {
          ethAddress,
        },
      });
    }

    const litService = new LitService();
    const pkp = await litService.mintPkp();
    const pkpBtcAddress = litService.generateBtcAddress(pkp.publicKey);

    const listing = await prisma.listing.create({
      data: {
        ethPrice,
        inscriptionId,
        inscriptionNumber,
        listingAccountId: account.id,
        pkpPublicKey: pkp.publicKey,
        pkpBtcAddress,
      },
    });

    res.status(201).json(listing);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.get("/", async (req: Request, res: Response) => {
  try {
    const { address, id } = req.query;

    let listings: any[];

    if (address) {
      listings = await prisma.listing.findMany({
        where: {
          account: {
            ethAddress: address as string,
          },
        },
      });
    } else if (id) {
      listings = await prisma.listing.findMany({
        where: {
          id: id as string,
        },
      });
    } else {
      listings = await prisma.listing.findMany({
        where: {
          cancelledDate: null,
          sellDate: null,
        },
      });
    }
    res.status(200).json(listings);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.put("/", async (req: Request, res: Response) => {
  const { signature, pkpPublicKey, isBuy, listingId } = req.body;
  try {
    let updatedListing;

    if (signature) {
      // If signature is provided, mark the listing as cancelled
      // TODO: CHECK SIGNATURE
      updatedListing = await prisma.listing.update({
        where: { id: listingId },
        data: {
          cancelledDate: new Date(),
        },
      });
    } else if (isBuy) {
      const code = await LitService.loadJsFile(
        "src/lit/action/javascript/PkpBtcSwap.bundle.js"
      );
      const variables = {
        hardEthPrice: "0.1",
        hardEthPayoutAddress: "0x48F9E3AD6fe234b60c90dAa2A4f9eb5a247a74C3",
      };
      const codeWithHardCodedVars = LitService.replaceVariables(
        code,
        variables
      );
      const litService = new LitService({ btcTestNet: false });
      const authSig = await litService.generateAuthSig();
      const pkpBtcAddress = litService.generateBtcAddress(pkpPublicKey);
      console.log("----About to run Lit Action----");
      const result = await litService.runLitAction({
        pkpPublicKey,
        code: codeWithHardCodedVars,
        authSig,
        pkpEthAddress: ethers.utils.computeAddress(pkpPublicKey),
        pkpBtcAddress,
        btcAddress: "placeholder",
      });
      console.log({ result });
      console.log(result.signatures.hashForSig1);
      console.log(result.signatures.hashForSig0);
      try {
        // const txService = new TransactionService();
        // const { ordinalUtxo, cardinalUtxo } = await checkInscriptionStatus(
        //   "184NQjUzuA7iS8s2pbdBfXbAHJAE2Hf2QK",
        //   "3f22c588f0b509ed9f53f340e5d9fb1ae288db4830a7d48d9fd28d7f5f1e105ei0"
        // );
        // const { transaction } = txService.prepareInscriptionTransaction({
        //   ordinalUtxo,
        //   cardinalUtxo,
        //   receivingAddress:
        //     "bc1pdj2gvzymxtmcrs5ypm3pya8vc3h4fkk2g9kmav0j6skgruez88rsjprd7j",
        // });
        const transaction = bitcoin.Transaction.fromHex(result.response);
        const compressedPoint = ecc.pointCompress(
          Buffer.from(pkpPublicKey.replace("0x", ""), "hex"),
          true
        );
        const sig0 = Buffer.from(
          result.signatures.hashForSig0.r + result.signatures.hashForSig0.s,
          "hex"
        );

        const signedInput0 = bitcoin.script.compile([
          bitcoin.script.signature.encode(
            sig0,
            bitcoin.Transaction.SIGHASH_ALL
          ),
          Buffer.from(compressedPoint.buffer),
        ]);
        transaction.setInputScript(0, signedInput0);

        const sig1 = Buffer.from(
          result.signatures.hashForSig1.r + result.signatures.hashForSig1.s,
          "hex"
        );
        const signedInput1 = bitcoin.script.compile([
          bitcoin.script.signature.encode(
            sig1,
            bitcoin.Transaction.SIGHASH_ALL
          ),
          Buffer.from(compressedPoint.buffer),
        ]);
        transaction.setInputScript(1, signedInput1);
        console.log(transaction.toHex());
        return transaction.toHex();
      } catch (err) {
        console.log(err);
      }
      // const signedInput0 = bitcoin.script.compile([
      //   bitcoin.script.signature.encode(sig0, bitcoin.Transaction.SIGHASH_ALL),
      //   ethers.utils.computePublicKey(
      //     Buffer.from("0x043ad6fd35de7bd4f025653d1f91cff5ef55cf0433532cb28abb6f1660b691f85244cedc75f7bdf04f71d2f09061865f6862b8245eecc5b21b4c9a224128442595", "hex"),
      //     true
      //   ),
      // ]);
      // transaction.setInputScript(0, signedInput0);

      // const signedInput1 = bitcoin.script.compile([
      //   bitcoin.script.signature.encode(sig1, bitcoin.Transaction.SIGHASH_ALL),
      //   sendingKeyPair.publicKey,
      // ]);
      // transaction.setInputScript(1, signedInput1);

      // console.log(transaction.toHex());
    }
    res.status(200).json(updatedListing);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

export default router;
