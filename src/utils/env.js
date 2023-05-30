"use strict";
exports.__esModule = true;
exports.isDevelopment = exports.readGoerliRpcUrlEnv = exports.readGoerliPrivateKey2 = exports.readGoerliPrivateKey = exports.readBtcNetworkEnv = exports.readMumbaiRpcUrlEnv = exports.readPKPPrivateKey = exports.readLitRpcURL = exports.readPortNumber = exports.readAlchemyKey = exports.readEthNetwork = exports.readBitcoinNetwork = exports.readBooleanEnv = exports.readNumberEnv = exports.readStringEnv = exports.checkEnvVar = void 0;
function checkEnvVar(name) {
    var value = process.env[name];
    return value !== undefined;
}
exports.checkEnvVar = checkEnvVar;
function readStringEnv(name) {
    var value = process.env[name];
    if (value === undefined) {
        throw new Error("Environment variable ".concat(name, " is not defined"));
    }
    return value;
}
exports.readStringEnv = readStringEnv;
function readNumberEnv(name) {
    var value = readStringEnv(name);
    var number = parseInt(value, 10);
    if (Number.isNaN(number)) {
        throw new Error("Environment variable ".concat(name, " is not a number"));
    }
    return number;
}
exports.readNumberEnv = readNumberEnv;
function readBooleanEnv(name) {
    var value = readStringEnv(name);
    if (value === "true") {
        return true;
    }
    if (value === "false") {
        return false;
    }
    throw new Error("Environment variable ".concat(name, " is not a boolean"));
}
exports.readBooleanEnv = readBooleanEnv;
function readBitcoinNetwork() {
    try {
        return readStringEnv("BTC_NETWORK");
    }
    catch (err) {
        return "MAINNET";
    }
}
exports.readBitcoinNetwork = readBitcoinNetwork;
function readEthNetwork() {
    try {
        return readStringEnv("ETH_NETWORK");
    }
    catch (err) {
        return "MAINNET";
    }
}
exports.readEthNetwork = readEthNetwork;
function readAlchemyKey() {
    return readStringEnv("ALCHEMY_API_KEY");
}
exports.readAlchemyKey = readAlchemyKey;
function readPortNumber() {
    return readNumberEnv("PORT");
}
exports.readPortNumber = readPortNumber;
function readLitRpcURL() {
    return readStringEnv("LIT_RPC_PROVIDER_URL");
}
exports.readLitRpcURL = readLitRpcURL;
// function to read env var MUMBAI_PRIVATE_KEY
function readPKPPrivateKey() {
    return readStringEnv("PKP_GENERATOR_PRIVATE_KEY");
}
exports.readPKPPrivateKey = readPKPPrivateKey;
// function to read env var MUMBAI_RPC_URL
function readMumbaiRpcUrlEnv() {
    return readStringEnv("MUMBAI_RPC_URL");
}
exports.readMumbaiRpcUrlEnv = readMumbaiRpcUrlEnv;
function readBtcNetworkEnv() {
    return readStringEnv("BTC_NETWORK");
}
exports.readBtcNetworkEnv = readBtcNetworkEnv;
function readGoerliPrivateKey() {
    return readStringEnv("GOERLI_PRIVATE_KEY");
}
exports.readGoerliPrivateKey = readGoerliPrivateKey;
function readGoerliPrivateKey2() {
    return readStringEnv("GOERLI_PRIVATE_KEY_2");
}
exports.readGoerliPrivateKey2 = readGoerliPrivateKey2;
function readGoerliRpcUrlEnv() {
    return readStringEnv("GOERLI_RPC_URL");
}
exports.readGoerliRpcUrlEnv = readGoerliRpcUrlEnv;
function isDevelopment() {
    return readStringEnv("NODE_ENV") === "development";
}
exports.isDevelopment = isDevelopment;
