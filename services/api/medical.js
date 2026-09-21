/**
 * Medical Service
 * Patient management and prescriptions
 */
export default (apiCaller) => ({
  // ========== PATIENTS ==========
  listPatients(config) {
    return apiCaller.post('api/patients/list', config)
  },

  getPatient(config) {
    return apiCaller.post('api/patients/get', config)
  },

  createPatient(config) {
    return apiCaller.post('api/patients/create', config)
  },

  updatePatient(config) {
    return apiCaller.post('api/patients/update', config)
  },

  deletePatient(config) {
    return apiCaller.post('api/patients/delete', config)
  },

  // ========== PRESCRIPTIONS ==========
  listPrescriptions(config) {
    return apiCaller.post('api/prescriptions/list', config)
  },

  getPrescription(config) {
    return apiCaller.post('api/prescriptions/get', config)
  },

  createPrescription(config) {
    return apiCaller.post('api/prescriptions/create', config)
  },

  updatePrescription(config) {
    return apiCaller.post('api/prescriptions/update', config)
  },

  deletePrescription(config) {
    return apiCaller.post('api/prescriptions/delete', config)
  },

  // ========== PRESCRIPTION ITEMS ==========
  listPrescriptionItems(config) {
    return apiCaller.post('api/presc-items/list', config)
  },

  getPrescriptionItem(config) {
    return apiCaller.post('api/presc-items/get', config)
  },

  createPrescriptionItem(config) {
    return apiCaller.post('api/presc-items/create', config)
  },

  updatePrescriptionItem(config) {
    return apiCaller.post('api/presc-items/update', config)
  },

  deletePrescriptionItem(config) {
    return apiCaller.post('api/presc-items/delete', config)
  },

  // ========== PRESCRIPTION VALIDATION ==========
  validatePrescription(config) {
    return apiCaller.post('api/prescriptions/validate', config)
  },

  checkPrescriptionGoods(config) {
    return apiCaller.post('api/prescriptions/check-goods', config)
  },
})
