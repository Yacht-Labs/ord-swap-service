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

export function readAlchemyKey(): string {
  return readStringEnv("ALCHEMY_API_KEY");
}

export function readPortNumber(): number {
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

export function readBtcNetworkEnv(): string {
  return readStringEnv("BTC_NETWORK");
}

export function isDevelopment(): boolean {
  return readStringEnv("NODE_ENV") === "development";
}
