"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateWsEndpoint = exports.validateRpcEndpoint = void 0;
const PRIVATE_IPV4_RANGES = [
    /^127\./,
    /^10\./,
    /^192\.168\./,
    /^169\.254\./,
    /^172\.(1[6-9]|2\d|3[01])\./,
    /^0\./,
];
function isNodeRuntime() {
    return (typeof process !== "undefined" &&
        typeof process.versions?.node === "string");
}
function isPrivateOrLocalHost(hostname) {
    const normalized = hostname.toLowerCase();
    if (normalized === "localhost" ||
        normalized.endsWith(".localhost") ||
        normalized === "::1" ||
        normalized === "[::1]") {
        return true;
    }
    if (normalized.includes(":")) {
        return normalized.startsWith("fc") || normalized.startsWith("fd");
    }
    return PRIVATE_IPV4_RANGES.some((pattern) => pattern.test(normalized));
}
function assertAllowedHost(hostname, options) {
    const shouldBlockPrivate = options?.blockPrivateHosts ?? isNodeRuntime();
    if (shouldBlockPrivate && isPrivateOrLocalHost(hostname)) {
        throw new Error(`Endpoint host "${hostname}" is not allowed in this environment`);
    }
}
function validateRpcEndpoint(url, options) {
    let parsed;
    try {
        parsed = new URL(url);
    }
    catch {
        throw new Error(`Invalid RPC endpoint URL: ${url}`);
    }
    const allowedSchemes = options?.allowInsecure
        ? ["http:", "https:"]
        : ["https:"];
    if (!allowedSchemes.includes(parsed.protocol)) {
        throw new Error(`RPC endpoint must use ${allowedSchemes.join(" or ")} (got ${parsed.protocol})`);
    }
    assertAllowedHost(parsed.hostname, options);
    return url;
}
exports.validateRpcEndpoint = validateRpcEndpoint;
function validateWsEndpoint(url, options) {
    let parsed;
    try {
        parsed = new URL(url);
    }
    catch {
        throw new Error(`Invalid WebSocket endpoint URL: ${url}`);
    }
    const allowedSchemes = options?.allowInsecure
        ? ["ws:", "wss:"]
        : ["wss:"];
    if (!allowedSchemes.includes(parsed.protocol)) {
        throw new Error(`WebSocket endpoint must use ${allowedSchemes.join(" or ")} (got ${parsed.protocol})`);
    }
    assertAllowedHost(parsed.hostname, options);
    return url;
}
exports.validateWsEndpoint = validateWsEndpoint;
