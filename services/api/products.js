export default (apiCaller) => ({
  fetchProductsList(config) {
    return apiCaller.post(`api/goods/list`, config)
  },
})
