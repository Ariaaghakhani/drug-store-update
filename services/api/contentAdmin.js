/**
 * Content admin: goods review/question moderation and the store blog (posts, tags, comments), verified against BACK's
 * GoodsReviewAdminController (`/api/admin/reviews`, GOODS_REVIEW), GoodsQuestionAdminController (`/api/admin/questions`,
 * GOODS_QUESTION), BlogAdminPostController (`/api/admin/blog/posts`, BLOG_POST), BlogAdminTagController
 * (`/api/admin/blog/tags`, BLOG_TAG) and BlogAdminCommentController (`/api/admin/blog/comments`, BLOG_COMMENT).
 * Paging is 0-based (`page` from 0, `size` 1..100). Payload = res.data.data. A wrong status is 409.
 */
const REVIEWS = 'api/admin/reviews'
const QUESTIONS = 'api/admin/questions'
const BLOG_POSTS = 'api/admin/blog/posts'
const BLOG_TAGS = 'api/admin/blog/tags'
const BLOG_COMMENTS = 'api/admin/blog/comments'

export default (apiCaller) => ({
  // GET, config.params {status? PENDING|APPROVED|REJECTED, goodsId?, rating? 1..5, page, size} → PageResponse<GoodsReviewAdminDTO>, newest first
  listReviewsAdmin(config) {
    return apiCaller.get(REVIEWS, config)
  },

  // POST, no body → GoodsReviewAdminDTO. Published on the storefront and counted in the average
  approveReview(id) {
    return apiCaller.post(`${REVIEWS}/${id}/approve`)
  },

  // POST, no body → GoodsReviewAdminDTO. Hidden on the storefront
  rejectReview(id) {
    return apiCaller.post(`${REVIEWS}/${id}/reject`)
  },

  // PUT, body in config.data {reply (required, ≤1000, plain text)} replaces any earlier reply → GoodsReviewAdminDTO
  replyReview(id, config) {
    return apiCaller.put(`${REVIEWS}/${id}/reply`, config)
  },

  // DELETE → GoodsReviewAdminDTO with storeReply null
  removeReviewReply(id) {
    return apiCaller.delete(`${REVIEWS}/${id}/reply`)
  },

  // DELETE → null
  deleteReview(id) {
    return apiCaller.delete(`${REVIEWS}/${id}`)
  },

  // GET, config.params {status? PENDING|ANSWERED|REJECTED, goodsId?, privateQuestion? true|false, page, size}
  // → PageResponse<GoodsQuestionAdminDTO>. PENDING is the answer queue, oldest first; the others newest first.
  // authorName is the real name even for an anonymous question (anonymous only hides it on the storefront)
  listQuestionsAdmin(config) {
    return apiCaller.get(QUESTIONS, config)
  },

  // PUT, body in config.data {answer (required, ≤2000, plain text)} replaces any earlier answer → GoodsQuestionAdminDTO.
  // The first answer is texted to the asker; a public question shows on the storefront once answered
  answerQuestion(id, config) {
    return apiCaller.put(`${QUESTIONS}/${id}/answer`, config)
  },

  // DELETE → GoodsQuestionAdminDTO back in PENDING with answer null
  removeQuestionAnswer(id) {
    return apiCaller.delete(`${QUESTIONS}/${id}/answer`)
  },

  // POST, no body → GoodsQuestionAdminDTO (REJECTED). Never shown on the storefront
  rejectQuestion(id) {
    return apiCaller.post(`${QUESTIONS}/${id}/reject`)
  },

  // DELETE → null
  deleteQuestion(id) {
    return apiCaller.delete(`${QUESTIONS}/${id}`)
  },

  // GET, config.params {status? DRAFT|PUBLISHED, categoryId?, tagId?, q? ≤100, sort LATEST|POPULAR, page, size}
  // → PageResponse<BlogPostSummaryDTO> (any status; q switches to relevance order and ignores sort)
  listBlogPostsAdmin(config) {
    return apiCaller.get(BLOG_POSTS, config)
  },

  // GET → BlogPostDetailDTO (any status): content, images[AttachmentDTO], metaTitle, metaDescription, noIndex, seo
  getBlogPostAdmin(id) {
    return apiCaller.get(`${BLOG_POSTS}/${id}`)
  },

  // POST, body in config.data {title (required ≤200), slug ≤200 (blank = from title), excerpt ≤500, content (required, HTML),
  // author ≤100, metaTitle ≤100, metaDescription ≤300, noIndex, categoryId, tagIds[]} → 201 BlogPostDetailDTO, always DRAFT
  createBlogPost(config) {
    return apiCaller.post(BLOG_POSTS, config)
  },

  // PUT, same body as create → BlogPostDetailDTO. A blank slug keeps the current one
  updateBlogPost(id, config) {
    return apiCaller.put(`${BLOG_POSTS}/${id}`, config)
  },

  // POST, optional config.data {publishedAt} (a future time = scheduled; omitted/null = now) → BlogPostDetailDTO
  publishBlogPost(id, config) {
    return apiCaller.post(`${BLOG_POSTS}/${id}/publish`, config)
  },

  // POST, no body → BlogPostDetailDTO back in DRAFT; the post leaves the public API
  unpublishBlogPost(id) {
    return apiCaller.post(`${BLOG_POSTS}/${id}/unpublish`)
  },

  // DELETE → null (the post and its images)
  deleteBlogPost(id) {
    return apiCaller.delete(`${BLOG_POSTS}/${id}`)
  },

  // POST, no body → ApiResponse<string>: the translated result message (count of reindexed posts)
  reindexBlog() {
    return apiCaller.post(`${BLOG_POSTS}/reindex`)
  },

  // POST multipart, config.data = FormData with repeated `files` (JPG/PNG/WebP) → 201 AttachmentDTO[].
  // The cover is the primary image (attachment.setPrimary)
  uploadBlogImages(id, config) {
    return apiCaller.post(`${BLOG_POSTS}/${id}/images`, config)
  },

  // GET, unpaged → [{id, name}] in name order (tag picker for the post form and the tags tab)
  listBlogTags() {
    return apiCaller.get(BLOG_TAGS)
  },

  // POST, body in config.data {name (required ≤100, unique per store)} → 201 {id, name}; a duplicate name is 409
  createBlogTag(config) {
    return apiCaller.post(BLOG_TAGS, config)
  },

  // PUT, body in config.data {name (required ≤100)} → {id, name}; a duplicate name is 409
  updateBlogTag(id, config) {
    return apiCaller.put(`${BLOG_TAGS}/${id}`, config)
  },

  // DELETE → null; the tag is removed from every post
  deleteBlogTag(id) {
    return apiCaller.delete(`${BLOG_TAGS}/${id}`)
  },

  // GET, config.params {status? PENDING|APPROVED|REJECTED, postId?, page, size} → PageResponse<BlogCommentAdminDTO>,
  // newest first (status=PENDING is the approval queue). Replies are listed too (parentId set)
  listBlogCommentsAdmin(config) {
    return apiCaller.get(BLOG_COMMENTS, config)
  },

  // POST, no body → BlogCommentAdminDTO (APPROVED). Shows on the storefront under its post
  approveBlogComment(id) {
    return apiCaller.post(`${BLOG_COMMENTS}/${id}/approve`)
  },

  // POST, no body → BlogCommentAdminDTO (REJECTED). Never shown on the storefront
  rejectBlogComment(id) {
    return apiCaller.post(`${BLOG_COMMENTS}/${id}/reject`)
  },

  // POST, body in config.data {content (required, ≤2000, plain text)} → 201 BlogCommentAdminDTO (the store's reply,
  // shown at once). Only an APPROVED comment can be answered; a reply to a reply goes under the same top comment
  replyBlogComment(id, config) {
    return apiCaller.post(`${BLOG_COMMENTS}/${id}/reply`, config)
  },

  // DELETE → null. Soft delete of the comment and its replies
  deleteBlogComment(id) {
    return apiCaller.delete(`${BLOG_COMMENTS}/${id}`)
  },
})
