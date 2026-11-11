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

  // ---- staff (module PRESCRIPTION). Always /api/admin/prescriptions/**, whatever the `staff` flag says ----

  // staff. PrescriptionInsuranceDTO[] (active and inactive), ordered by kind, sortOrder, name
  listInsurances() {
    return apiCaller.get('api/admin/prescriptions/insurances')
  },

  // staff. body {name (req, <=100), kind BASIC|SUPPLEMENTARY (req), sortOrder 0..10000, active}; 201; duplicate name per kind → 409
  createInsurance(config) {
    return apiCaller.post('api/admin/prescriptions/insurances', config)
  },

  // staff. same body as createInsurance; active omitted = unchanged. 409 on a duplicate name
  updateInsurance(id, config) {
    return apiCaller.put(`api/admin/prescriptions/insurances/${id}`, config)
  },

  // staff. removes the insurance from the list; earlier prescriptions keep its name
  deleteInsurance(id) {
    return apiCaller.delete(`api/admin/prescriptions/insurances/${id}`)
  },

  // staff. body {status (req) AVAILABLE|PARTIALLY_AVAILABLE|UNAVAILABLE|INVALID, note<=1000, drugPrice>=0, courierFee>=0};
  // a new answer replaces the earlier one; 409 after the customer confirmed or the prescription was cancelled
  respondPrescription(id, config) {
    return apiCaller.post(`api/admin/prescriptions/${id}/respond`, config)
  },

  // staff. RECEIPT_SUBMITTED only (else 409) → paymentStatus PAID
  approveReceipt(id) {
    return apiCaller.post(`api/admin/prescriptions/${id}/receipt/approve`)
  },

  // staff. body {reason (req, <=500)}, shown to the customer; RECEIPT_SUBMITTED only (else 409)
  rejectReceipt(id, config) {
    return apiCaller.post(`api/admin/prescriptions/${id}/receipt/reject`, config)
  },

  // staff. CONFIRMED with PICKUP or CUSTOMER_COURIER; CARD_TO_CARD needs PAID first (else 409) → READY
  markReady(id) {
    return apiCaller.post(`api/admin/prescriptions/${id}/ready`)
  },

  // staff. CONFIRMED with STORE_COURIER; CARD_TO_CARD needs PAID first (else 409) → SHIPPED
  markShipped(id) {
    return apiCaller.post(`api/admin/prescriptions/${id}/ship`)
  },

  // staff. READY or SHIPPED only (else 409) → DELIVERED; an ON_DELIVERY payment becomes PAID
  markDelivered(id) {
    return apiCaller.post(`api/admin/prescriptions/${id}/deliver`)
  },

  // staff. DELETE /api/admin/prescriptions/{id}: soft delete with the photo and the receipts. Returns ApiResponse<null>
  deletePrescription(id) {
    return apiCaller.delete(`api/admin/prescriptions/${id}`)
  },
})
