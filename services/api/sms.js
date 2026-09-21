/**
 * SMS Service
 * SMS notifications and messaging
 */
export default (apiCaller) => ({
  // ========== SMS OPERATIONS ==========
  sendSms(config) {
    return apiCaller.post('api/sms/send', config)
  },

  sendBulkSms(config) {
    return apiCaller.post('api/sms/send-bulk', config)
  },

  // ========== SMS HISTORY ==========
  listSmsMessages(config) {
    return apiCaller.post('api/sms/messages', config)
  },

  getSmsMessage(config) {
    return apiCaller.post('api/sms/message', config)
  },

  // ========== SMS STATUS ==========
  getSmsStatus(config) {
    return apiCaller.post('api/sms/status', config)
  },

  // ========== SMS TEMPLATES ==========
  listSmsTemplates(config) {
    return apiCaller.post('api/sms/templates/list', config)
  },

  createSmsTemplate(config) {
    return apiCaller.post('api/sms/templates/create', config)
  },

  updateSmsTemplate(config) {
    return apiCaller.post('api/sms/templates/update', config)
  },

  deleteSmsTemplate(config) {
    return apiCaller.post('api/sms/templates/delete', config)
  },

  // ========== OTP ==========
  generateOtp(config) {
    return apiCaller.post('api/sms/otp/generate', config)
  },

  verifyOtp(config) {
    return apiCaller.post('api/sms/otp/verify', config)
  },

  resendOtp(config) {
    return apiCaller.post('api/sms/otp/resend', config)
  },

  // ========== SMS CONFIGURATION ==========
  getSmsConfig(config) {
    return apiCaller.post('api/sms/config', config)
  },

  updateSmsConfig(config) {
    return apiCaller.post('api/sms/config/update', config)
  },
})
