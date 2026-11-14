# Section: panel-users-roles

Branch: `feat/api-5-panel-users-roles`

**Blocked on a design decision — see plan.md "Decisions to review" before starting this task.**

## Module docs to read
- `services/api/CLAUDE.md`, `components/panel/CLAUDE.md` (users sub-section), `composables/CLAUDE.md` (`useUpdateRolePermission`), `stores/CLAUDE.md` (`roles.ts`)
- `shared.md` (role/permission gating reality)

## The core problem (read this before touching code)
FRONT's `stores/roles.ts` + `UserPermissionsPanel.vue` model permissions as a fixed 3-domain (`users/products/orders`) × 4-action (`create/read/update/delete`) checkbox grid. **BACK has no such model.** BACK's real mechanism (`identity/permission/controller/EndpointPermissionController` + `RoleEndpointPermissionController`) grants a role access to specific, concrete HTTP endpoints, grouped by `module` (an open-ended string like `USER_MANAGEMENT`, `ORDER`, `ADDRESS` — likely dozens of values, not 3). `GET /api/admin/endpoint-permissions/grouped` returns permissions grouped by module. There is a separate, thinner `Permission` entity (bare `action` string, no domain) with no REST controller to list/create it at all — treat it as unused/legacy, not the mechanism to wire against.

This task cannot just "wire up the existing grid" — it needs a UI redesign (module-grouped endpoint toggle list instead of a 3×4 grid) before implementation. **Do not implement a literal translation; flag back to Aria if the redesign scope isn't clear from this section file.**

## Endpoints (for whichever redesign direction is chosen)
`identity/user/controller/{UserManagementController,PersonController}.java`, `identity/role/controller/{RoleController,UserRoleController}.java`, `identity/permission/controller/*`:
- Users: `POST /api/users/create`, `GET /api/users/staff` (list), `POST /api/users/get` `{id}`, `POST /api/users/{deactivate,activate,lock,unlock}` `{id}`. **No update/edit endpoint** — editing name/phone goes through `PersonController`'s `POST /api/persons/update` `{id, dto}` on the linked person instead. **No delete** — only deactivate (soft/reversible).
- Roles: `POST /api/roles` (create), `PUT /api/roles` (update, body `{id, roleDTO}`), `POST /api/roles/get` `{id}`, `GET /api/roles` (list), `POST /api/roles/delete` `{id}`.
- User↔role: `POST /api/user-roles` (assign, body `{userId, roleId}`), `PUT /api/user-roles` (update), `POST /api/user-roles/get-by-id` `{id}`, `GET /api/user-roles/all`, `POST /api/user-roles/delete` `{id}` (**join-row id, not `{userId,roleId}`**).
- Endpoint permissions: `GET /api/admin/endpoint-permissions`, `.../modules`, `.../grouped`; role↔endpoint-permission: `POST /api/role-endpoint-permissions` (create), `PUT`, `POST .../delete` `{id}`, bulk `.../delete/by-role` and `.../delete/by-permission`.

## FRONT files to touch (once redesign is agreed)
- `services/api/user.js` — virtually every path is wrong/guessed (`/list` suffixes that don't exist, `/create`/`/assign`/`/remove` suffixes BACK doesn't use, wrong root for password policy). Needs a near-total rewrite of URLs/verbs/payloads, not incremental fixes — see the full list in the Phase 2 discovery notes (`log.md`) if detail beyond this section is needed.
- `stores/roles.ts`, `composables/useUpdateRolePermission.ts`, `components/panel/users/{EditUserModal,UserPermissionsPanel}.vue` — redesign target once decided.

## Acceptance criteria
(To be finalized once the redesign direction is chosen — don't start implementation without this.)

## Known gaps
- None that need a `FRONTEND_API_TODO.md` entry — BACK's mechanism is more capable than FRONT's current model, not missing anything. The gap is a FRONT design gap, not a backend one.
