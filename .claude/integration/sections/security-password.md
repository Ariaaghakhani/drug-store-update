# Section: security-password

Branch: `feat/api-8-security-password`

## Module docs to read
- `services/api/CLAUDE.md`, `components/panel/CLAUDE.md` (security sub-section)
- `shared.md`

## Endpoints
`identity/auth/controller/AuthController.java`:
- `POST /api/auth/me/password` body `ChangePasswordRequest { currentPassword, newPassword }` — the **only** real endpoint in this entire feature area. Revokes other sessions and reissues token/cookie for the current device (same pattern as phone-change step 4). Returns `ApiResponse<TokenResponse>`.

Everything else this section's components claim to do has **no backend support**, confirmed by reading the full identity/auth package plus a repo-wide search for "session," "login history," "2fa"/"two factor," and "security alert": nothing found beyond generic internal audit logging. See `shared.md`'s "Known backend gaps" list, items 4–7.

## FRONT files to touch
- `components/panel/security/ChangePasswordModal.vue` — wire its 4-step OTP+new-password wizard's final submit to `POST /api/auth/me/password` with `{currentPassword, newPassword}`. Check whether the modal's OTP steps are actually required by this endpoint (the BACK endpoint only needs `currentPassword`+`newPassword`, no OTP) — if BACK doesn't require OTP verification for a password change, the modal's OTP steps may need to be simplified/removed, not just wired; don't invent an OTP requirement BACK doesn't enforce.
- `components/panel/security/{ActiveSessionsCard,AuthMethodsCard,DangerZoneCard,LoginHistoryCard,SecurityAlertsCard,TwoFAModal}.vue` — **leave mocked.** Write `FRONTEND_API_TODO.md` entries (4 separate entries, one per gap) instead of attempting to wire these.

## Acceptance criteria
- Password change works end-to-end against the real endpoint; wrong current-password shows the real backend error.
- The other 6 security cards are explicitly left as-is with a short code comment pointing at their `FRONTEND_API_TODO.md` entry, so a future reader doesn't think they're broken wiring — they're intentionally unimplemented pending backend work.

## Known gaps
- Active sessions list/revoke-one/revoke-all (self-service) — BACK has the internal `revokeAll`/`revokeAllForUser` service methods already; this would be a thin new controller endpoint, worth noting in the TODO entry so backend work is small.
- 2FA setup/verify — no concept in BACK at all.
- Login history — no user-facing endpoint.
- Security alerts/notification preferences — no concept in BACK at all.
