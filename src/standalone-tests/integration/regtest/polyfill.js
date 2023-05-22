// eslint-disable-next-line @typescript-eslint/no-var-requires
const crypto = require("crypto");
if (typeof globalThis.crypto === "undefined") {
  globalThis.crypto = {
    getRandomValues: (array) => {
      return crypto.randomFillSync(array);
    },
  };
}
