import { Any } from "cosmjs-types/google/protobuf/any";
/**
 * Longest TTL TX accepts for an unordered transaction: Cosmos SDK v0.53
 * `DefaultMaxTimeoutDuration`, which TX wires in `app/app.go`.
 */
export declare const MAX_UNORDERED_TIMEOUT_MS: number;
/**
 * Default TTL for an unordered transaction. Well under the chain maximum, so a client
 * clock a few minutes ahead of block time is still accepted.
 */
export declare const DEFAULT_UNORDERED_TIMEOUT_MS: number;
/** Extra gas TX charges an unordered transaction (Cosmos SDK `DefaultUnorderedTxGasCost`). */
export declare const UNORDERED_TX_GAS_COST = 2240;
export interface UnorderedTxBody {
    readonly messages: readonly Any[];
    readonly memo: string;
    /** Unix time in nanoseconds after which the chain rejects the transaction. */
    readonly timeoutTimestampNanos: bigint;
}
/**
 * Encodes a TxBody with `unordered = true` and `timeout_timestamp` set.
 *
 * The fields are appended after `messages`, `memo` and `timeout_height`, which keeps the
 * encoding in ascending field order because extension options are never set here.
 */
export declare function encodeUnorderedTxBody(body: UnorderedTxBody): Uint8Array;
/**
 * Issues timeout timestamps for unordered transactions from one signer.
 *
 * TX uses (signer, timeout_timestamp) as the replay key of an unordered transaction, so two
 * transactions from the same signer with the same timeout collide. Each call returns a
 * timeout at least one nanosecond after the previous one, even within one millisecond.
 *
 * `offsetNanos` (random by default) places this clock's timeouts at a sub-millisecond offset,
 * so two clocks signing for one account in the same millisecond, such as two processes
 * sharing a key, are unlikely to pick the same timeout.
 */
export declare class UnorderedTimeoutClock {
    private _lastNanos;
    private readonly _offsetNanos;
    constructor(offsetNanos?: number);
    next(nowMs: number, timeoutMs?: number): bigint;
}
/** Rejects a TTL the chain would refuse: not positive, or above the 10-minute maximum. */
export declare function assertUnorderedTimeout(timeoutMs: number): void;
