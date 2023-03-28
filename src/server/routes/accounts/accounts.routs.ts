// src/routes/accounts.routes.ts

import { Router, Request, Response } from "express";
import prisma from "../../db/prisma";

const router = Router();

router.post("/accounts", async (req: Request, res: Response) => {
  try {
    const { ethAddress } = req.body;

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

export default router;
