import { RegtestUtxoAPI } from "../api/bitcoin/utxo/regtest/RegtestUtxoAPI";
import { HiroInscriptionAPI } from "../api/inscription/hiro/HiroInscriptionAPI";
import { ListingService } from "../services/listings/ListingService";
import { InscriptionService } from "../services/inscription/InscriptionService";
import { AlchemyEthTransactionAPI } from "../api/ethereum/AlchemyEthTransactionApi";
import { EthereumService } from "../services/ethereum/EthereumService";
import { EthereumAPI } from "../api/ethereum/EthTransactionApi";
import { BtcTransactionService } from "../services/bitcoin/BtcTransactionService";

interface SwapDataControllerDependencies {
  inscriptionService: InscriptionService;
  ethAPI: EthereumAPI;
  ethService: EthereumService;
  btcTxService: BtcTransactionService;
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
        const btcTxService = new BtcTransactionService();

        return {
          inscriptionService,
          ethAPI,
          ethService,
          btcTxService,
        };
    }
    const utxoAPI = new RegtestUtxoAPI();
    const inscriptionAPI = new HiroInscriptionAPI();
    const listingService = new ListingService(inscriptionAPI, utxoAPI);
    const inscriptionService = new InscriptionService(listingService);
    const ethAPI = new AlchemyEthTransactionAPI();
    const ethService = new EthereumService(ethAPI);
    const btcTxService = new BtcTransactionService();

    return {
      inscriptionService,
      ethAPI,
      ethService,
      btcTxService,
    };
  }
}
