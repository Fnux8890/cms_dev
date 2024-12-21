# Integration Tests (Iteration 2)

- Outline integration tests, possibly using Cypress or similar for verifying the MDX flow.
- Document test scenarios and pass/fail outcomes. 

## Testing Strategy
- [ ] Validate that the route(s) rendering MDX content work in a local environment.
- [ ] If role-based auth is set up, run end-to-end flows with “viewer” and “editor” roles:
  - Confirm “viewer” cannot edit or save MDX.
  - Confirm “editor” can successfully edit or save MDX content.
- [ ] For partial Git integration (if attempted):
  - Check commits or content updates are triggered as expected (manual or automated).

## Recording Results
- [ ] Keep a short record of test passes/fails, console logs, and any unexpected issues.
- [ ] Move unresolved issues into iteration 3’s backlog if needed.