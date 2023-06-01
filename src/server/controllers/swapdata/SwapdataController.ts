import { EthereumService } from "../../../services/ethereum/EthereumService";
import { EthereumAPI } from "../../../api/ethereum/EthTransactionApi";
import { InscriptionService } from "../../../services/inscription/InscriptionService";
import { Utxo } from "../../../types/models";
import { EthTransfer } from "../../../types";
import { SwapData } from "../../../types";
import { BtcTransactionService } from "src/services/bitcoin/BtcTransactionService";
import { Transaction } from "bitcoinjs-lib";

export class SwapDataController {
  private ethAPI: EthereumAPI;
  private ethService: EthereumService;
  private inscriptionManager: InscriptionService;
  private btcTxService: BtcTransactionService;

  constructor(
    inscriptionManager: InscriptionService,
    ethAPI: EthereumAPI,
    ethService: EthereumService,
    btcTxService: BtcTransactionService
  ) {
    this.ethAPI = ethAPI;
    this.ethService = ethService;
    this.inscriptionManager = inscriptionManager;
    this.btcTxService = btcTxService;
  }

  async getSwapData(
    pkpBtcAddress: string,
    inscriptionId: string,
    pkpEthAddress: string,
    ethPrice: string,
    btcPayoutAddress: string
  ): Promise<SwapData> {
    let ordinalUtxo: Utxo | null = null;
    let cardinalUtxo: Utxo | null = null;
    let winningTransfer: EthTransfer | null = null;
    let losingTransfers: EthTransfer[] | null = null;
    let maxPriorityFeePerGas = "";
    let maxFeePerGas = "";
    let hashForInput0: Buffer | null = null;
    let hashForInput1: Buffer | null = null;
    let transaction: string | null = null;
    try {
      const inscriptionResponse =
        await this.inscriptionManager.checkInscriptionStatus(
          pkpBtcAddress,
          inscriptionId
        );
      ordinalUtxo = inscriptionResponse.ordinalUtxo;
      cardinalUtxo = inscriptionResponse.cardinalUtxo;

      const inscriptionTx = this.btcTxService.prepareInscriptionTransaction({
        ordinalUtxo,
        cardinalUtxo,
        destinationAddress: btcPayoutAddress,
      });
      // hashForInput0 = inscriptionTx.hashForInput0.toString("hex");
      // hashForInput1 = inscriptionTx.hashForInput1.toString("hex");
      hashForInput0 = inscriptionTx.hashForInput0;
      hashForInput1 = inscriptionTx.hashForInput1;
      transaction = inscriptionTx.transaction.toHex();

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
      hashForInput0,
      hashForInput1,
      transaction,
      winningTransfer,
      losingTransfers,
      maxPriorityFeePerGas,
      maxFeePerGas,
    };
  }
}
