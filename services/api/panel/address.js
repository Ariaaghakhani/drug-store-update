export default (apiCaller) => ({
  getState() {
    return apiCaller.get('/api/addresses/provinces', {})
  },
  getCity(province) {
    const config = {
      data: {
        provinceId: province.id,
        provinceSlug: province.slug,
      },
    }
    return apiCaller.post('/api/addresses/cities/by-province-id', config)
  },

  getAddresses(config) {
    return apiCaller.post('/api/addresses/person', config)
  },
  addAddress(config) {
    return apiCaller.post('/api/addresses/create', config)
  },
})
