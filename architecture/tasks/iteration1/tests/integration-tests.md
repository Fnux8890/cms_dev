# Integration Tests

## Test Environment

1. **Testing Tools**
   - Playwright for end-to-end testing
   - MSW for API mocking
   - Custom test database for auth testing

2. **Test Structure**
   ```
   tests/
   ├── e2e/
   │   ├── auth.spec.ts
   │   ├── contact.spec.ts
   │   └── navigation.spec.ts
   ├── fixtures/
   │   └── test-users.json
   └── setup/
       └── global-setup.ts
   ```

## Test Scenarios

### Authentication Flow

1. **Registration Process**
   ```typescript
   test("user can register and login", async ({ page }) => {
     // Register
     await page.goto("/auth/register")
     await page.fill("[name=name]", "Test User")
     await page.fill("[name=email]", "test@example.com")
     await page.fill("[name=password]", "password123")
     await page.fill("[name=confirmPassword]", "password123")
     await page.click("button[type=submit]")
     
     // Verify redirect to login
     await expect(page).toHaveURL("/auth/login")
     
     // Login
     await page.fill("[name=email]", "test@example.com")
     await page.fill("[name=password]", "password123")
     await page.click("button[type=submit]")
     
     // Verify successful login
     await expect(page).toHaveURL("/")
   })
   ```

2. **Protected Routes**
   - Verify redirect to login for unauthenticated users
   - Check access granted for authenticated users
   - Test role-based access control

### Form Submissions

1. **Contact Form**
   - Submit with valid data
   - Validate error messages
   - Check form reset after submission

2. **Form Validation**
   - Test field requirements
   - Verify error message display
   - Check success scenarios

## Test Configuration

1. **Environment Setup**
   ```typescript
   // global-setup.ts
   import { chromium, FullConfig } from "@playwright/test"

   async function globalSetup(config: FullConfig) {
     const browser = await chromium.launch()
     const page = await browser.newPage()
     
     // Set up test environment
     await page.goto("http://localhost:3000")
     
     await browser.close()
   }

   export default globalSetup
   ```

2. **Test Data**
   ```json
   // test-users.json
   {
     "testUser": {
       "name": "Test User",
       "email": "test@example.com",
       "password": "password123"
     },
     "adminUser": {
       "name": "Admin User",
       "email": "admin@example.com",
       "password": "admin123",
       "role": "admin"
     }
   }
   ```

## Running Tests

```bash
# Run all integration tests
bun playwright test

# Run specific test file
bun playwright test auth.spec.ts

# Run tests with UI
bun playwright test --ui

# Run tests in debug mode
bun playwright test --debug
```

## Best Practices

1. **Test Setup**
   - Use clean database for each test
   - Mock external services
   - Set up test users with different roles

2. **Test Organization**
   - Group related tests
   - Use descriptive test names
   - Keep tests independent

3. **Assertions**
   - Check both positive and negative cases
   - Verify UI state changes
   - Validate data persistence