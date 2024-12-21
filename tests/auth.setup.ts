import { test as setup } from '@playwright/test'
import { fileURLToPath } from 'url'

const authFile = fileURLToPath(new URL('../playwright/.auth/user.json', import.meta.url))

setup('authenticate', async ({ page }) => {
  // Register a test user
  await page.goto('/auth/register')
  await page.fill('input[name="name"]', 'Test User')
  await page.fill('input[name="email"]', 'test@example.com')
  await page.fill('input[name="password"]', 'TestPass123!')
  await page.fill('input[name="confirmPassword"]', 'TestPass123!')
  await page.click('button[type="submit"]')
  await page.waitForURL('/auth/login')

  // Login
  await page.fill('input[name="email"]', 'test@example.com')
  await page.fill('input[name="password"]', 'TestPass123!')
  await page.click('button[type="submit"]')
  await page.waitForURL('/')

  // Save signed-in state
  await page.context().storageState({ path: authFile })
}) 