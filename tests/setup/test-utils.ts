import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach, beforeAll, afterAll } from 'vitest'
import { setupServer } from 'msw/node'

// Clean up after each test
afterEach(() => {
  cleanup()
})

// MSW server setup
export const server = setupServer()

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterAll(() => server.close())
afterEach(() => server.resetHandlers())

export { render, screen, fireEvent, waitFor } from '@testing-library/react' 