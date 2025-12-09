export default (apiCaller) => ({
  login(config) {
    return apiCaller.post('api/auth/login', config)
  },
  register(config) {
    return apiCaller.post('/auth/signup', config)
  },
  checkUser(config) {
    return apiCaller.post('api/auth/check-username', config)
  },
  logout(config) {
    return apiCaller.post('/auth/logout', config)
  },
  events(config) {
    return apiCaller.get('/events', config)
  },
})
