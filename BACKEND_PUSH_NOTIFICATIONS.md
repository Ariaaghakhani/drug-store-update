# Push notifications + in-app inbox — backend contract

Status (2026-10-29): **frontend implemented** against this contract. **Backend not written yet.** Local branch
`agk/push-notifications` exists in PouyanPlatform (off `main` @ #428), with no changes on it.

Delivery: Firebase Cloud Messaging (FCM) **web push**, data-only messages. Every notification is also stored
in a per-user inbox, so users who deny permission, or whose browser or server can't reach Google, still see it in
the panel bell.

> ⚠ Iran: Google restricts Firebase in sanctioned regions. Both the browser's token registration and the server's
> FCM send may be refused from Iranian IPs. Test one real send from the production server early. The design keeps
> push optional: no credentials → no-op, the inbox still works. `FIREBASE_PROXY_HOST/PORT` exists for an outbound proxy.

---

## 1. REST API (frontend depends on this)

All under `/api/notifications/my`. Any logged-in user (`.authenticated()` in `SecurityConfig`, same as
`/api/wishlist/my/**`). The user comes from the token. Responses use the usual `ApiResponse` envelope.

| Method | Path | Body / params | Response `data` |
|---|---|---|---|
| GET | `/api/notifications/my` | `page` (0-based), `size` 1..100 (default 20), `unreadOnly` (bool, default false) | `PageResponse<UserNotificationDTO>`, newest first |
| GET | `/api/notifications/my/unread-count` | — | `{ "unread": 3 }` |
| PUT | `/api/notifications/my/{id}/read` | — | `UserNotificationDTO` (404 `notification.not.found` if not the caller's) |
| PUT | `/api/notifications/my/read-all` | — | `{ "unread": 0 }` |
| PUT | `/api/notifications/my/devices` | `{ token (≤512, required), userAgent? (≤300) }` | `null` — upsert by (tenant, token); a token that belonged to another user moves to the caller |
| POST | `/api/notifications/my/devices/remove` | `{ token }` | `null` — deletes only the caller's own row (logout / "turn off") |

`UserNotificationDTO`: `{ id, type, title, body, link, referenceId, readAt, createdAt }`

- `type` ∈ `ORDER | ORDER_RETURN | TICKET | PRESCRIPTION | WALLET | STOCK_ALERT | LOW_STOCK`
- `link`: a relative site path, or `null`. The frontend routes to it on click. Only paths starting with `/` are honored.

Module for `@EndpointInfo` / `EndpointModuleLabels`: `NOTIFICATION_USER` → "اعلان‌های من", group `ACCOUNT`
(`EndpointModuleLabelsTest.everyControllerModuleHasALabelAndAGroup` requires the label).

## 2. FCM message (frontend's service worker depends on this)

Data-only `MulticastMessage` (no `notification` block, because `public/firebase-messaging-sw.js` shows it itself),
with WebPush headers `Urgency: high`, `TTL: 86400`. Data keys, all strings:

| key | value |
|---|---|
| `type` | the `NotificationType` |
| `title` | ≤200 chars |
| `body` | may be `""` |
| `link` | relative path or `""` |
| `tag` | `"{type}:{referenceId}"` or `""`. A later push for the same order replaces the OS notification. |

`sendEachForMulticast`, ≤500 tokens per call. Delete tokens whose error is `UNREGISTERED` or `SENDER_ID_MISMATCH`.
Never delete on `INVALID_ARGUMENT`, which can be a payload problem rather than a dead token.

## 3. Backend design (PouyanPlatform)

### `notification` module (stays a leaf: no domain dependencies)
- `enums/NotificationType`
- `entity/UserNotification` → `user_notifications` (TenantBaseEntity + `user_id`, `type` varchar(30), `title` nvarchar(200),
  `body` nvarchar(1000), `link` nvarchar(300), `reference_id`, `read_at`), index `(tenant_id, user_id, read_at)`
- `entity/PushDevice` → `push_devices` (TenantBaseEntity + `user_id`, `token` nvarchar(512), `user_agent` nvarchar(300),
  `last_seen_at`), unique `(tenant_id, token)`, index `(tenant_id, user_id)`. Hard delete.
- `repository/UserNotificationRepository` (`findOwn(tenant,user,unreadOnly,pageable)`, count unread, find own by id,
  bulk `markAllRead`) · `repository/PushDeviceRepository` (`findByTenantIdAndToken`, `findTokens(tenant, userIds)`,
  `deleteOwn`, `deleteTokens` with `@Transactional(REQUIRES_NEW)` because it runs after commit)
- `dto/NotificationMessage(type, title, body, link, referenceId)` (record), `UserNotificationDTO`,
  `NotificationPageRequestDTO`, `NotificationCountDTO(unread)`, `PushDeviceRequest`
- `service/PushSender` + `impl/FcmPushSender`: Firebase Admin. `firebase.credentials-path` blank → disabled (logged once).
  An unreadable file → error log, disabled; startup does not fail. Optional HTTP proxy is applied to both the
  `GoogleCredentials` token refresh and the messaging transport.
- `service/UserNotificationService` + impl: `notifyUsers(userIds, message)` saves one inbox row per distinct user
  (tenantId set explicitly) in the caller's transaction, then sends the push **after commit**
  (`TransactionSynchronization.afterCommit`, or immediately if there is no transaction). Push errors are only logged.
  It also covers the inbox reads/marks and device register/remove for the controller.
- `controller/UserNotificationController` (§1). Add `NOTIFICATION_USER` paths to `PublicEndpoints` + `SecurityConfig`.

### `identity/user`: recipient lookup
`NotificationRecipientService`:
- `Optional<Long> userIdOfPerson(Long personId)` (uses the existing `AppUserRepository.findUserIdsByPersonIds`)
- `List<Long> staffWithModule(String module)`: active, non-deleted, non-customer users of the current tenant whose role
  holds any endpoint of that module. Uses the same grant rule as `EffectiveAccessService.grantApplies`: a role of
  this tenant, or a SYSTEM template role with the same name.

### Hook points
Push runs in **new after-commit async listeners/services** next to the SMS ones. SMS code paths and their toggles
stay untouched. Push is free, so it ignores the SMS cost toggles.

| Event | Recipient | type / link |
|---|---|---|
| `OrderPlacedEvent` | customer (order person → user) + staff `ORDER` | ORDER, `/panel/orders/{id}` |
| `OrderCustomerUpdateEvent` (SHIPPED, READY_FOR_PICKUP, DELIVERED, DELIVERY_FAILED, NOT_COLLECTED, CANCELLED, PAYMENT_REMINDER) | customer | ORDER, `/panel/orders/{id}` |
| `TicketCreatedEvent` | staff `TICKET` | TICKET, `/panel/tickets/{id}` |
| `TicketRepliedEvent` (needs a new `customerUserId` field = `ticket.getCreator().getId()`) | customer | TICKET, `/panel/tickets/{id}` |
| customer reply (`replyMy`; new `TicketCustomerRepliedEvent`) | assignee, else staff `TICKET` | TICKET, `/panel/tickets/{id}` |
| `PrescriptionSubmittedEvent` | staff `PRESCRIPTION` | PRESCRIPTION, `null` |
| `PrescriptionCustomerUpdateEvent` | customer | PRESCRIPTION, `null` |
| `ReturnUpdateEvent` NEW / APPROVED, REJECTED, REFUNDED | staff `ORDER_RETURN` / customer | ORDER_RETURN, `/panel/orders/{orderId}` |
| `WalletCreditedEvent` (personId → user) | customer | WALLET, `/panel/wallet` |
| `StockAlertServiceImpl.notifyAvailable` (after the WAITING→NOTIFIED flip) | `alert.getUserId()` | STOCK_ALERT, `/medications/{goodsId}` |
| `LowStockAlertServiceImpl.sendIfDue` (same daily gate; staff no longer need phones to be set) | staff `INVENTORY` | LOW_STOCK, `/panel/products` |

Tests to update: `TicketNotificationServiceImplTest` (event constructor), `LowStockAlertServiceImplTest` and
`StockAlertServiceImplTest` (constructor args).

### Config
`pom.xml`: `com.google.firebase:firebase-admin` (9.4.3 or newer; exclude `commons-logging` as the other deps do).

```properties
# application.properties — Firebase push; blank path = push off (inbox still works)
firebase.credentials-path=${FIREBASE_CREDENTIALS_PATH:}
firebase.proxy-host=${FIREBASE_PROXY_HOST:}
firebase.proxy-port=${FIREBASE_PROXY_PORT:0}
```
`.env.example`: document the three keys. The service-account JSON is never committed. Point the path at a file outside the repo.

SQL for `ddl-auto=validate`: `docs/sql/2026-10-push-notifications.sql` (both tables, idempotent `IF OBJECT_ID … IS NULL`),
same style as `2026-10-store-sms-account.sql`. No grants needed (`.authenticated()` paths).

## 4. Firebase project setup (one time)
1. Firebase console → project → **Add app → Web**. Copy `apiKey, authDomain, projectId, storageBucket,
   messagingSenderId, appId` into `NUXT_PUBLIC_FIREBASE_*` (or `nuxt.config.ts` → `runtimeConfig.public.firebase`).
2. **Project settings → Cloud Messaging → Web Push certificates → Generate key pair** → `NUXT_PUBLIC_FIREBASE_VAPID_KEY`.
3. **Project settings → Service accounts → Generate new private key** → JSON on the backend server →
   `FIREBASE_CREDENTIALS_PATH`. Keep it out of git.
4. Ensure the **Firebase Cloud Messaging API (V1)** is enabled for the project in Google Cloud console.
