import type { FullConfig } from '@playwright/test'

async function globalSetup(config: FullConfig) {
  // Setup will be handled by individual tests
}

export default globalSetup 