"use strict";
exports.__esModule = true;
exports.generateInscriptionId = exports.generateTransactionId = exports.unpadHexString = exports.padHexString = exports.toXOnly = exports.getBtcNetwork = exports.sleep = exports.toYachtOutputScript = exports.reverseBuffer = void 0;
var bitcoinjs_lib_1 = require("bitcoinjs-lib");
var env_1 = require("./env");
var bitcoin = require("bitcoinjs-lib");
/* eslint-disable no-param-reassign */
function reverseBuffer(buffer) {
    if (buffer.length < 1)
        return buffer;
    var j = buffer.length - 1;
    var tmp = 0;
    for (var i = 0; i < buffer.length / 2; i++) {
        tmp = buffer[i];
        buffer[i] = buffer[j];
        buffer[j] = tmp;
        j--;
    }
    return buffer;
}
exports.reverseBuffer = reverseBuffer;
function toYachtOutputScript(address) {
    return bitcoin.address.toOutputScript(address, process.env.NODE_ENV === "test"
        ? bitcoin.networks.regtest
        : bitcoin.networks.bitcoin);
}
exports.toYachtOutputScript = toYachtOutputScript;
function sleep(ms) {
    return new Promise(function (resolve) { return setTimeout(resolve, ms); });
}
exports.sleep = sleep;
function getBtcNetwork() {
    var network = (0, env_1.readBtcNetworkEnv)();
    switch (network) {
        case "testnet":
            return bitcoinjs_lib_1.networks.testnet;
        case "regtest":
            return bitcoinjs_lib_1.networks.regtest;
        default:
            return bitcoinjs_lib_1.networks.bitcoin;
    }
}
exports.getBtcNetwork = getBtcNetwork;
var toXOnly = function (pubKey) {
    return pubKey.length === 32 ? pubKey : pubKey.slice(1, 33);
};
exports.toXOnly = toXOnly;
function padHexString(hexString) {
    return hexString.length % 2 === 0 ? hexString : "0" + hexString;
}
exports.padHexString = padHexString;
function unpadHexString(buffer) {
    // Convert buffer to hex string
    var hexString = buffer.toString("hex");
    // Length of hexString should be even (due to padding) and be split equally into r and s
    if (hexString.length % 2 !== 0 || hexString.length % 4 !== 0) {
        throw new Error("Invalid hex string length");
    }
    var elementLength = hexString.length / 2;
    var r = hexString.substring(0, elementLength);
    var s = hexString.substring(elementLength);
    return { r: r, s: s };
}
exports.unpadHexString = unpadHexString;
function getRandomHexNumber(numChars) {
    var result = "";
    var characters = "abcdef0123456789";
    for (var i = 0; i < numChars; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}
function generateTransactionId() {
    return getRandomHexNumber(64); // a Bitcoin transaction ID is a 64-character hexadecimal string
}
exports.generateTransactionId = generateTransactionId;
function generateInscriptionId() {
    var txId = generateTransactionId(); // a Bitcoin transaction ID is a 64-character hexadecimal string
    var n = Math.floor(Math.random() * 10); // a random number between 0 and 9 inclusive
    return "".concat(txId, "i").concat(n);
}
exports.generateInscriptionId = generateInscriptionId;
