"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.unitToSubunit = exports.subunitToUnit = exports.parseFloatToRoyaltyRate = exports.coreToUCORE = exports.ucoreToCORE = void 0;
const bignumber_js_1 = __importDefault(require("bignumber.js"));
function assertValidAmount(value, fieldName) {
    const amount = new bignumber_js_1.default(value);
    if (!amount.isFinite() || amount.isNaN()) {
        throw new Error(`Invalid ${fieldName}: ${value}`);
    }
    if (amount.isNegative()) {
        throw new Error(`${fieldName} must be non-negative`);
    }
    return amount;
}
function assertValidPrecision(precision, fieldName) {
    if (!Number.isInteger(precision) || precision < 0 || precision > 18) {
        throw new Error(`${fieldName} must be an integer between 0 and 18`);
    }
}
/**
 * @param ucore ucore to convert to CORE
 * @returns A string representing CORE value of ucore
 */
const ucoreToCORE = (ucore) => {
    return assertValidAmount(ucore, "ucore").dividedBy(1000000).valueOf();
};
exports.ucoreToCORE = ucoreToCORE;
/**
 * @param core CORE to convert to ucore
 * @returns A string representing ucore value of CORE
 */
const coreToUCORE = (core) => {
    return assertValidAmount(core, "core").multipliedBy(1000000).valueOf();
};
exports.coreToUCORE = coreToUCORE;
/**
 * @param royalty Float to convert to royalty rate format
 * @returns a string representing the float passed in royalty rate format
 */
const parseFloatToRoyaltyRate = (royalty) => {
    const float = new bignumber_js_1.default(royalty);
    if (!float.isFinite() || float.isNaN() || float.isNegative()) {
        throw new Error(`Invalid royalty value: ${royalty}`);
    }
    return float.dividedBy(100).multipliedBy("1000000000000000000").toString();
};
exports.parseFloatToRoyaltyRate = parseFloatToRoyaltyRate;
/**
 *
 * @param subunit Amount of the subunit of the token to parse into full unit
 * @param precision The precision of the token; number of decimals
 * @returns The converted subunit to Unit with the passed precision
 */
const subunitToUnit = (subunit, precision) => {
    assertValidPrecision(precision, "precision");
    const precisionFactor = new bignumber_js_1.default(10).exponentiatedBy(precision);
    return assertValidAmount(subunit, "subunit")
        .dividedBy(precisionFactor)
        .toString();
};
exports.subunitToUnit = subunitToUnit;
/**
 *
 * @param unit Amount of the unit of the token to parse into its subunit
 * @param precision The precision of the token; number of decimals
 * @returns The converted unit to subunit with the passed precision
 */
const unitToSubunit = (unit, precision) => {
    assertValidPrecision(precision, "precision");
    const precisionFactor = new bignumber_js_1.default(10).exponentiatedBy(precision);
    return assertValidAmount(unit, "unit")
        .multipliedBy(precisionFactor)
        .toString();
};
exports.unitToSubunit = unitToSubunit;
