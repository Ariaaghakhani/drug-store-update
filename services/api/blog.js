// Blog. `getBlogPosts` is the old CMS (Strapi) read; the rest is the store's own public blog, verified against BACK's
// BlogPublicController (no login for reads; only published posts and approved comments). Paged reads are 0-based.
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

  // config.params {categoryId?, tagId?, q?, sort: LATEST|POPULAR, page, size} → PageResponse<BlogPostSummaryDTO>
  listPosts(config) {
    return apiCaller.get('api/blog/posts', config)
  },

  // BlogPostDetailDTO = summary + content, images[] (AttachmentDTO {url,...}), metaTitle, metaDescription; 404 for a draft
  getPost(slug) {
    return apiCaller.get(`api/blog/posts/${encodeURIComponent(slug)}`)
  },

  // config.params {page, size} → PageResponse<BlogCommentDTO {id, authorName, content, createdAt, staffReply, replies}>
  listComments(slug, config) {
    return apiCaller.get(`api/blog/posts/${encodeURIComponent(slug)}/comments`, config)
  },

  // login needed; body {content (≤2000), parentId?}; the comment shows after staff approval
  addComment(slug, config) {
    return apiCaller.post(`api/blog/posts/${encodeURIComponent(slug)}/comments`, config)
  },

  listTags() {
    return apiCaller.get('api/blog/tags')
  },

  listCategories() {
    return apiCaller.get('api/blog/categories')
  },
})
