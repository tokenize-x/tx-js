export declare class TxJsError extends Error {
    readonly thrower: string;
    readonly code: number | null;
    constructor(thrower: string, cause: unknown, code?: number | null);
}
export declare function toTxJsError(thrower: string, error: unknown, code?: number | null): TxJsError;
export declare function normalizeWalletError(thrower: string, error: unknown): TxJsError;
