/**
 * CRM — store customers (باشگاه مشتریان), verified against BACK's StoreCustomerController (`/api/admin/store-customers`).
 * Read/create/update need STORE_CUSTOMER; delete, import and the Excel template/export need STORE_CUSTOMER_ADMIN.
 * Paging is 0-based (`page` from 0, `size` 1..100). Payload = res.data.data. Duplicate phone on create/update → 409.
 */
const BASE = 'api/admin/store-customers'

export default (apiCaller) => ({
  // GET, config.params {q?, marketingSms? true|false, source? IN_STORE|IMPORT, page, size} → PageResponse<StoreCustomerDTO>, newest first
  listStoreCustomers(config) {
    return apiCaller.get(BASE, config)
  },

  // GET → StoreCustomerDTO {id, firstName, lastName, phone, marketingSms, source, birthDate, description, createdAt, updatedAt}
  getStoreCustomer(id) {
    return apiCaller.get(`${BASE}/${id}`)
  },

  // POST (201), body in config.data {firstName, lastName?, phone, marketingSms?, birthDate?, description?} → StoreCustomerDTO
  createStoreCustomer(config) {
    return apiCaller.post(BASE, config)
  },

  // PUT full replace, body in config.data; marketingSms null = unchanged → StoreCustomerDTO
  updateStoreCustomer(id, config) {
    return apiCaller.put(`${BASE}/${id}`, config)
  },

  // DELETE → null (STORE_CUSTOMER_ADMIN)
  deleteStoreCustomer(id) {
    return apiCaller.delete(`${BASE}/${id}`)
  },

  // POST multipart `file` (.xlsx, caller builds the FormData, `{ data: fd }`) → {totalRows, created, skipped, errors:[{rowNumber, phone, message}]}
  importStoreCustomers(config) {
    return apiCaller.post(`${BASE}/import`, config)
  },

  // Blob GET: the empty import template (file is res.data). Consume with useFileDownload().download(..., 'store-customers-template.xlsx')
  downloadCustomerTemplate() {
    return apiCaller.get(`${BASE}/import-template`, { responseType: 'blob' })
  },

  // Blob GET: every store customer as an .xlsx in the import layout. Consume with useFileDownload().download(..., 'store-customers.xlsx')
  exportStoreCustomers() {
    return apiCaller.get(`${BASE}/export`, { responseType: 'blob' })
  },
})
