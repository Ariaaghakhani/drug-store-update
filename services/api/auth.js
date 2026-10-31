export default (apiCaller) => ({
  login(config) {
    return apiCaller.post('api/auth/login', config)
  },
  sendRegisterOtp(config) {
    return apiCaller.post('api/auth/register/send-otp', config)
  },
  loginOtp(config) {
    return apiCaller.post('api/auth/login/verify-otp', config)
  },
  register(config) {
    return apiCaller.post('api/auth/register/verify-otp', config)
  },
  submitOtp(config, mode) {
    if (mode === 'login') {
      this.login(config)
    } else {
      this.register(config)
    }
  },
  forgotPassword(config) {
    return apiCaller.post('api/auth/forgot-password', config)
  },
  forgotPasswordOtp(config) {
    return apiCaller.post('api/auth/forgot-password/send-otp', config)
  },
  checkUser(config) {
    return apiCaller.post('api/auth/check-username', config)
  },
  logout(config) {
    return apiCaller.post('api/auth/logout', config)
  },
  changePassword(config) {
    return apiCaller.post('api/auth/me/password', config)
  },
  fetchUser(config) {
    return apiCaller.get('api/auth/me', config)
  },
  sendCurrentPhoneOtp(config) {
    return apiCaller.post('api/auth/me/phone/current/send-otp', config)
  },
  verifyCurrentPhoneOtp(config) {
    return apiCaller.post('api/auth/me/phone/current/verify-otp', config)
  },
  sendNewPhoneOtp(config) {
    return apiCaller.post('api/auth/me/phone/new/send-otp', config)
  },
  verifyNewPhoneOtp(config) {
    return apiCaller.post('api/auth/me/phone/new/verify-otp', config)
  },

  // ========== SESSIONS (own sessions only) ==========
  listSessions(config) {
    return apiCaller.get('api/auth/me/sessions', config)
  },

  revokeSession(id) {
    return apiCaller.delete(`api/auth/me/sessions/${id}`)
  },

  revokeAllSessions() {
    return apiCaller.post('api/auth/me/sessions/revoke-all')
  },

  // ========== LOGIN HISTORY (own rows only) ==========
  getLoginHistory(config) {
    return apiCaller.get('api/auth/me/login-history', config)
  },

  // ========== SECURITY NOTIFICATION PREFERENCES (own settings only) ==========
  getSecurityNotifications(config) {
    return apiCaller.get('api/auth/me/security-notifications', config)
  },

  // CORS only allows GET/POST/PUT/DELETE/OPTIONS — PUT here, never PATCH.
  updateSecurityNotification(config) {
    return apiCaller.put('api/auth/me/security-notifications', config)
  },

  // ========== EMAIL (own account; verified against BACK, dev mock code 12345) ==========
  // body {email}
  sendEmailOtp(config) {
    return apiCaller.post('api/auth/me/email/send-otp', config)
  },

  // body {email, otpCode}
  verifyEmailOtp(config) {
    return apiCaller.post('api/auth/me/email/verify-otp', config)
  },

  removeEmail() {
    return apiCaller.delete('api/auth/me/email')
  },
})
