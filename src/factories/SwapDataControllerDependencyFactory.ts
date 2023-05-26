import { RegtestUtxoAPI } from "../api/bitcoin/utxo/regtest/RegtestUtxoAPI";
import { HiroInscriptionAPI } from "../api/inscription/hiro/HiroInscriptionAPI";
import { ListingService } from "../services/listings/ListingService";
import { InscriptionService } from "../services/inscription/InscriptionService";
import { AlchemyEthTransactionAPI } from "../api/ethereum/AlchemyEthTransactionApi";
import { EthereumService } from "../services/ethereum/EthereumService";
import { EthereumAPI } from "../api/ethereum/EthTransactionApi";

interface SwapDataControllerDependencies {
  inscriptionService: InscriptionService;
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
        const inscriptionService = new InscriptionService(listingService);
        const ethAPI = new AlchemyEthTransactionAPI();
        const ethService = new EthereumService(ethAPI);

        return {
          inscriptionService,
          ethAPI,
          ethService,
        };
    }
    const utxoAPI = new RegtestUtxoAPI();
    const inscriptionAPI = new HiroInscriptionAPI();
    const listingService = new ListingService(inscriptionAPI, utxoAPI);
    const inscriptionService = new InscriptionService(listingService);
    const ethAPI = new AlchemyEthTransactionAPI();
    const ethService = new EthereumService(ethAPI);

    return {
      inscriptionService,
      ethAPI,
      ethService,
    };
  }
}
