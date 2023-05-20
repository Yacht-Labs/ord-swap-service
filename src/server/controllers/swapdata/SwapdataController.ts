import { MempoolSpaceAPI } from "../../../api/bitcoin/MempoolSpaceAPI";
import { OrdXyzInscriptionAPI } from "../../../api/inscription/OrdXyzInscriptionAPI";
import { ListingService } from "../../../services/listings/ListingService";
import { AlchemyEthTransactionAPI } from "../../../api/ethereum/AlchemyEthTransactionApi";
import { EthereumService } from "../../../services/ethereum/EthereumService";
import { InscriptionManager } from "../../../services/inscription/InscriptionService";
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
    private utxoAPI: MempoolSpaceAPI;
    private inscriptionAPI: OrdXyzInscriptionAPI;
    private listingService: ListingService;
    private ethAPI: AlchemyEthTransactionAPI;
    private ethService: EthereumService;
    private inscriptionManager: InscriptionManager;

    constructor() {
        this.utxoAPI = new MempoolSpaceAPI();
        this.inscriptionAPI = new OrdXyzInscriptionAPI();
        this.listingService = new ListingService(this.inscriptionAPI, this.utxoAPI);
        this.ethAPI = new AlchemyEthTransactionAPI();
        this.ethService = new EthereumService(this.ethAPI);
        this.inscriptionManager = new InscriptionManager(this.listingService);
    }

    async getSwapData(pkpBtcAddress: string, inscriptionId: string, pkpEthAddress: string, ethPrice: string): Promise<SwapData> {
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
            maxFeePerGas
        }
    }
}