import { ethers } from "ethers";
import bs58 from "bs58";
import { SiweMessage } from "siwe";
import { LitService } from "../services/lit/LitService";
import { RegtestUtils } from "regtest-client";
import { sleep } from "./btc";
import { createInscription } from "../standalone-tests/integration/regtest/inscriber";
import { LIT_SWAP_FILE_NAME } from "../constants";

export type LitAuthSig = {
  sig: string;
  derivedVia: string;
  signedMessage: string;
  address: string;
};

export async function generateAuthSig(
  signer: ethers.Signer,
  chainId = 1,
  uri = "https://localhost/login",
  version = "1"
): Promise<LitAuthSig> {
  const siweMessage = new SiweMessage({
    domain: "localhost",
    address: await signer.getAddress(),
    statement: "This is a key for Yacht",
    uri,
    version,
    chainId,
  });
  const messageToSign = siweMessage.prepareMessage();
  const sig = await signer.signMessage(messageToSign);
  return {
    sig,
    derivedVia: "web3.eth.personal.sign",
    signedMessage: messageToSign,
    address: await signer.getAddress(),
  };
}

export function getBytesFromMultihash(multihash: string): string {
  const decoded = bs58.decode(multihash);
  return `0x${Buffer.from(decoded).toString("hex")}`;
}

export async function setUpPkpIntegrationTest(
  ethPrice: string,
  sellerEthWallet: ethers.Wallet,
  buyerEthWallet: ethers.Wallet,
  loserEthWallet: ethers.Wallet
) {
  const regtestUtils = new RegtestUtils();
  const litService = new LitService();
  const pkp = await litService.mintPkp();
  const pkpBtcAddress = litService.generateBtcAddress(pkp.publicKey);
  const pkpEthAddress = ethers.utils.computeAddress(pkp.publicKey);
  await regtestUtils.faucet(pkpBtcAddress, 1e10);
  await sleep(2000);
  const { inscriptionId } = await createInscription(pkpBtcAddress);
  const litActionCode = await litService.loadActionCode(LIT_SWAP_FILE_NAME, {
    ethPrice: ethPrice,
    ethPayoutAddress: sellerEthWallet.address,
    inscriptionId,
    chainId: "5",
  });

  const IPFShash = await LitService.getIPFSHash(litActionCode);
  await litService.addPermittedAction(pkp.tokenId, IPFShash);

  if (ethPrice !== "0") {
    const tx = await buyerEthWallet.sendTransaction({
      to: pkpEthAddress,
      value: ethers.utils.parseEther(ethPrice),
    });
    await tx.wait(1);

    const tx2 = await loserEthWallet.sendTransaction({
      to: pkpEthAddress,
      value: ethers.utils.parseEther(ethPrice),
    });
    await tx2.wait(1);
  }
  return {
    pkp,
    pkpBtcAddress,
    pkpEthAddress,
    inscriptionId,
    litActionCode,
  };
}
