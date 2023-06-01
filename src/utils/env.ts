import { BITCOIN_NETWORKS } from "./btc";

export function checkEnvVar(name: string): boolean {
  const value = process.env[name];
  return value !== undefined;
}

export function readStringEnv(name: string): string {
  const value = process.env[name];
  if (value === undefined) {
    throw new Error(`Environment variable ${name} is not defined`);
  }
  return value;
}

export function readNumberEnv(name: string): number {
  const value = readStringEnv(name);
  const number = parseInt(value, 10);
  if (Number.isNaN(number)) {
    throw new Error(`Environment variable ${name} is not a number`);
  }
  return number;
}

export function readBooleanEnv(name: string): boolean {
  const value = readStringEnv(name);
  if (value === "true") {
    return true;
  }
  if (value === "false") {
    return false;
  }
  throw new Error(`Environment variable ${name} is not a boolean`);
}

export function readEthNetwork() {
  try {
    return readStringEnv("ETH_NETWORK");
  } catch (err) {
    return "MAINNET";
  }
}

export function readAlchemyKey(): string {
  return readStringEnv("ALCHEMY_API_KEY");
}

export function readServerPort(): number {
  return readNumberEnv("PORT");
}

export function readLitRpcURL(): string {
  return readStringEnv("LIT_RPC_PROVIDER_URL");
}

// function to read env var MUMBAI_PRIVATE_KEY
export function readPKPPrivateKey(): string {
  return readStringEnv("PKP_GENERATOR_PRIVATE_KEY");
}

// function to read env var MUMBAI_RPC_URL
export function readMumbaiRpcUrlEnv(): string {
  return readStringEnv("MUMBAI_RPC_URL");
}

export function readGoerliPrivateKey(): string {
  return readStringEnv("GOERLI_PRIVATE_KEY");
}

export function readGoerliPrivateKey2(): string {
  return readStringEnv("GOERLI_PRIVATE_KEY_2");
}

export function readGoerliPrivateKey3(): string {
  return readStringEnv("GOERLI_PRIVATE_KEY_3");
}

export function readGoerliRpcUrlEnv(): string {
  return readStringEnv("GOERLI_RPC_URL");
}

export function isDevelopment(): boolean {
  return (
    readStringEnv("NODE_ENV") === "development" ||
    readStringEnv("NODE_ENV") === "dev"
  );
}

export function isProduction(): boolean {
  return readStringEnv("NODE_ENV") === "production";
}

export function isTest(): boolean {
  return readStringEnv("NODE_ENV") === "test";
}

export function isLocal(): boolean {
  return isTest() || isDevelopment();
}

export function readBtcNetwork(): string {
  const network = readStringEnv("BTC_NETWORK").toLowerCase();
  if (!(network.toUpperCase() in BITCOIN_NETWORKS)) {
    throw new Error(`Invalid bitcoin network: ${network}`);
  }
  return network;
}
