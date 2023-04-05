import { LitService } from "../../server/services/LitService";

async function main() {
  function replaceVariables(content: string, variables: any) {
    let result = content;
    for (const key in variables) {
      const placeholder = `{{${key}}}`;
      const value = variables[key];
      result = result.split(placeholder).join(value);
    }
    return result;
  }
  const variables = {
    hardEthPrice: "42069",
    hardEthPayoutAddress: "0x48F9E3AD6fe234b60c90dAa2A4f9eb5a247a74C3",
  };

  const code = await LitService.loadJsFile(
    "/Users/henryminden/Documents/ord-swap-service/src/lit/action/ordinalSwapAction.js"
  );
  const modifiedContent = replaceVariables(code, variables);
  console.log("Modified content:", modifiedContent);
}

main();
//DONT DELETE I GUESS
// await Lit.LitActions.signEcdsa({
//   toSign: hashTransaction(unsignedTransaction),
//   publicKey: pkpPublicKey,
//   sigName: "ethPayoutSignature",
// });
