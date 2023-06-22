// eslint-disable-next-line @typescript-eslint/no-var-requires
import crypto from "crypto";
// const crypto = require("crypto");
if (typeof globalThis.crypto === "undefined") {
  (globalThis.crypto as any) = {
    getRandomValues: (array: any) => {
      return crypto.randomFillSync(array as any);
    },
  };
}
