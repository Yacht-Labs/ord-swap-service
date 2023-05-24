import { EthereumAPI } from "../../api/ethereum/EthTransactionAPI";
import { EthTransfer } from "../../types";
import { ethers } from "ethers";

export class EthereumService {
  constructor(public transactionAPI: EthereumAPI) {}
  public async findWinnersByAddress(address: string, price: string) {
    const transfers = await this.transactionAPI.getInboundTransactions(address);
    return this.findWinnersByTransaction(transfers, price);
  }

  filterEligibleTransfers(
    transfers: EthTransfer[],
    price: string
  ): EthTransfer[] {
    const weiPrice = ethers.utils.parseEther(price);
    return transfers.filter((transfer) =>
      ethers.BigNumber.from(transfer.value).gte(weiPrice)
    );
  }

  findWinnersByTransaction(
    transfers: EthTransfer[],
    price: string
  ): { winningTransfer: EthTransfer | null; losingTransfers: EthTransfer[] } {
    const eligibleTransfers = this.filterEligibleTransfers(transfers, price);
    let winner: EthTransfer | null = null;

    for (const transfer of eligibleTransfers) {
      if (!winner) {
        winner = transfer;
        continue;
      }
      if (
        parseInt(transfer.blockNum, 16) < parseInt(winner.blockNum, 16) ||
        (transfer.blockNum === winner.blockNum && transfer.from < winner.from)
      ) {
        eligibleTransfers.push(winner);
        winner = transfer;
      }
    }

    const losingTransfers = eligibleTransfers.filter(
      (transfer) => transfer !== winner
    );

    return {
      winningTransfer: winner,
      losingTransfers,
    };
  }

  buildEthTransaction() {
    return;
  }
}
