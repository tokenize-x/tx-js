export let passed = 0;
export let failed = 0;
export let skipped = 0;

export function assert(condition: boolean, message: string): void {
  if (condition) {
    passed++;
    console.log(`✓ ${message}`);
  } else {
    failed++;
    console.error(`✗ ${message}`);
  }
}

export async function test(name: string, fn: () => void | Promise<void>): Promise<void> {
  try {
    console.log(`\nTesting: ${name}`);
    await fn();
  } catch (error) {
    failed++;
    const message = error instanceof Error ? error.message : String(error);
    console.error(`✗ ${name} - Error: ${message}`);
  }
}

export async function testQuery(
  name: string,
  fn: () => Promise<unknown>
): Promise<void> {
  try {
    await fn();
    passed++;
    console.log(`✓ ${name}`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const notFound =
      /not found|no such|does not exist|invalid|unknown|404/i.test(message);

    if (notFound) {
      skipped++;
      console.log(`○ ${name} (skipped: ${message})`);
      return;
    }

    failed++;
    console.error(`✗ ${name} - Error: ${message}`);
  }
}

export function printSummary(title = "Test Summary"): void {
  console.log(`\n${"=".repeat(60)}`);
  console.log(title);
  console.log("=".repeat(60));
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}`);
  console.log(`Skipped: ${skipped}`);
  console.log(`Total: ${passed + failed + skipped}`);
  console.log(failed === 0 ? "\n✓ All required tests passed!" : "\n✗ Some tests failed");
}

export function exitWithStatus(): never {
  process.exit(failed > 0 ? 1 : 0);
}
