import { Router, Request, Response } from "express";
import { SwapDataController } from "../../controllers/swapdata/SwapdataController";
import { RegtestUtxoAPI } from "../../../api/bitcoin/utxo/regtest/RegtestUtxoAPI";
import { HiroInscriptionAPI } from "../../../api/inscription/hiro/HiroInscriptionAPI";
import { ListingService } from "../../../services/listings/ListingService";
import { InscriptionManager } from "../../../services/inscription/InscriptionService";
import { AlchemyEthTransactionAPI } from "../../../api/ethereum/AlchemyEthTransactionApi";
import { EthereumService } from "../../../services/ethereum/EthereumService";
import { EthereumAPI } from "../../../api/ethereum/EthTransactionAPI";

const router = Router();

// pkpBtcAddress: string, inscriptionId: string, pkpEthAddress: string, ethPrice: string
router.get("/swapdata", async (req, res, next) => {
  const factory = new SwapDataControllerDependencyFactory();
  const { inscriptionManager, ethAPI, ethService } =
    factory.getDependenciesForEnv("REGTEST");
  const swapdataController = new SwapDataController(
    inscriptionManager,
    ethAPI,
    ethService
  );
  try {
    const { pkpBtcAddress, inscriptionId, pkpEthAddress, ethPrice } =
      req.query as any;
    const swapdata = await swapdataController.getSwapData(
      pkpBtcAddress,
      inscriptionId,
      pkpEthAddress,
      ethPrice
    );
    return res.status(200).json(swapdata);
  } catch (err) {
    next(err);
  }
});

interface SwapDataControllerDependencies {
  inscriptionManager: InscriptionManager;
  ethAPI: EthereumAPI;
  ethService: EthereumService;
}
class SwapDataControllerDependencyFactory {
  public getDependenciesForEnv(
    environment: string
  ): SwapDataControllerDependencies {
    switch (environment) {
      case "REGTEST":
        const utxoAPI = new RegtestUtxoAPI();
        const inscriptionAPI = new HiroInscriptionAPI();
        const listingService = new ListingService(inscriptionAPI, utxoAPI);
        const inscriptionManager = new InscriptionManager(listingService);
        const ethAPI = new AlchemyEthTransactionAPI();
        const ethService = new EthereumService(ethAPI);

        return {
          inscriptionManager,
          ethAPI,
          ethService,
        };
    }
    const utxoAPI = new RegtestUtxoAPI();
    const inscriptionAPI = new HiroInscriptionAPI();
    const listingService = new ListingService(inscriptionAPI, utxoAPI);
    const inscriptionManager = new InscriptionManager(listingService);
    const ethAPI = new AlchemyEthTransactionAPI();
    const ethService = new EthereumService(ethAPI);

    return {
      inscriptionManager,
      ethAPI,
      ethService,
    };
  }
}

export default router;
