import { EthereumService } from "../../../services/ethereum/EthereumService";
import { EthereumAPI } from "../../../api/ethereum/EthTransactionAPI";
import { InscriptionService } from "../../../services/inscription/InscriptionService";
import { Utxo } from "../../../types/models";
import { EthTransfer } from "../../../types";
import { SwapData } from "../../../types";

export class SwapDataController {
  private ethAPI: EthereumAPI;
  private ethService: EthereumService;
  private inscriptionManager: InscriptionService;

  constructor(
    inscriptionManager: InscriptionService,
    ethAPI: EthereumAPI,
    ethService: EthereumService
  ) {
    this.ethAPI = ethAPI;
    this.ethService = ethService;
    this.inscriptionManager = inscriptionManager;
  }

  async getSwapData(
    pkpBtcAddress: string,
    inscriptionId: string,
    pkpEthAddress: string,
    ethPrice: string
  ): Promise<SwapData> {
    let ordinalUtxo: Utxo | null = null;
    let cardinalUtxo: Utxo | null = null;
    let winningTransfer: EthTransfer | null = null;
    let losingTransfers: EthTransfer[] | null = null;
    let maxPriorityFeePerGas = "";
    let maxFeePerGas = "";
    try {
      const inscriptionResponse =
        await this.inscriptionManager.checkInscriptionStatus(
          pkpBtcAddress,
          inscriptionId
        );
      ordinalUtxo = inscriptionResponse.ordinalUtxo;
      cardinalUtxo = inscriptionResponse.cardinalUtxo;

      // get the winning and losing eth transfers
      const ethResponse = await this.ethService.findWinnersByAddress(
        pkpEthAddress,
        ethPrice
      );
      winningTransfer = ethResponse.winningTransfer;
      losingTransfers = ethResponse.losingTransfers;

      const ethApiResponse = await this.ethAPI.getCurrentGasPrices();
      maxPriorityFeePerGas = ethApiResponse.maxPriorityFeePerGas;
      maxFeePerGas = ethApiResponse.maxFeePerGas;
    } catch (e) {
      throw e;
    }

    return {
      ordinalUtxo,
      cardinalUtxo,
      winningTransfer,
      losingTransfers,
      maxPriorityFeePerGas,
      maxFeePerGas,
    };
  }
}
