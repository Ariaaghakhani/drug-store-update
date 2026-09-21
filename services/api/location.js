/**
 * Location Service
 * Address management and location data
 */
export default (apiCaller) => ({
  // ========== ADDRESSES ==========
  listAddresses(config) {
    return apiCaller.post('api/addresses/list', config)
  },

  getAddress(config) {
    return apiCaller.post('api/addresses/get', config)
  },

  createAddress(config) {
    return apiCaller.post('api/addresses/create', config)
  },

  updateAddress(config) {
    return apiCaller.post('api/addresses/update', config)
  },

  deleteAddress(config) {
    return apiCaller.post('api/addresses/delete', config)
  },

  // ========== PROVINCES ==========
  listProvinces(config) {
    return apiCaller.post('api/provinces/list', config)
  },

  getProvince(config) {
    return apiCaller.post('api/provinces/get', config)
  },

  // ========== CITIES ==========
  listCities(config) {
    return apiCaller.post('api/cities/list', config)
  },

  getCity(config) {
    return apiCaller.post('api/cities/get', config)
  },

  getCitiesByProvince(config) {
    return apiCaller.post('api/cities/by-province', config)
  },
})
