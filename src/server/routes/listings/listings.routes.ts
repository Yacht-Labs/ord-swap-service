import { Router, Request, Response } from "express";
// eslint-disable-next-line import/no-extraneous-dependencies
import { ethers } from "ethers";
import { LitService } from "../../../services/LitService";
import prisma from "../../../db/prisma";
import { LitActionResponse } from "../../../types";
import { ListingService } from "../../../services/ListingService";
import { OrdXyzInscriptionAPI } from "../../../api/inscription/OrdXyzInscriptionAPI";
import { BlockchainInfoUtxoApi } from "../../../api/utxo/BlockchainInfoApi";
import { BtcTransactionManager } from "../../../lit/bitcoin/BtcTransactionManager";

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

router.post("/withdraw", async (req: Request, res: Response) => {
  // const {
  //   listingId,
  //   authSig,
  //   btcPayoutAddress,
  // }: {
  //   listingId: string;
  //   authSig: AuthSignature;
  //   btcPayoutAddress: string;
  // } = req.body;
  res.status(200).send("Working Endpoint");
});

router.put("/confirm", async (req: Request, res: Response) => {
  const { listingId } = req.body;
  const listingService = new ListingService(
    new OrdXyzInscriptionAPI(),
    new BlockchainInfoUtxoApi()
  );
  try {
    const listing = await prisma.listing.findUniqueOrThrow({
      where: {
        id: listingId,
      },
    });
    const { listingIsConfirmed } = await listingService.confirmListing(listing);
    await prisma.listing.update({
      where: {
        id: listingId,
      },
      data: {
        confirmedDate: new Date(),
      },
    });
    res.status(200).json({ listingIsConfirmed });
  } catch (err) {
    console.error(err);
    res.status(500).send((err as Error).message);
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
  const { isBuy, listingId } = req.body;
  try {
    if (isBuy) {
      const listing = await prisma.listing.findUnique({
        where: {
          id: listingId,
        },
        include: {
          account: {
            select: {
              ethAddress: true,
            },
          },
        },
      });
      if (!listing) {
        return res
          .status(404)
          .json({ error: `No listing found in DB with id: ${listingId}` });
      }
      const code = await LitService.loadJsFile("test");
      // const variables = {
      //   ethPrice: listing.ethPrice,
      //   ethPayoutAddress: listing.account.ethAddress,
      //   inscriptionId: listing.inscriptionId,
      // };
      // const codeWithHardCodedVars = LitService.replaceVariables(
      //   code,
      //   variables
      // );

      const litService = new LitService({ btcTestNet: false });
      const authSig = await litService.generateAuthSig();
      const pkpBtcAddress = litService.generateBtcAddress(listing.pkpPublicKey);
      const { response, signatures } = (await litService.runLitAction({
        pkpPublicKey: listing.pkpPublicKey,
        code,
        authSig,
        pkpEthAddress: ethers.utils.computeAddress(listing.pkpPublicKey),
        pkpBtcAddress,
        btcPayoutAddress: "placeholder",
      })) as LitActionResponse;
      if (response?.error) {
        return res.status(500).send(response.error);
      }
      if (response?.btcTransactionHex) {
        try {
          const btcTxManager = new BtcTransactionManager();
          const transactionHex = btcTxManager.builtLitBtcTransaction(
            response.btcTransactionHex,
            signatures.hashForInput0,
            signatures.hashForInput1,
            listing.pkpPublicKey
          );
          return res.status(200).json({ btcTransactionHex: transactionHex });
        } catch (err) {
          console.log(err);
          return res.status(500).json({ error: (err as Error).message });
        }
      }
    }
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
  res.status(500).json({ error: "Unknown Error with Lit Action" });
});

export default router;
