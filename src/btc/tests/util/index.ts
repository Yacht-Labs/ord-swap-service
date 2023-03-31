/* eslint-disable no-promise-executor-return */

import BigNumber from "bignumber.js";

/* eslint-disable no-param-reassign */
export function reverseBuffer(buffer: Buffer): Buffer {
  if (buffer.length < 1) return buffer;
  let j = buffer.length - 1;
  let tmp = 0;
  for (let i = 0; i < buffer.length / 2; i++) {
    tmp = buffer[i];
    buffer[i] = buffer[j];
    buffer[j] = tmp;
    j--;
  }
  return buffer;
}

export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function amountToSatoshis(val: any) {
  const num = new BigNumber(val);
  return Number(num.multipliedBy(100000000).toFixed(8));
}
