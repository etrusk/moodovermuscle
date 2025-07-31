export async function setupIntegrationTest() {
  // No-op for now, can be extended later
}

export async function teardownIntegrationTest() {
  // No-op for now, can be extended later
}

export async function waitFor<T>(
  fn: () => Promise<T>,
  { timeout = 15000, interval = 100 } = {}
): Promise<T> {
  const startTime = Date.now()
  while (Date.now() - startTime < timeout) {
    try {
      const result = await fn()
      if (result) return result
    } catch (e) {
      // Ignore errors and retry
    }
    await new Promise(resolve => setTimeout(resolve, interval))
  }
  throw new Error('Timed out waiting for condition.')
}