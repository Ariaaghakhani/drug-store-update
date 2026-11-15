/**
 * Content admin: goods review/question moderation and the store blog (posts, tags, comments), verified against BACK's
 * GoodsReviewAdminController (`/api/admin/reviews`, GOODS_REVIEW), GoodsQuestionAdminController (`/api/admin/questions`,
 * GOODS_QUESTION), BlogAdminPostController (`/api/admin/blog/posts`, BLOG_POST), BlogAdminTagController
 * (`/api/admin/blog/tags`, BLOG_TAG), BlogAdminCommentController (`/api/admin/blog/comments`, BLOG_COMMENT),
 * ContactAdminController (`/api/admin/contact-messages`, CONTACT), ContactSettingsController (`/api/admin/contact-settings`,
 * CONTACT), AboutUsAdminController (`/api/admin/about-us`, ABOUT_US), ReturnPolicyAdminController
 * (`/api/admin/return-policy`, RETURN_POLICY) and TermsAdminController / TermsAcceptanceAdminController
 * (`/api/admin/terms`, `/api/admin/terms-acceptances`, TERMS).
 * Paging is 0-based (`page` from 0, `size` 1..100). Payload = res.data.data. A wrong status is 409.
 */
const REVIEWS = 'api/admin/reviews'
const QUESTIONS = 'api/admin/questions'
const BLOG_POSTS = 'api/admin/blog/posts'
const BLOG_TAGS = 'api/admin/blog/tags'
const BLOG_COMMENTS = 'api/admin/blog/comments'
const CONTACT_MESSAGES = 'api/admin/contact-messages'
const CONTACT_SETTINGS = 'api/admin/contact-settings'
const ABOUT_US = 'api/admin/about-us'
const RETURN_POLICY = 'api/admin/return-policy'
const TERMS = 'api/admin/terms'
const TERMS_ACCEPTANCES = 'api/admin/terms-acceptances'

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

  // GET, config.params {status? NEW|READ|REPLIED|CLOSED, q? ≤100 (subject, name, email or phone), page, size}
  // → PageResponse<ContactMessageResponseDTO>, newest first
  listContactMessages(config) {
    return apiCaller.get(CONTACT_MESSAGES, config)
  },

  // GET → ContactMessageResponseDTO
  getContactMessage(id) {
    return apiCaller.get(`${CONTACT_MESSAGES}/${id}`)
  },

  // POST, body in config.data {status (required NEW|READ|REPLIED|CLOSED)} → ContactMessageResponseDTO
  setContactMessageStatus(id, config) {
    return apiCaller.post(`${CONTACT_MESSAGES}/${id}/status`, config)
  },

  // POST, optional config.data {category TECHNICAL|FINANCIAL|GENERAL, priority LOW|MEDIUM|HIGH} (default GENERAL, MEDIUM)
  // → ContactMessageResponseDTO with ticketId; the message is closed. 400 = sender is not a store user, 409 = already converted
  convertContactToTicket(id, config) {
    return apiCaller.post(`${CONTACT_MESSAGES}/${id}/convert-to-ticket`, config)
  },

  // DELETE → null
  deleteContactMessage(id) {
    return apiCaller.delete(`${CONTACT_MESSAGES}/${id}`)
  },

  // GET → ContactNotifySettingsDTO {phones[]} (the store's SMS recipients for a new contact message; unset → [])
  getContactSettings() {
    return apiCaller.get(CONTACT_SETTINGS)
  },

  // PUT, body in config.data {phones: string[] ≤5, each an Iranian mobile 09…} replaces the list → ContactNotifySettingsDTO.
  // An empty list turns the SMS off
  saveContactSettings(config) {
    return apiCaller.put(CONTACT_SETTINGS, config)
  },

  // GET → AboutUsDTO {id (null = never saved), title, content, mission, vision, contactEmail, contactPhone, address,
  // logoUrl, workingHours, instagram, telegram, whatsapp, latitude, longitude, active, defaultText, updatedAt}
  getAboutUsAdmin() {
    return apiCaller.get(ABOUT_US)
  },

  // PUT, body in config.data = AboutUsRequestDTO, a full replace. title (required ≤200), content (required, HTML ≤100000),
  // mission/vision ≤2000, contactEmail (email), contactPhone [0-9+\- ]{0,50}, address/logoUrl ≤255, workingHours ≤500,
  // socials ≤255, latitude −90..90, longitude −180..180; active null = shown → AboutUsDTO
  saveAboutUs(config) {
    return apiCaller.put(ABOUT_US, config)
  },

  // DELETE → null. 404 when the store never saved an About us page
  deleteAboutUs() {
    return apiCaller.delete(ABOUT_US)
  },

  // GET → ReturnPolicyDTO {id (null = default text not saved yet), title, content, version, active, defaultText,
  // publishedAt, updatedAt}; the current version of this store
  getReturnPolicyAdmin() {
    return apiCaller.get(RETURN_POLICY)
  },

  // GET → ReturnPolicyDTO[] newest first. Only the active one is shown to customers and accepted at checkout
  listReturnPolicyVersions() {
    return apiCaller.get(`${RETURN_POLICY}/versions`)
  },

  // PUT, body in config.data {title (required ≤200), content (required, HTML ≤100000), active (null = publish and archive the
  // previous version, false = saved but hidden)} → ReturnPolicyDTO. Changed text is a new version
  saveReturnPolicy(config) {
    return apiCaller.put(RETURN_POLICY, config)
  },

  // DELETE → ReturnPolicyDTO: publishes the platform default text (with the store name and return deadline) as a new version
  resetReturnPolicy() {
    return apiCaller.delete(RETURN_POLICY)
  },

  // GET, config.params {type? TERMS_OF_USE|PRIVACY_POLICY|REFUND_POLICY, status? DRAFT|PUBLISHED|ARCHIVED} → TermsAndConditionsDTO[]
  // (unpaged, every status, newest first)
  listTermsAdmin(config) {
    return apiCaller.get(TERMS, config)
  },

  // GET → TermsAndConditionsDTO (any status)
  getTermsAdmin(id) {
    return apiCaller.get(`${TERMS}/${id}`)
  },

  // POST, body in config.data {type (required), title (required ≤200), version (required ≤50, unique per type → 409),
  // content (required, HTML ≤200000), effectiveDate? (ISO date, shown only)} → 201 TermsAndConditionsDTO, always DRAFT
  createTerms(config) {
    return apiCaller.post(TERMS, config)
  },

  // PUT, same body as create, DRAFT only (a published or archived version → 409) → TermsAndConditionsDTO
  updateTerms(id, config) {
    return apiCaller.put(`${TERMS}/${id}`, config)
  },

  // POST, no body → TermsAndConditionsDTO (PUBLISHED). The previous published version of the type is archived and
  // customers get the new-version dialog
  publishTerms(id) {
    return apiCaller.post(`${TERMS}/${id}/publish`)
  },

  // POST, no body → TermsAndConditionsDTO back in ARCHIVED; that type has no visible version until the next publish
  unpublishTerms(id) {
    return apiCaller.post(`${TERMS}/${id}/unpublish`)
  },

  // DELETE → null. A PUBLISHED version cannot be deleted (409)
  deleteTerms(id) {
    return apiCaller.delete(`${TERMS}/${id}`)
  },

  // GET, config.params {userId} (required) → TermsAcceptanceDTO[] newest first: which version the user accepted, when and from
  // where (REGISTRATION, CHECKOUT, PROMPT or PANEL_LOGIN). Kept as evidence, so nothing here is deleted
  listTermsAcceptances(config) {
    return apiCaller.get(TERMS_ACCEPTANCES, config)
  },
})
