# Integration Tests (Iteration 4)

- Document end-to-end or system-wide tests, e.g., verifying deployments and auth flows working in Vercel.
- Note pass/fail results and any blockers found. 

## Testing Strategy
- [ ] Deploy the app to a test environment on Vercel and verify:
  - MDX commits reflect immediately on the live site (if auto-deploy).
  - Routes remain secure for unauthenticated users.
  - Authenticated or role-based pages function as intended.
- [ ] Confirm environment variables are correctly set in Vercel (e.g., .env, project settings).

## Recording Results
- [ ] Keep a log of successful deployments vs. any build failures.
- [ ] Document unexpected login or role-access issues discovered in the live environment.
- [ ] If blockers arise (like Git or deployment conflicts), add them to iteration 5 planning.