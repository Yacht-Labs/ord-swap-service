"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
exports.__esModule = true;
exports.generateEthereumAddress = void 0;
function generateEthereumAddress() {
    var length = 40;
    var number = __spreadArray([], Array(length), true).map(function () {
        return Math.floor(Math.random() * 16).toString(16);
    })
        .join("");
    return "0x".concat(number);
}
exports.generateEthereumAddress = generateEthereumAddress;
