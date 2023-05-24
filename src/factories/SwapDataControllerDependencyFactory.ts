import { RegtestUtxoAPI } from "../api/bitcoin/utxo/regtest/RegtestUtxoAPI";
import { HiroInscriptionAPI } from "../api/inscription/hiro/HiroInscriptionAPI";
import { ListingService } from "../services/listings/ListingService";
import { InscriptionManager } from "../services/inscription/InscriptionService";
import { AlchemyEthTransactionAPI } from "../api/ethereum/AlchemyEthTransactionApi";
import { EthereumService } from "../services/ethereum/EthereumService";
import { EthereumAPI } from "../api/ethereum/EthTransactionAPI";

interface SwapDataControllerDependencies {
  inscriptionManager: InscriptionManager;
  ethAPI: EthereumAPI;
  ethService: EthereumService;
}
export class SwapDataControllerDependencyFactory {
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
