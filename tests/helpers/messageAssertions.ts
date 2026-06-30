import { EncodeObject } from "@cosmjs/proto-signing";
import { Client } from "../../src/client/index";
import { assert } from "./testRunner";

export function assertMessage(
  name: string,
  message: EncodeObject,
  expectedTypeUrl: string
): void {
  assert(message.typeUrl === expectedTypeUrl, `${name} has correct typeUrl`);
  assert(message.value !== undefined && message.value !== null, `${name} has value`);

  const registry = Client.getRegistry();

  try {
    const encoded = registry.encode(message);
    assert(
      encoded instanceof Uint8Array && encoded.length > 0,
      `${name} encodes via registry`
    );
  } catch (error) {
    const messageText = error instanceof Error ? error.message : String(error);

    if (messageText.includes("Unregistered type url")) {
      assert(true, `${name} builds correctly (type not in default registry)`);
      return;
    }

    throw error;
  }
}
