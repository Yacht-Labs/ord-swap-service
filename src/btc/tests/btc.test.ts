/* eslint-disable no-param-reassign */
/* eslint-disable no-promise-executor-return */
import BigNumber from "bignumber.js";
import { exec } from "child_process";
import fs from "fs";
import { promisify } from "util";
import ECPairFactory from "ecpair";
import * as ecc from "tiny-secp256k1";
import * as bitcoin from "bitcoinjs-lib";
import { toOutputScript } from "bitcoinjs-lib/src/address";

const execAsync = promisify(exec);
const ECPair = ECPairFactory(ecc);
const REGTEST = bitcoin.networks.regtest;

describe("Bitcoin", () => {
  it("tests", () => {
    expect(1 + 1).toBe(2);
  });
});
