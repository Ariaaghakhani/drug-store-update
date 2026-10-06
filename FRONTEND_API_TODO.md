# Frontend API TODO

Backend gaps discovered while wiring frontend features. Each entry is a proposed contract, not a confirmed one — verify against BACK source again before implementing.

## Active session list + revoke-one + revoke-all
- Status: missing
- Needed by: components/panel/security/ActiveSessionsCard.vue, components/panel/security/DangerZoneCard.vue
- Endpoint: `GET /api/auth/me/sessions` (list), `DELETE /api/auth/me/sessions/{id}` (revoke one), `POST /api/auth/me/sessions/revoke-all` (proposed)
- Request: list — none; revoke-one — path param `id: string|number` (refresh token / session id); revoke-all — none (acts on current user from auth context)
- Expected response: list → `ApiResponse<SessionDTO[]>` where `SessionDTO = { id: string, current: boolean, device: string|null, browser: string|null, ip: string|null, location: string|null, lastActiveAt: string (ISO), createdAt: string (ISO) }`; revoke-one/revoke-all → `ApiResponse<null>` or `ApiResponse<{ revokedCount: number }>`
- Current behavior: BACK has no controller endpoint for this — `RefreshTokenRepository.revokeAllByUser` and `AccessTokenRevocationService.revokeAllForUser` already exist and are used internally by `/api/auth/me/password` and phone-change confirm, so a self-service "revoke all" endpoint would be a thin new controller method wrapping existing service calls, not new infra. Per-session listing and single-session revoke have no backing data path at all (no per-session metadata like device/browser/location is persisted on `RefreshToken`).
- Why: users expect to see and manage where they're logged in, especially after a password change wipes all other sessions silently.
- Date: 2026-10-06

## 2FA setup/verify
- Status: missing
- Needed by: components/panel/security/TwoFAModal.vue, components/panel/security/AuthMethodsCard.vue
- Endpoint: `POST /api/auth/me/2fa/setup` (begin, returns secret/QR), `POST /api/auth/me/2fa/verify` (confirm code, enables), `POST /api/auth/me/2fa/disable` (proposed)
- Request: setup — none; verify — `{ code: string }`; disable — `{ code: string }` or `{ currentPassword: string }`
- Expected response: setup → `ApiResponse<{ secret: string, qrCodeUrl: string }>`; verify → `ApiResponse<{ enabled: true }>`; disable → `ApiResponse<{ enabled: false }>`
- Current behavior: BACK has no 2FA/TOTP concept anywhere in `identity/auth` — only phone-OTP login/register flows exist, which are not a second factor on top of password.
- Why: security page already advertises "احراز هویت دو مرحله‌ای" as a toggle; shipping it mocked risks users believing their account is protected when it isn't.
- Date: 2026-10-06

## Login history
- Status: missing
- Needed by: components/panel/security/LoginHistoryCard.vue
- Endpoint: `GET /api/auth/me/login-history` (proposed, paginated)
- Request: `{ page?: number, pageSize?: number }` as query params
- Expected response: `ApiResponse<{ content: LoginHistoryEntryDTO[], totalElements: number }>` where `LoginHistoryEntryDTO = { id: string, success: boolean, suspicious: boolean, action: string, device: string|null, ip: string|null, occurredAt: string (ISO) }`
- Current behavior: BACK has no login-history/audit trail exposed to the end user — `loginAttemptService` tracks failed-attempt counters for lockout purposes only, nothing persisted/queryable per login event today.
- Why: lets users verify no one else accessed their account, which is a standard account-security expectation.
- Date: 2026-10-06

## Security alerts / notification preferences
- Status: missing
- Needed by: components/panel/security/SecurityAlertsCard.vue
- Endpoint: `GET /api/auth/me/security-notifications` (read prefs), `PATCH /api/auth/me/security-notifications` (update, proposed)
- Request: read — none; update — `{ id: string, enabled: boolean }` (or full map `{ [id: string]: boolean }`)
- Expected response: `ApiResponse<{ id: string, label: string, description: string, enabled: boolean }[]>`
- Current behavior: BACK has no notification-preference storage or delivery mechanism for security events (new-device login, failed-login streak, profile change) — nothing to read or persist against.
- Why: users expect to opt in/out of being alerted about sensitive account activity.
- Date: 2026-10-06
