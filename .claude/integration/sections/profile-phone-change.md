# Section: profile-phone-change

Branch: `feat/api-7-profile-phone-change`

## Module docs to read
- `services/api/CLAUDE.md`, `components/panel/CLAUDE.md` (profile sub-section)
- `shared.md`

## Endpoints
`identity/auth/controller/AuthController.java`, base `/api/auth/me/phone`, all require login/JWT. **Exact parity with FRONT's existing 4-step wizard UI** (the 5th template step is a pure success screen, no call):
1. `POST /api/auth/me/phone/current/send-otp` — no body (reads current phone from the authenticated account).
2. `POST /api/auth/me/phone/current/verify-otp` — body `{ otpCode }`.
3. `POST /api/auth/me/phone/new/send-otp` — body `{ phone }` (accepts `09…`/`989…`/`+989…`/`00989…`, normalized to `09…`).
4. `POST /api/auth/me/phone/new/verify-otp` — body `{ phone, otpCode }` — on success: phone changes, **other sessions are revoked**, returns a fresh `TokenResponse { accessToken, message, user }` (refresh token reissued via cookie, same as login).

**Do not use `/api/otp/*` (`OtpController`)** — that's a separate generic OTP mechanism that explicitly rejects phone-change codes and vice versa.

## FRONT files to touch
- `components/panel/profile/ChangePhoneModal.vue` — swap the 4 simulated `setTimeout` steps for the 4 real calls above, exact field names (`otpCode`, `phone` — not `otp`/`code`).
- After step 4 succeeds, update `$auth`/`userStore` with the new `accessToken`/`user` (same pattern `plugins/auth.client.js` already uses on login) since other sessions get revoked server-side.

## Acceptance criteria
- Full 4-step flow works against the real backend; wrong OTP shows the right error from `error.response.data.message`.
- After a successful phone change, the app's own session (current device) stays logged in with the new token; no forced re-login on this device.

## Known gaps
None — this is full parity, straightforward wiring.
