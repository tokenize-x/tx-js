"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeWalletError = exports.toTxJsError = exports.TxJsError = void 0;
class TxJsError extends Error {
    constructor(thrower, cause, code = null) {
        const message = cause instanceof Error
            ? cause.message
            : typeof cause === "string"
                ? cause
                : "Unknown error";
        super(message);
        this.name = "TxJsError";
        this.thrower = thrower;
        this.code = code;
        if (cause instanceof Error && cause.stack) {
            this.stack = cause.stack;
        }
    }
}
exports.TxJsError = TxJsError;
function toTxJsError(thrower, error, code) {
    if (error instanceof TxJsError) {
        return error;
    }
    if (typeof error === "object" &&
        error !== null &&
        "error" in error) {
        const legacy = error;
        return new TxJsError(legacy.thrower ?? thrower, legacy.error, legacy.code ?? code ?? null);
    }
    return new TxJsError(thrower, error, code ?? null);
}
exports.toTxJsError = toTxJsError;
function normalizeWalletError(thrower, error) {
    if (error instanceof TxJsError) {
        return error;
    }
    const wrapped = toTxJsError(thrower, error);
    if (wrapped.message === "Extension not installed.") {
        return new TxJsError(thrower, wrapped.message, 4000);
    }
    if (["User rejected the request.", "Request rejected"].includes(wrapped.message)) {
        return new TxJsError(thrower, "Request rejected", 4001);
    }
    return wrapped;
}
exports.normalizeWalletError = normalizeWalletError;
