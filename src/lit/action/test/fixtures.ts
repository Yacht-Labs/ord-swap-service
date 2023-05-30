import { parseEther } from "ethers/lib/utils";
import { generateEthereumAddress } from "../../../utils";
import { ethers } from "ethers";
const ethPrice = "0.01";
const chainId = "4";
const inscriptionId = "123";
const ethPayoutAddress = "0x6fa1deB6AE1792Cf2f3A78283Cb2B8da2C620808";

export const HardCodedInscriptionSwapFixture = {
  ethPrice,
  chainId,
  inscriptionId,
  ethPayoutAddress,
};

export const PassedInInscriptionSwapFixture = {
  pkpBtcAddress:
    "bc1p3yae6tf4vy8fafz2h5ltya885lxhjnsx2un8dc3lkfejjvw0588sxrtxk4",
  pkpEthAddress: generateEthereumAddress(),
  pkpPublicKey: "0x90B8F7A3004080a8dadC9Ab935250714a3A27aaE",
  btcPayoutAddress:
    "bc1p3yae6tf4vy8fafz2h5ltya885lxhjnsx2un8dc3lkfejjvw0588sxrtxk4",
  isCancel: false,
  btcCancelAddress:
    "bc1p3yae6tf4vy8fafz2h5ltya885lxhjnsx2un8dc3lkfejjvw0588sxrtxk4",
};
