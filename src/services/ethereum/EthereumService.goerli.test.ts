import { EthereumService } from "../../services/ethereum/EthereumService";
import { AlchemyEthTransactionAPI } from "../../api/ethereum/AlchemyEthTransactionApi";
import { ethers } from "ethers";
import {
  readGoerliPrivateKey,
  readGoerliPrivateKey2,
  readGoerliRpcUrlEnv,
} from "../../utils/env";
import { EthTransfer } from "src/types";
import { parseEther } from "ethers/lib/utils";

describe("Ethereum Service Integration Tests", () => {
  const ethService = new EthereumService(new AlchemyEthTransactionAPI());
  let winner: EthTransfer | null = null;
  const price = "0.00001";
  const sourceWallet = new ethers.Wallet(
    readGoerliPrivateKey(),
    new ethers.providers.JsonRpcProvider(readGoerliRpcUrlEnv())
  );

  const sourceWallet2 = new ethers.Wallet(
    readGoerliPrivateKey2(),
    new ethers.providers.JsonRpcProvider(readGoerliRpcUrlEnv())
  );

  beforeAll(async () => {
    //create a random eth address
    const randomWallet = ethers.Wallet.createRandom();
    const privateKey = randomWallet.privateKey;
    const destinationAddress = randomWallet.address;
    console.log("privateKey", privateKey);

    //send eth from sourceWallet to destinationAddress
    const tx = await sourceWallet.sendTransaction({
      to: destinationAddress,
      value: ethers.utils.parseEther(price),
    });

    //wait for the transaction to be confirmed
    await tx.wait(1);

    //send eth from sourceWallet2 to destinationAddress
    const tx2 = await sourceWallet2.sendTransaction({
      to: destinationAddress,
      value: ethers.utils.parseEther(price),
    });

    //wait for the transaction to be confirmed
    await tx2.wait(1);

    const { winningTransfer } = await ethService.findWinnersByAddress(
      destinationAddress,
      price
    );
    winner = winningTransfer;
    console.log("winner", winner);
  }, 60000);

  it("should have ETH at the destination address", async () => {
    expect(winner?.value).toEqual(parseEther(price).toString());
  }, 60000);

  it("should have been sent by our key", async () => {
    expect(winner?.from.toLowerCase()).toEqual(
      sourceWallet.address.toLowerCase()
    );
  }, 60000);

  it("should not win if sent from the second address", async () => {
    expect(winner?.from.toLowerCase()).not.toEqual(
      sourceWallet2.address.toLowerCase()
    );
  }, 60000);
});
