/**
 * Prescription Service — customer prescriptions, verified against BACK's PrescriptionCustomerController (/api/prescriptions/my)
 * and PrescriptionAdminController (/api/admin/prescriptions, module PRESCRIPTION). The `staff` flag picks the base path for the
 * calls both sides share. Customer-only calls ignore `staff`. Every JSON answer is ApiResponse: the payload is res.data.data.
 */
const base = (staff) => (staff ? 'api/admin/prescriptions' : 'api/prescriptions/my')

export default (apiCaller) => ({
  // GET, 0-based `page`, `size` 1..100, optional `status`; newest first. Staff also takes personId, insuranceId, createdFrom, createdTo, q
  listPrescriptions(staff, config) {
    return apiCaller.get(base(staff), config)
  },

  // PrescriptionDTO (staff-only fields personId, personName, personPhone, respondedById, respondedByName)
  getPrescription(staff, id) {
    return apiCaller.get(`${base(staff)}/${id}`)
  },

  // RAW blob (image or PDF): fetch with the result of this call through useFileDownload().previewUrl. 404 when hasImage is false
  imageRequest(staff, id) {
    return apiCaller.get(`${base(staff)}/${id}/image`, { responseType: 'blob' })
  },

  // RAW blob (card-to-card receipt). 404 when hasReceipt is false
  receiptRequest(staff, id) {
    return apiCaller.get(`${base(staff)}/${id}/receipt`, { responseType: 'blob' })
  },

  // Customer: no body, only SUBMITTED|AVAILABLE|PARTIALLY_AVAILABLE (else 409). Staff: optional body {reason<=500}, any status except DELIVERED
  cancelPrescription(staff, id, config) {
    return apiCaller.post(`${base(staff)}/${id}/cancel`, config)
  },

  // customer only. PrescriptionOptionsDTO {prescriptionEnabled, storeCourierEnabled, cardToCardEnabled, cardNumber, cardHolder, insurances[]}
  getPrescriptionOptions() {
    return apiCaller.get('api/prescriptions/my/options')
  },

  // customer only. multipart: patientFirstName, patientLastName, patientNationalCode (required), image or trackingCode, optional rest; 201 PrescriptionDTO
  submitPrescription(config) {
    return apiCaller.post('api/prescriptions/my', config)
  },

  // customer only. body {deliveryMethod, addressId?, courierName?, courierPhone?, paymentMethod}; AVAILABLE|PARTIALLY_AVAILABLE only (else 409)
  confirmPrescription(id, config) {
    return apiCaller.post(`api/prescriptions/my/${id}/confirm`, config)
  },

  // customer only. multipart with the field `file`; only when paymentStatus is AWAITING_RECEIPT or RECEIPT_REJECTED (else 409)
  uploadPrescriptionReceipt(id, config) {
    return apiCaller.post(`api/prescriptions/my/${id}/receipt`, config)
  },
})
