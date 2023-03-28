export function getRandomEthereumAddress(): string {
  const length = 40;
  const number: string = [...Array(length)]
    .map(() => {
      return Math.floor(Math.random() * 16).toString(16);
    })
    .join("");
  return `0x${number}`;
}
