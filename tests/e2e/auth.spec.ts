import { test, expect } from '@playwright/test'

// Helper function to generate a random email
function generateRandomEmail() {
  const timestamp = Date.now()
  const random = Math.floor(Math.random() * 10000)
  return `test.${timestamp}.${random}@example.com`
}

test.describe('Authentication Flow', () => {
  test('should show validation errors on register form', async ({ page }) => {
    await page.goto('/auth/register')
    await page.waitForLoadState('networkidle')
    
    // Initially submit button should be disabled if the form is invalid
    const submitButton = page.getByRole('button', { name: 'Sign up' })
    await expect(submitButton).toBeDisabled()

    // Fill invalid data
    await page.getByLabel('Full name').fill('a')
    await page.keyboard.press('Tab')
    
    await page.getByLabel('Email address').fill('invalid-email')
    await page.keyboard.press('Tab')
    
    await page.getByPlaceholder('Enter your password').fill('short')
    await page.keyboard.press('Tab')
    
    await page.getByPlaceholder('Confirm your password').fill('different')
    await page.keyboard.press('Tab')

    // Check that the validation messages appear
    await expect(page.getByText('Name must be at least 2 characters')).toBeVisible({ timeout: 10000 })
    await expect(page.getByText('Please enter a valid email address')).toBeVisible({ timeout: 10000 })
    await expect(page.getByText('Password must be at least 8 characters')).toBeVisible({ timeout: 10000 })

    // Expect "Passwords don't match" since they are different
    await expect(page.getByText("Passwords don't match")).toBeVisible({ timeout: 10000 })

    // Check password requirement list
    const passwordRequirements = page.locator('.text-xs.text-gray-500 li')
    await expect(passwordRequirements.nth(0)).not.toHaveClass(/text-green-500/) // length >= 8
    await expect(passwordRequirements.nth(1)).not.toHaveClass(/text-green-500/) // uppercase
    await expect(passwordRequirements.nth(2)).not.toHaveClass(/text-green-500/) // number
    await expect(passwordRequirements.nth(3)).not.toHaveClass(/text-green-500/) // special char
  })

  test('should navigate between login and register pages', async ({ page }) => {
    // Start at register page
    await page.goto('/auth/register')
    await page.waitForLoadState('networkidle')
    
    // Go to login page
    await page.getByRole('link', { name: 'Sign in' }).click()
    await page.waitForURL('/auth/login')
    await page.waitForLoadState('networkidle')
    
    // Go back to register page
    await page.getByRole('link', { name: 'Sign up' }).click()
    await page.waitForURL('/auth/register')
    await page.waitForLoadState('networkidle')
  })

  test('registration and login flow', async ({ page }) => {
    // Generate a unique email for this test
    const testEmail = generateRandomEmail()

    // Register with valid data
    await page.goto('/auth/register')
    await page.waitForLoadState('networkidle')
    
    await page.getByLabel('Full name').fill('Test User')
    await page.getByLabel('Email address').fill(testEmail)
    await page.getByPlaceholder('Enter your password').fill('TestPass123!')
    await page.getByPlaceholder('Confirm your password').fill('TestPass123!')
    
    // Trigger validation by blurring the last field
    await page.keyboard.press('Tab')
    
    // Button should become enabled
    const submitButton = page.getByRole('button', { name: 'Sign up' })
    await expect(submitButton).toBeEnabled({ timeout: 10000 })
    
    // Submit registration and wait for response
    await Promise.all([
      page.waitForResponse(
        response => response.url().includes('/api/auth/register') && response.status() === 201
      ),
      submitButton.click()
    ])
    
    // Wait for redirect
    await page.waitForURL('/auth/login')
    await page.waitForLoadState('networkidle')
    
    // Login
    await page.getByLabel('Email address').fill(testEmail)
    await page.getByPlaceholder('Enter your password').fill('TestPass123!')
    
    // Submit login and wait for response
    const loginButton = page.getByRole('button', { name: 'Sign in' })
    await Promise.all([
      page.waitForResponse(
        response => response.url().includes('/api/auth/login') && response.status() === 200
      ),
      loginButton.click()
    ])
    
    // Wait for redirect to homepage
    await page.waitForURL('/')
  })

  test('login validation', async ({ page }) => {
    await page.goto('/auth/login')
    await page.waitForLoadState('networkidle')
    
    // Fill invalid data
    await page.getByLabel('Email address').fill('invalid-email')
    await page.keyboard.press('Tab')
    
    await page.getByPlaceholder('Enter your password').fill('short')
    await page.keyboard.press('Tab')
    
    // Wait for and verify error messages
    await expect(page.getByText('Please enter a valid email address')).toBeVisible({ timeout: 10000 })
    await expect(page.getByText('Password must be at least 8 characters')).toBeVisible({ timeout: 10000 })
    
    // Check that labels are also red
    await expect(page.getByText('Email address').first()).toHaveClass(/text-red-500/)
    await expect(page.getByText('Password').first()).toHaveClass(/text-red-500/)
  })

  test('protected routes redirect to login', async ({ page }) => {
    // Try to access protected route
    await page.goto('/dashboard')
    await page.waitForURL('/auth/login')
    await page.waitForLoadState('networkidle')
  })
}) 