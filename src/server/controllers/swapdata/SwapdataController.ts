import { EthereumService } from "../../../services/ethereum/EthereumService";
import { EthereumAPI } from "../../../api/ethereum/EthTransactionAPI";
import { InscriptionService } from "../../../services/inscription/InscriptionService";
import { Utxo } from "../../../types/models";
import { EthTransfer } from "src/types";

interface SwapData {
  ordinalUtxo: Utxo | null;
  cardinalUtxo: Utxo | null;
  winningTransfer: EthTransfer | null;
  losingTransfers: EthTransfer[] | null;
  maxPriorityFeePerGas: string;
  maxFeePerGas: string;
}

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
    // get the ordinal and cardinal utxos
    const { ordinalUtxo, cardinalUtxo } =
      await this.inscriptionManager.checkInscriptionStatus(
        pkpBtcAddress,
        inscriptionId
      );

    // get the winning and losing eth transfers
    const { winningTransfer, losingTransfers } =
      await this.ethService.findWinnersByAddress(pkpEthAddress, ethPrice);

    const { maxPriorityFeePerGas, maxFeePerGas } =
      await this.ethAPI.getCurrentGasPrices();

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
