/**
 * User & Profile Service
 * User management and profile operations
 */
export default (apiCaller) => ({
  // ========== USER/PERSON PROFILE ==========
  listUsers(config) {
    return apiCaller.post('api/persons/list', config)
  },

  getUser(config) {
    return apiCaller.post('api/persons/get', config)
  },

  createUser(config) {
    return apiCaller.post('api/persons/create', config)
  },

  updateUser(config) {
    return apiCaller.post('api/persons/update', config)
  },

  deleteUser(config) {
    return apiCaller.post('api/persons/delete', config)
  },

  // ========== STAFF/USER MANAGEMENT (tenant login accounts, not plain persons) ==========
  createStaff(config) {
    return apiCaller.post('api/users/create', config)
  },

  listStaff(config) {
    return apiCaller.get('api/users/staff', config)
  },

  // Staff and customers of this store. GET, 0-based `page`, `size` 1..100, optional `type` (ALL|STAFF|CUSTOMER), `q`,
  // `active`, `locked` via config.params → PageResponse<ManagedUserDTO>
  searchManagedUsers(config) {
    return apiCaller.get('api/users', config)
  },

  // body {id} → ManagedUserDTO, like every other action below that takes {id}
  getManagedUser(config) {
    return apiCaller.post('api/users/get', config)
  },

  // body {id, roleIds}: replaces the staff roles. [] is only allowed for a user who also has the customer role
  setManagedUserRoles(config) {
    return apiCaller.post('api/users/roles', config)
  },

  activateManagedUser(config) {
    return apiCaller.post('api/users/activate', config)
  },

  deactivateManagedUser(config) {
    return apiCaller.post('api/users/deactivate', config)
  },

  lockManagedUser(config) {
    return apiCaller.post('api/users/lock', config)
  },

  unlockManagedUser(config) {
    return apiCaller.post('api/users/unlock', config)
  },

  // body {id} → SessionDTO[] (`current` is always false here, `location` null)
  listManagedUserSessions(config) {
    return apiCaller.post('api/users/sessions', config)
  },

  // body {id, sessionId}
  revokeManagedUserSession(config) {
    return apiCaller.post('api/users/sessions/revoke', config)
  },

  // body {id} → {revokedCount}
  revokeAllManagedUserSessions(config) {
    return apiCaller.post('api/users/sessions/revoke-all', config)
  },

  // body {id, page (0-based), size 1..100} → PageResponse<LoginHistoryEntryDTO>
  getManagedUserLoginHistory(config) {
    return apiCaller.post('api/users/login-history', config)
  },

  // ========== ROLES ==========
  listRoles(config) {
    return apiCaller.get('api/roles', config)
  },

  getRole(config) {
    return apiCaller.post('api/roles/get', config)
  },

  // body RoleDTO {name, description, type?} → RoleDTO (201). BACK uppercases the name; no permissions yet
  createRole(config) {
    return apiCaller.post('api/roles', config)
  },

  // body {id, roleDTO: {name, description, type}} → RoleDTO. Built-in roles can't be renamed
  updateRole(config) {
    return apiCaller.put('api/roles', config)
  },

  deleteRole(config) {
    return apiCaller.post('api/roles/delete', config)
  },

  // ========== USER ROLES ==========
  listUserRoles(config) {
    return apiCaller.post('api/user-roles/list', config)
  },

  assignRole(config) {
    return apiCaller.post('api/user-roles/assign', config)
  },

  removeRole(config) {
    return apiCaller.post('api/user-roles/remove', config)
  },

  // ========== PERMISSIONS ==========
  listPermissions(config) {
    return apiCaller.post('api/permissions/list', config)
  },

  getPermission(config) {
    return apiCaller.post('api/permissions/get', config)
  },

  // ========== ROLE PERMISSIONS ==========
  listRolePermissions(config) {
    return apiCaller.post('api/role-permissions/list', config)
  },

  assignPermissionToRole(config) {
    return apiCaller.post('api/role-permissions/assign', config)
  },

  removePermissionFromRole(config) {
    return apiCaller.post('api/role-permissions/remove', config)
  },

  // ========== ENDPOINT PERMISSIONS ==========
  // GET, no body → every endpoint BACK knows: [{id, endpoint, httpMethod, nameFa, nameEn, module, action}] (a bare array,
  // not wrapped in ApiResponse)
  listEndpointPermissions(config) {
    return apiCaller.get('api/admin/endpoint-permissions', config)
  },

  // ========== ROLE ENDPOINT PERMISSIONS ==========
  // body {id: roleId} → [{id, roleId, endpointPermissionId}] (the role's own grants)
  listRoleEndpointPermissions(config) {
    return apiCaller.post('api/role-endpoint-permissions/by-role', config)
  },

  // body {roleId, endpointPermissionIds: number[]?, modules: string[]?} → bulk grant; every id must be within the
  // caller's own access, otherwise 403 and nothing is granted
  grantRoleEndpointsBulk(config) {
    return apiCaller.post('api/role-endpoint-permissions/bulk', config)
  },

  // body {roleId, endpointPermissionId}
  assignEndpointToRole(config) {
    return apiCaller.post('api/role-endpoint-permissions', config)
  },

  // body {id}: the role-endpoint row id (from listRoleEndpointPermissions), not the endpoint id
  removeEndpointFromRole(config) {
    return apiCaller.post('api/role-endpoint-permissions/delete', config)
  },

  // ========== PASSWORD POLICIES ==========
  getPasswordPolicy(config) {
    return apiCaller.post('api/password-policies/get', config)
  },

  updatePasswordPolicy(config) {
    return apiCaller.post('api/password-policies/update', config)
  },
})
