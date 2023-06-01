const typescript = require("rollup-plugin-typescript2");
const { nodeResolve } = require("@rollup/plugin-node-resolve");
const commonjs = require("@rollup/plugin-commonjs");
module.exports = {
  input: "src/lit/action/InscriptionPkpSwap.ts", // Path to your main TypeScript file
  output: {
    file: "src/lit/action/javascript/PKP_ORDINAL_SWAP.bundle.js", // Output bundle location
    format: "cjs", // Format of the output bundle (cjs = CommonJS, also: es, iife, etc.)
  },
  plugins: [
    //nodeResolve({ preferBuiltins: true }),
    commonjs(),
    typescript({
      tsconfigOverride: { compilerOptions: { module: "ESNext" } },
    }),
  ],
};
