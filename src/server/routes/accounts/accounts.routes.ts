// src/routes/accounts.routes.ts

import { Router, Request, Response } from "express";
import {
  createAccount,
  updateAccount,
  getAccount,
} from "../../../services/accounts/AccountsService";
import { RequestError } from "../../../types/errors";

const router = Router();
router.get("/", async (req: Request, res: Response, next) => {
  try {
    const { address } = req.query;
    const account = await getAccount(address as string);
    res.status(200).json(account);
  } catch (error) {
    next(error);
  }
});

router.post("/", async (req: Request, res: Response, next) => {
  try {
    const { ethAddress } = req.body;
    const account = await createAccount(ethAddress);
    res.status(201).json(account);
  } catch (error) {
    next(error);
  }
});

router.put("/", async (req: Request, res: Response, next) => {
  const { btcPayoutAddress, ethAddress } = req.body;
  if (!btcPayoutAddress || !ethAddress) {
    throw new RequestError("btcPayoutAddress and ethAddress are required.");
  }
  try {
    const account = await updateAccount(ethAddress, btcPayoutAddress);
    res.status(200).json(account);
  } catch (error) {
    next(error);
  }
});

export default router;
