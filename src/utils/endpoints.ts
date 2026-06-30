export interface EndpointValidationOptions {
  /** Allow http:// and ws:// (intended for local development only). */
  allowInsecure?: boolean;
  /** Block localhost and private IP ranges (enabled automatically in Node.js). */
  blockPrivateHosts?: boolean;
}

const PRIVATE_IPV4_RANGES = [
  /^127\./,
  /^10\./,
  /^192\.168\./,
  /^169\.254\./,
  /^172\.(1[6-9]|2\d|3[01])\./,
  /^0\./,
];

function isNodeRuntime(): boolean {
  return (
    typeof process !== "undefined" &&
    typeof process.versions?.node === "string"
  );
}

function isPrivateOrLocalHost(hostname: string): boolean {
  const normalized = hostname.toLowerCase();

  if (
    normalized === "localhost" ||
    normalized.endsWith(".localhost") ||
    normalized === "::1" ||
    normalized === "[::1]"
  ) {
    return true;
  }

  if (normalized.includes(":")) {
    return normalized.startsWith("fc") || normalized.startsWith("fd");
  }

  return PRIVATE_IPV4_RANGES.some((pattern) => pattern.test(normalized));
}

function assertAllowedHost(
  hostname: string,
  options?: EndpointValidationOptions
): void {
  const shouldBlockPrivate =
    options?.blockPrivateHosts ?? isNodeRuntime();

  if (shouldBlockPrivate && isPrivateOrLocalHost(hostname)) {
    throw new Error(
      `Endpoint host "${hostname}" is not allowed in this environment`
    );
  }
}

export function validateRpcEndpoint(
  url: string,
  options?: EndpointValidationOptions
): string {
  let parsed: URL;

  try {
    parsed = new URL(url);
  } catch {
    throw new Error(`Invalid RPC endpoint URL: ${url}`);
  }

  const allowedSchemes = options?.allowInsecure
    ? ["http:", "https:"]
    : ["https:"];

  if (!allowedSchemes.includes(parsed.protocol)) {
    throw new Error(
      `RPC endpoint must use ${allowedSchemes.join(" or ")} (got ${parsed.protocol})`
    );
  }

  assertAllowedHost(parsed.hostname, options);
  return url;
}

export function validateWsEndpoint(
  url: string,
  options?: EndpointValidationOptions
): string {
  let parsed: URL;

  try {
    parsed = new URL(url);
  } catch {
    throw new Error(`Invalid WebSocket endpoint URL: ${url}`);
  }

  const allowedSchemes = options?.allowInsecure
    ? ["ws:", "wss:"]
    : ["wss:"];

  if (!allowedSchemes.includes(parsed.protocol)) {
    throw new Error(
      `WebSocket endpoint must use ${allowedSchemes.join(" or ")} (got ${parsed.protocol})`
    );
  }

  assertAllowedHost(parsed.hostname, options);
  return url;
}
