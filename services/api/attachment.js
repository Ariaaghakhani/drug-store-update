/**
 * Attachment Service
 * File and attachment management
 */
export default (apiCaller) => ({
  // ========== ATTACHMENTS ==========
  listAttachments(config) {
    return apiCaller.post('api/attachments/list', config)
  },

  getAttachment(config) {
    return apiCaller.post('api/attachments/get', config)
  },

  uploadAttachment(config) {
    return apiCaller.post('api/attachments/upload', config)
  },

  deleteAttachment(config) {
    return apiCaller.post('api/attachments/delete', config)
  },

  downloadAttachment(config) {
    return apiCaller.get('api/attachments/download', config)
  },

  // ========== BULK OPERATIONS ==========
  uploadMultiple(config) {
    return apiCaller.post('api/attachments/upload-multiple', config)
  },

  deleteMultiple(config) {
    return apiCaller.post('api/attachments/delete-multiple', config)
  },

  // ========== ATTACHMENT METADATA ==========
  updateAttachmentMetadata(config) {
    return apiCaller.post('api/attachments/update-metadata', config)
  },

  getAttachmentMetadata(config) {
    return apiCaller.post('api/attachments/metadata', config)
  },
})
