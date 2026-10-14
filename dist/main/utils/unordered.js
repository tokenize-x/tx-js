"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assertUnorderedTimeout = exports.UnorderedTimeoutClock = exports.encodeUnorderedTxBody = exports.UNORDERED_TX_GAS_COST = exports.DEFAULT_UNORDERED_TIMEOUT_MS = exports.MAX_UNORDERED_TIMEOUT_MS = void 0;
const binary_1 = require("cosmjs-types/binary");
const timestamp_1 = require("cosmjs-types/google/protobuf/timestamp");
const tx_1 = require("cosmjs-types/cosmos/tx/v1beta1/tx");
/**
 * Longest TTL TX accepts for an unordered transaction: Cosmos SDK v0.53
 * `DefaultMaxTimeoutDuration`, which TX wires in `app/app.go`.
 */
exports.MAX_UNORDERED_TIMEOUT_MS = 10 * 60 * 1000;
/**
 * Default TTL for an unordered transaction. Well under the chain maximum, so a client
 * clock a few minutes ahead of block time is still accepted.
 */
exports.DEFAULT_UNORDERED_TIMEOUT_MS = 5 * 60 * 1000;
/** Extra gas TX charges an unordered transaction (Cosmos SDK `DefaultUnorderedTxGasCost`). */
exports.UNORDERED_TX_GAS_COST = 2240;
const NANOS_PER_MILLISECOND = BigInt(1000000);
const NANOS_PER_SECOND = BigInt(1000000000);
// TxBody field numbers added in Cosmos SDK v0.53. cosmjs-types 0.9, which cosmjs 0.33
// depends on, predates them, so they are appended here rather than through its codec.
const UNORDERED_FIELD_TAG = (4 << 3) | 0;
const TIMEOUT_TIMESTAMP_FIELD_TAG = (5 << 3) | 2;
/**
 * Encodes a TxBody with `unordered = true` and `timeout_timestamp` set.
 *
 * The fields are appended after `messages`, `memo` and `timeout_height`, which keeps the
 * encoding in ascending field order because extension options are never set here.
 */
function encodeUnorderedTxBody(body) {
    if (body.timeoutTimestampNanos <= BigInt(0)) {
        throw new Error("Unordered transaction needs a positive timeout timestamp");
    }
    const writer = binary_1.BinaryWriter.create();
    tx_1.TxBody.encode(tx_1.TxBody.fromPartial({
        messages: [...body.messages],
        memo: body.memo,
        timeoutHeight: BigInt(0),
    }), writer);
    writer.uint32(UNORDERED_FIELD_TAG).bool(true);
    timestamp_1.Timestamp.encode({
        seconds: body.timeoutTimestampNanos / NANOS_PER_SECOND,
        nanos: Number(body.timeoutTimestampNanos % NANOS_PER_SECOND),
    }, writer.uint32(TIMEOUT_TIMESTAMP_FIELD_TAG).fork()).ldelim();
    return writer.finish();
}
exports.encodeUnorderedTxBody = encodeUnorderedTxBody;
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
class UnorderedTimeoutClock {
    constructor(offsetNanos = Math.floor(Math.random() * 1000000)) {
        this._lastNanos = BigInt(0);
        if (!Number.isInteger(offsetNanos) || offsetNanos < 0 || offsetNanos >= 1000000) {
            throw new Error(`Timeout offset must be an integer in [0, 1000000) ns, got ${offsetNanos}`);
        }
        this._offsetNanos = BigInt(offsetNanos);
    }
    next(nowMs, timeoutMs = exports.DEFAULT_UNORDERED_TIMEOUT_MS) {
        assertUnorderedTimeout(timeoutMs);
        const candidate = (BigInt(nowMs) + BigInt(timeoutMs)) * NANOS_PER_MILLISECOND + this._offsetNanos;
        this._lastNanos =
            candidate > this._lastNanos ? candidate : this._lastNanos + BigInt(1);
        return this._lastNanos;
    }
}
exports.UnorderedTimeoutClock = UnorderedTimeoutClock;
/** Rejects a TTL the chain would refuse: not positive, or above the 10-minute maximum. */
function assertUnorderedTimeout(timeoutMs) {
    if (!Number.isInteger(timeoutMs) || timeoutMs <= 0) {
        throw new Error(`Unordered timeout must be a positive integer of milliseconds, got ${timeoutMs}`);
    }
    if (timeoutMs > exports.MAX_UNORDERED_TIMEOUT_MS) {
        throw new Error(`Unordered timeout ${timeoutMs}ms exceeds the chain maximum of ${exports.MAX_UNORDERED_TIMEOUT_MS}ms`);
    }
}
exports.assertUnorderedTimeout = assertUnorderedTimeout;
