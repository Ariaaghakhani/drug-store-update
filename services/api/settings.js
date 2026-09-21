/**
 * System Settings Service
 * Application configuration and settings
 */
export default (apiCaller) => ({
  // ========== SYSTEM SETTINGS ==========
  listSettings(config) {
    return apiCaller.post('api/settings/list', config)
  },

  getSetting(config) {
    return apiCaller.post('api/settings/get', config)
  },

  updateSetting(config) {
    return apiCaller.post('api/settings/update', config)
  },

  // ========== OUTPUT FORMAT SETTINGS ==========
  listOutputFormats(config) {
    return apiCaller.post('api/settings/formats/list', config)
  },

  getOutputFormat(config) {
    return apiCaller.post('api/settings/formats/get', config)
  },

  updateOutputFormat(config) {
    return apiCaller.post('api/settings/formats/update', config)
  },

  // ========== CONFIGURATION ==========
  getSystemConfig(config) {
    return apiCaller.post('api/settings/config', config)
  },

  updateSystemConfig(config) {
    return apiCaller.post('api/settings/config/update', config)
  },

  // ========== BACKUP & RESTORE ==========
  backupSettings(config) {
    return apiCaller.post('api/settings/backup', config)
  },

  restoreSettings(config) {
    return apiCaller.post('api/settings/restore', config)
  },

  // ========== RESET ==========
  resetToDefaults(config) {
    return apiCaller.post('api/settings/reset-defaults', config)
  },
})
