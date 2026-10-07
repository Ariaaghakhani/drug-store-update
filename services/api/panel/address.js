export default (apiCaller) => ({
  getState() {
    return apiCaller.get('/api/locations/provinces', {})
  },
  getCity(province) {
    return apiCaller.get(`/api/locations/provinces/${province.id}/cities`, {})
  },

  getAddresses(config) {
    return apiCaller.post('/api/addresses/person', config)
  },
  addAddress(config) {
    return apiCaller.post('/api/addresses/create', config)
  },
  updateAddress(config) {
    return apiCaller.post('/api/addresses/update', config)
  },
  deleteAddress(config) {
    return apiCaller.post('/api/addresses/delete', config)
  },
})
