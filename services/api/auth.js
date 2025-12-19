export default (apiCaller) => ({
  checkUser(config) {
    return apiCaller.post('api/auth/check-username', config)
  },
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
  forgotPassword(config) {
    return apiCaller.post('api/auth/forgot-password', config)
  },
  forgotPasswordOtp(config) {
    return apiCaller.post('api/auth/forgot-password/send-otp', config)
  },
  refresh() {
    return apiCaller.get('api/auth/refresh')
  },
  logout(config) {
    return apiCaller.post('api/auth/logout', config)
  },
})
