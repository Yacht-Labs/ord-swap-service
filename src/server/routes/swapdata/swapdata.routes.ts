import { Router, Request, Response } from "express";
import { SwapDataController } from "../../controllers/swapdata/SwapdataController";
import { SwapDataControllerDependencyFactory } from "../../../factories/SwapDataControllerDependencyFactory";

const router = Router();

// pkpBtcAddress: string, inscriptionId: string, pkpEthAddress: string, ethPrice: string
router.get("/", async (req, res, next) => {
  const factory = new SwapDataControllerDependencyFactory();
  const { inscriptionService, ethAPI, ethService, btcTxService } =
    factory.getDependenciesForEnv("REGTEST");
  const swapdataController = new SwapDataController(
    inscriptionService,
    ethAPI,
    ethService,
    btcTxService
  );
  try {
    const {
      pkpBtcAddress,
      inscriptionId,
      pkpEthAddress,
      ethPrice,
      btcPayoutAddress,
    } = req.query as any;
    const swapdata = await swapdataController.getSwapData(
      pkpBtcAddress,
      inscriptionId,
      pkpEthAddress,
      ethPrice,
      btcPayoutAddress
    );
    console.log("swapdata", swapdata);
    return res.status(200).json(swapdata);
  } catch (err) {
    next(err);
  }
});

export default router;
