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
    return apiCaller.post('api/persons/get-by-id', config)
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

  // ========== ROLES ==========
  listRoles(config) {
    return apiCaller.post('api/roles/list', config)
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
