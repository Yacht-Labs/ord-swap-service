"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HiroOrdinalService = void 0;
const UtxoService_1 = require("../UtxoService/UtxoService");
class HiroOrdinalService {
    inscriptionIdOrNumber;
    baseUrl = "https://api.hiro.so";
    utxoService = new UtxoService_1.UtxoService();
    inscriptionPath = "/ordinals/v1/inscription";
    constructor(inscriptionIdOrNumber) {
        this.inscriptionIdOrNumber = inscriptionIdOrNumber;
    }
    getInscriptionDetails = async () => {
        const inscriptionRegex = /^[a-fA-F0-9]{64}i[0-9]+$/;
        const numberRegex = /^[0-9]+$/;
        if (!inscriptionRegex.test(this.inscriptionIdOrNumber) &&
            !numberRegex.test(this.inscriptionIdOrNumber)) {
            throw new Error(`Invalid Inscription idOrNumber: ${this.inscriptionIdOrNumber}`);
        }
        try {
            const response = await fetch(`${this.baseUrl}${this.inscriptionPath}/${this.inscriptionIdOrNumber}`);
            const inscriptionResponse = await response.json();
            if (inscriptionResponse.error ||
                inscriptionResponse.status !== "success") {
                throw new Error(inscriptionResponse.error);
            }
            // check some properties of the inscription to make sure its real
            if (!inscriptionResponse.id ||
                !inscriptionResponse.number ||
                !inscriptionResponse.address ||
                !inscriptionResponse.location) {
                throw new Error("Invalid Inscription Response");
            }
            return inscriptionResponse;
        }
        catch (err) {
            throw new Error(`Failed to retrieve inscription details: ${err.message}`);
        }
    };
    getInputs = async (address) => {
        const inscription = await this.getInscriptionDetails();
        const ownsInscription = inscription.address === address;
        // check that the address owns the inscription
        if (!ownsInscription) {
            throw new Error("The address does not own the inscription");
        }
        // get the utxos for the address
        const utxos = await this.utxoService.getUtxos(inscription.address);
        // check that there are two utxos
        if (utxos.length !== 2) {
            throw new Error("There are not two UTXOs in the address");
        }
        const [iTxHash, iVout, iOffset] = inscription.location.split(":");
        const ordinalUtxo = utxos.find((utxo) => {
            return utxo.txHash === iTxHash && utxo.vout === iVout;
        });
        const cardinalUtxo = utxos.find((utxo) => {
            return utxo.txHash !== iTxHash || utxo.vout !== iVout;
        });
        if (!ordinalUtxo || !cardinalUtxo) {
            throw new Error("Could not find the ordinal and cardinal UTXOs");
        }
        return {
            ordinalUtxo,
            cardinalUtxo,
        };
    };
}
exports.HiroOrdinalService = HiroOrdinalService;
//# sourceMappingURL=HiroOrdinalService.js.map