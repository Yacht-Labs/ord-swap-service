// src/routes/accounts.routes.ts

import { Router, Request, Response } from "express";
import prisma from "../../../db/prisma";

const router = Router();

router.post("/", async (req: Request, res: Response) => {
  try {
    const { ethAddress } = req.body;

    const existingAccount = await prisma.account.findFirst({
      where: {
        ethAddress,
      },
    });

    if (existingAccount) {
      return res.status(409).json({
        message: "An account with this Ethereum address already exists.",
      });
    }

    const account = await prisma.account.create({
      data: {
        ethAddress,
      },
    });

    res.status(201).json(account);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.put("/", async (req: Request, res: Response) => {
  const { btcPayoutAddress, ethAddress } = req.body;
  if (!btcPayoutAddress || !ethAddress) {
    return res.status(400).json({
      message: "btcPayoutAddress and ethAddress are required.",
    });
  }
  try {
    const account = await prisma.account.update({
      where: {
        ethAddress,
      },
      data: {
        btcPayoutAddress,
      },
    });
    res.status(200).json(account);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

export default router;
