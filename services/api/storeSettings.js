/**
 * Store settings service: the generic settings editor, store type, password policy, organization and logo.
 * Verified 2026-11-11 against BACK SystemSettingController, StoreProfileController, PasswordPolicyController and
 * StoreOrganizationController (tenant from X-Tenant / token, no tenant id in the paths).
 */
export default (apiCaller) => ({
  // ========== SYSTEM SETTINGS (SYSTEM_SETTINGS) ==========
  // GET api/admin/settings → SettingDTO[] {key, label, group, groupLabel, scope, type, editable, min, max, defaultValue,
  // value, ownValue, source OWN|PLATFORM|DEFAULT, choices[]}. Rows with editable=false are read-only here.
  listSettings() {
    return apiCaller.get('api/admin/settings')
  },

  // PUT api/admin/settings, body {key, value: string} → SettingDTO (the saved effective row).
  updateSetting(config) {
    return apiCaller.put('api/admin/settings', config)
  },

  // POST api/admin/settings/reset, body {key} → SettingDTO. Removes this store's own value (platform/default returns).
  resetSetting(config) {
    return apiCaller.post('api/admin/settings/reset', config)
  },

  // ========== STORE TYPE (SYSTEM_SETTINGS) ==========
  // POST api/store-profile, body {storeType (required), batchRequired?, expiryRequired?, prescriptionEnabled?,
  // variantsEnabled?} (null = the template default) → StoreProfileDTO.
  saveStoreProfile(config) {
    return apiCaller.post('api/store-profile', config)
  },

  // ========== PASSWORD POLICY (PASSWORD_POLICY) ==========
  // GET api/admin/password-policy → {policy: PasswordPolicyDTO, platformMinimum: PasswordPolicyDTO | null}.
  getPasswordPolicyAdmin() {
    return apiCaller.get('api/admin/password-policy')
  },

  // PUT api/admin/password-policy, body {minLength 6..64 (required), requireUppercase, requireLowercase,
  // requireDigit, requireSpecialChar} → {policy, platformMinimum}. Weaker than the platform minimum → 400.
  savePasswordPolicy(config) {
    return apiCaller.put('api/admin/password-policy', config)
  },

  // ========== MY ORGANIZATION (MY_ORGANIZATION) ==========
  // GET api/admin/my-organization → OrganizationDTO. No organization yet → id null.
  getMyOrganization() {
    return apiCaller.get('api/admin/my-organization')
  },

  // PUT api/admin/my-organization, full OrganizationDTO body (id ignored) → OrganizationDTO. Empty nationalId or
  // economicCode means unchanged once saved; a different value there → 409.
  saveMyOrganization(config) {
    return apiCaller.put('api/admin/my-organization', config)
  },

  // GET api/admin/my-organization/logo → {url} (url null when there is no logo).
  getStoreLogo() {
    return apiCaller.get('api/admin/my-organization/logo')
  },

  // POST api/admin/my-organization/logo, multipart field `file` (PNG or JPEG, at most 1 MB) → {url}. Replaces the old logo.
  uploadStoreLogo(config) {
    return apiCaller.post('api/admin/my-organization/logo', config)
  },

  // DELETE api/admin/my-organization/logo → 204 (also when there is no logo).
  deleteStoreLogo() {
    return apiCaller.delete('api/admin/my-organization/logo')
  },
})
