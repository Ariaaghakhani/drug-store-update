/**
 * Content moderation for the storefront's goods reviews and questions, verified against BACK's GoodsReviewAdminController
 * (`/api/admin/reviews`, module GOODS_REVIEW) and GoodsQuestionAdminController (`/api/admin/questions`, module GOODS_QUESTION).
 * Paging is 0-based (`page` from 0, `size` 1..100). Payload = res.data.data. A wrong status is 409.
 */
const REVIEWS = 'api/admin/reviews'
const QUESTIONS = 'api/admin/questions'

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
})
