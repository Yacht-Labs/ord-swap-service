// development.ts
(global as any).pkpBtcAddress = "184NQjUzuA7iS8s2pbdBfXbAHJAE2Hf2QK";
(global as any).isUnitTest = "true";
(global as any).pkpEthAddress = "0x6fa1deB6AE1792Cf2f3A78283Cb2B8da2C620808";
(global as any).publicKey =
  "0x043ad6fd35de7bd4f025653d1f91cff5ef55cf0433532cb28abb6f1660b691f85244cedc75f7bdf04f71d2f09061865f6862b8245eecc5b21b4c9a224128442595";
(global as any).btcPayoutAddress = "999999UzuA7iS8s2pbdBfXbAHJAE999999";
(global as any).isCancel = true;
(global as any).btcCancelAddress = "999999UzuA7iS8s2pbdBfXbAHJAE999999";

export const mockLitActionSetResponse = jest.fn((options: any) => {
  return options;
});

export const mockLitActionSignEcdsa = jest.fn((options: any) => {
  return options;
});

let memoizedAddress = () => "";
export const setLitActionAuthAddress = (address = "") => {
  memoizedAddress = () => address;
};

// Fake Lit implementation
const fakeLit: {
  Actions: Action;
  Auth: Auth;
  LitActions: LitActions;
} = {
  Actions: {
    setResponse: (options: { response: string }) => {
      mockLitActionSetResponse(options);
    },
    signEcdsa: (options: {
      toSign: Uint8Array;
      publicKey: string;
      sigName: string;
    }) => {
      mockLitActionSignEcdsa(options);
    },
  },
  get Auth() {
    return { authSigAddress: memoizedAddress() };
  },
  LitActions: {
    signEcdsa: (options: {
      toSign: Uint8Array;
      publicKey: string;
      sigName: string;
    }) => {
      console.log("Fake signEcdsa called with:", options);
    },
  },
};

(global as any).Lit = fakeLit;

// Import and set ethers as a global variable
import { ethers } from "ethers";
(global as any).ethers = ethers;
