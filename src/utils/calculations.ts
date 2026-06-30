import BigNumber from "bignumber.js";

function assertValidAmount(value: string, fieldName: string): BigNumber {
  const amount = new BigNumber(value);

  if (!amount.isFinite() || amount.isNaN()) {
    throw new Error(`Invalid ${fieldName}: ${value}`);
  }

  if (amount.isNegative()) {
    throw new Error(`${fieldName} must be non-negative`);
  }

  return amount;
}

function assertValidPrecision(precision: number, fieldName: string): void {
  if (!Number.isInteger(precision) || precision < 0 || precision > 18) {
    throw new Error(`${fieldName} must be an integer between 0 and 18`);
  }
}

/**
 * @param ucore ucore to convert to CORE
 * @returns A string representing CORE value of ucore
 */
export const ucoreToCORE = (ucore: string) => {
  return assertValidAmount(ucore, "ucore").dividedBy(1000000).valueOf();
};

/**
 * @param core CORE to convert to ucore
 * @returns A string representing ucore value of CORE
 */
export const coreToUCORE = (core: string) => {
  return assertValidAmount(core, "core").multipliedBy(1000000).valueOf();
};

/**
 * @param royalty Float to convert to royalty rate format
 * @returns a string representing the float passed in royalty rate format
 */
export const parseFloatToRoyaltyRate = (royalty: number | string) => {
  const float = new BigNumber(royalty);

  if (!float.isFinite() || float.isNaN() || float.isNegative()) {
    throw new Error(`Invalid royalty value: ${royalty}`);
  }

  return float.dividedBy(100).multipliedBy("1000000000000000000").toString();
};

/**
 *
 * @param subunit Amount of the subunit of the token to parse into full unit
 * @param precision The precision of the token; number of decimals
 * @returns The converted subunit to Unit with the passed precision
 */
export const subunitToUnit = (subunit: string, precision: number) => {
  assertValidPrecision(precision, "precision");
  const precisionFactor = new BigNumber(10).exponentiatedBy(precision);
  return assertValidAmount(subunit, "subunit")
    .dividedBy(precisionFactor)
    .toString();
};

/**
 *
 * @param unit Amount of the unit of the token to parse into its subunit
 * @param precision The precision of the token; number of decimals
 * @returns The converted unit to subunit with the passed precision
 */
export const unitToSubunit = (unit: string, precision: number) => {
  assertValidPrecision(precision, "precision");
  const precisionFactor = new BigNumber(10).exponentiatedBy(precision);
  return assertValidAmount(unit, "unit")
    .multipliedBy(precisionFactor)
    .toString();
};
