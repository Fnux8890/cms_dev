import { render as testingLibraryRender, screen, fireEvent, waitFor, cleanup } from '@testing-library/react'
import type { RenderOptions } from '@testing-library/react'
import { ReactElement } from 'react'
import { afterEach, beforeAll, afterAll, vi } from 'vitest'
import '@testing-library/jest-dom/vitest'
import { setupServer } from 'msw/node'

// Add global variables to the test environment
globalThis.vi = vi

// Clean up after each test
afterEach(() => {
  cleanup()
})

// MSW server setup
export const server = setupServer()

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterAll(() => server.close())
afterEach(() => server.resetHandlers())

// Export testing utilities
export { screen, fireEvent, waitFor }

// Override render method
export function render(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) {
  return testingLibraryRender(ui, { ...options })
}