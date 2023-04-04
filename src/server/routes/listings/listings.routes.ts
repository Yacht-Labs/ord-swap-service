import { Router, Request, Response } from "express";
// eslint-disable-next-line import/no-extraneous-dependencies
import { serialize } from "@ethersproject/transactions";
import { ethers } from "ethers";
import { LitService } from "../../services/LitService";
import TaprootWallet from "../../../bitcoin/TapRootWallet/TaprootWallet";
import prisma from "../../../db/prisma";

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
  const { signature, pkpPublicKey, encryptionPubKey, isBuy, listingId } =
    req.body;
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
        hardEthPrice: "0.01",
        hardEthPayoutAddress: "0x48F9E3AD6fe234b60c90dAa2A4f9eb5a247a74C3",
      };
      const codeWithHardCodedVars = LitService.replaceVariables(
        code,
        variables
      );
      const litService = new LitService({ btcTestNet: false });
      const authSig = await litService.generateAuthSig();
      const result = await litService.runLitAction({
        pkpPublicKey,
        code: codeWithHardCodedVars,
        authSig,
        pkpEthAddress: "0xc653a200b2a5D3c0cD93a1BB3A47c61C54bFff36",
        pkpBtcAddress: "placeholder",
        btcAddress: "placeholder",
      });
      console.log(result);
    }
    res.status(200).json(updatedListing);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

export default router;
