import { RegtestUtxoAPI } from "../api/bitcoin/utxo/regtest/RegtestUtxoAPI";
import { HiroInscriptionAPI } from "../api/inscription/hiro/HiroInscriptionAPI";
import { ListingService } from "../services/listings/ListingService";
import { InscriptionService } from "../services/inscription/InscriptionService";
import { AlchemyEthTransactionAPI } from "../api/ethereum/AlchemyEthTransactionAPI";
import { EthereumService } from "../services/ethereum/EthereumService";
import { EthereumAPI } from "../api/ethereum/EthTransactionAPI";
import { BtcTransactionService } from "../services/bitcoin/BtcTransactionService";
import { BITCOIN_NETWORKS } from "../utils";

interface SwapDataControllerDependencies {
  inscriptionService: InscriptionService;
  ethAPI: EthereumAPI;
  ethService: EthereumService;
  btcTxService: BtcTransactionService;
}
export class SwapDataControllerDependencyFactory {
  public getDependenciesForEnv(
    environment: BITCOIN_NETWORKS
  ): SwapDataControllerDependencies {
    switch (environment) {
      case BITCOIN_NETWORKS.REGTEST:
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
