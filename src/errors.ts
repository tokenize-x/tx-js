export class TxJsError extends Error {
  readonly thrower: string;
  readonly code: number | null;

  constructor(thrower: string, cause: unknown, code: number | null = null) {
    const message =
      cause instanceof Error
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

export function toTxJsError(
  thrower: string,
  error: unknown,
  code?: number | null
): TxJsError {
  if (error instanceof TxJsError) {
    return error;
  }

  if (
    typeof error === "object" &&
    error !== null &&
    "error" in error
  ) {
    const legacy = error as {
      thrower?: string;
      error: unknown;
      code?: number | null;
    };
    return new TxJsError(
      legacy.thrower ?? thrower,
      legacy.error,
      legacy.code ?? code ?? null
    );
  }

  return new TxJsError(thrower, error, code ?? null);
}

export function normalizeWalletError(
  thrower: string,
  error: unknown
): TxJsError {
  if (error instanceof TxJsError) {
    return error;
  }

  const wrapped = toTxJsError(thrower, error);

  if (wrapped.message === "Extension not installed.") {
    return new TxJsError(thrower, wrapped.message, 4000);
  }

  if (
    ["User rejected the request.", "Request rejected"].includes(wrapped.message)
  ) {
    return new TxJsError(thrower, "Request rejected", 4001);
  }

  return wrapped;
}
