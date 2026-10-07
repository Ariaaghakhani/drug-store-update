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
})
