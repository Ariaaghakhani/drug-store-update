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

  createRole(config) {
    return apiCaller.post('api/roles/create', config)
  },

  updateRole(config) {
    return apiCaller.post('api/roles/update', config)
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
  listEndpointPermissions(config) {
    return apiCaller.post('api/endpoint-permissions/list', config)
  },

  // ========== ROLE ENDPOINT PERMISSIONS ==========
  assignEndpointToRole(config) {
    return apiCaller.post('api/role-endpoint-permissions/assign', config)
  },

  removeEndpointFromRole(config) {
    return apiCaller.post('api/role-endpoint-permissions/remove', config)
  },

  // ========== PASSWORD POLICIES ==========
  getPasswordPolicy(config) {
    return apiCaller.post('api/password-policies/get', config)
  },

  updatePasswordPolicy(config) {
    return apiCaller.post('api/password-policies/update', config)
  },
})
