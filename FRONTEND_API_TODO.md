# Frontend/API Contract Gaps

## Users &amp; Roles permission UI does not match BACK's permission model
- Status: needs-change (FRONT-side redesign, not a missing BACK endpoint — BACK is more capable than FRONT's current model, not less)
- Needed by: `pages/panel/users.vue`, `components/panel/users/{EditUserModal,UserPermissionsPanel}.vue`, `stores/roles.ts`, `composables/useUpdateRolePermission.ts`
- Endpoint: `GET /api/admin/endpoint-permissions/grouped` (already exists on BACK), plus `POST/PUT/DELETE /api/role-endpoint-permissions` for assignment
- Request: n/a — this is a UI data-model change, not a new call
- Expected response: FRONT currently models permissions as a fixed 3-domain (`users/products/orders`) × 4-action (`create/read/update/delete`) checkbox grid (`stores/roles.ts`). BACK's real mechanism grants a role access to specific, concrete HTTP endpoints grouped by an open-ended `module` string (likely dozens of values, e.g. `USER_MANAGEMENT`, `ORDER`, `ADDRESS`), via `EndpointPermissionController`/`RoleEndpointPermissionController`. There's also a separate, thinner `Permission` entity (bare `action` string) with no REST controller at all — confirmed unused/legacy, not the mechanism to build against.
- Current behavior: `UserPermissionsPanel.vue` renders the hardcoded 3×4 grid against `stores/roles.ts`'s mock data; none of it is wired to any BACK endpoint today.
- Why: a literal "wire up the existing grid" is not possible — the data shapes don't correspond. Needs a product/design decision on whether to rebuild the panel as a module-grouped endpoint-toggle list (matches BACK exactly), keep a simplified grid curated to a fixed subset of modules, or some other approach, before any implementation work starts. Deferred by Aria on 2026-10-06 pending that decision — not scheduled as an integration task until a redesign direction is picked.
- Date: 2026-10-06
