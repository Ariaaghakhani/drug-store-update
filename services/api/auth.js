export default (apiCaller) => ({
  login(config) {
    return apiCaller.post('api/auth/login', config)
  },
  register(config) {
    return apiCaller.post('api/auth/register/send-otp', config)
  },
  submitOtp(config, mode) {
    if (mode === 'login') {
      this.login(config)
    } else {
      this.register(config)
    }
  },
  checkUser(config) {
    return apiCaller.post('api/auth/check-username', config)
  },
  logout(config) {
    return apiCaller.post('api/auth/logout', config)
  },
})
