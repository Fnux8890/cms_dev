# Unit Tests

## Test Setup

1. **Testing Libraries**
   - Vitest for unit testing
   - Testing Library for React component testing
   - MSW for mocking API requests

2. **Test Structure**
   ```
   tests/
   ├── components/
   │   ├── button.test.tsx
   │   ├── contact-form.test.tsx
   │   ├── login-form.test.tsx
   │   └── register-form.test.tsx
   ├── lib/
   │   ├── auth.test.ts
   │   └── utils.test.ts
   └── setup/
       └── test-utils.tsx
   ```

## Test Cases

### Components

1. **Button Component**
   - Renders with default variant
   - Applies custom classes
   - Handles click events
   - Shows loading state

2. **Contact Form**
   - Validates required fields
   - Shows error messages
   - Handles form submission
   - Displays success message

3. **Login Form**
   - Validates email format
   - Validates password length
   - Shows loading state during submission
   - Handles authentication errors

4. **Register Form**
   - Validates all required fields
   - Checks password confirmation
   - Shows appropriate error messages
   - Handles registration success

### Library Functions

1. **Auth Utilities**
   - Login function handles success/failure
   - Register function creates new users
   - Get current user returns correct data
   - Logout clears session

2. **Utility Functions**
   - Class name merging works correctly
   - Form validation helpers work as expected

## Running Tests

```bash
# Run all tests
bun test

# Run specific test file
bun test components/button.test.tsx

# Run tests in watch mode
bun test --watch
```

## Test Guidelines

1. **Component Tests**
   - Test rendering and user interactions
   - Verify form validations
   - Check error states
   - Test loading states

2. **Utility Tests**
   - Test edge cases
   - Verify error handling
   - Check type safety

3. **Auth Tests**
   - Mock API responses
   - Test error scenarios
   - Verify session handling 