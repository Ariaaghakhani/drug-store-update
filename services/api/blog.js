export default (apiCaller) => ({
  getBlogPosts(config) {
    return apiCaller.get('/api/blogs', {
      ...config,
      params: {
        populate: '*',
      },
      instance: 'cms',
    })
  },
})
