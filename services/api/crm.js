/**
 * CRM — store customers (باشگاه مشتریان), verified against BACK's StoreCustomerController (`/api/admin/store-customers`).
 * Read/create/update need STORE_CUSTOMER; delete, import and the Excel template/export need STORE_CUSTOMER_ADMIN.
 * Paging is 0-based (`page` from 0, `size` 1..100). Payload = res.data.data. Duplicate phone on create/update → 409.
 */
const BASE = 'api/admin/store-customers'

/**
 * SMS (C16, 2026-11-14), verified against BACK's StoreSmsAccountController (`/api/admin/sms-account`, module SMS_ACCOUNT)
 * and SmsCampaignController (`/api/admin/sms-campaigns`, module SMS_CAMPAIGN). Both answer ApiResponse (payload =
 * res.data.data); campaign lists are 0-based (`page` from 0, `size` 1..100).
 */
const SMS_ACCOUNT = 'api/admin/sms-account'
const SMS_CAMPAIGNS = 'api/admin/sms-campaigns'

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

  // ---------- SMS account (the store's own Kavenegar account) ----------

  // GET → StoreSmsAccountDTO {allowed, configured, active, inUse, apiKeyHint, senderNumber, marketingSenderNumber,
  // problem INVALID_KEY|ACCOUNT_DISABLED|NO_CREDIT|INVALID_SENDER|IP_NOT_ALLOWED|TRIAL_ACCOUNT|null, problemMessage, problemAt}.
  // Never carries the key; `credit` is only in the save response. A store without an account comes back configured=false, active=false
  getSmsAccount() {
    return apiCaller.get(SMS_ACCOUNT)
  },

  // PUT, body in config.data {apiKey ≤200 (empty = keep the saved key; required the first time), senderNumber (req) \d{4,20},
  // marketingSenderNumber (\d{4,20})?, active (null = on)} → StoreSmsAccountDTO incl. credit. BACK checks the key with Kavenegar first.
  // 403 sms.account.notAllowed while the platform admin has not allowed own accounts
  saveSmsAccount(config) {
    return apiCaller.put(SMS_ACCOUNT, config)
  },

  // POST → SmsAccountCreditDTO {remainCredit (Rial), expireDate, type}. 400 sms.account.not.set before an account is saved
  checkSmsAccount() {
    return apiCaller.post(`${SMS_ACCOUNT}/check`)
  },

  // POST, body in config.data {phone 09\d{9} (req), marketing (default false: the marketing line)} → null. Costs the store's own credit.
  // 400 sms.account.notInUse when the account is switched off; a Kavenegar account problem comes back as its translated message
  testSmsAccount(config) {
    return apiCaller.post(`${SMS_ACCOUNT}/test`, config)
  },

  // DELETE → null. The key is erased and the store goes back to the platform account and its monthly quota
  deleteSmsAccount() {
    return apiCaller.delete(SMS_ACCOUNT)
  },

  // ---------- SMS campaigns ----------

  // GET → SmsQuotaDTO {tenantCode, period '1405/07', monthlyQuota (0 = campaigns off), used, remaining, ownAccountAllowed,
  // unlimited (own account in use: no cap), ownAccountProblem (translated text or null)}
  getCampaignUsage() {
    return apiCaller.get(`${SMS_CAMPAIGNS}/usage`)
  },

  // GET, config.params {page, size} → PageResponse<SmsCampaignDTO>, newest first. SmsCampaignDTO {id, title, message, fullText, parts,
  // audience STORE_CUSTOMERS|ONLINE_CUSTOMERS|ALL, kind MANUAL|BIRTHDAY, occasionDate, discountCodeId, ownAccount,
  // status QUEUED|SENDING|DONE|CANCELLED, recipientCount, sentCount, failedCount, cancelledCount, pendingCount, createdBy,
  // createdAt, scheduledAt, startedAt, finishedAt} (dates are local date-times without a zone)
  listCampaigns(config) {
    return apiCaller.get(SMS_CAMPAIGNS, config)
  },

  // GET → SmsCampaignDTO (404 sms.campaign.not.found)
  getCampaign(id) {
    return apiCaller.get(`${SMS_CAMPAIGNS}/${id}`)
  },

  // GET, config.params {status? PENDING|SENT|FAILED|CANCELLED, page, size (default 50, max 100)} → PageResponse<{id, storeCustomerId,
  // personId, phone, name, text, status, providerStatus, error, sentAt}>, in send order
  listCampaignRecipients(id, config) {
    return apiCaller.get(`${SMS_CAMPAIGNS}/${id}/recipients`, config)
  },

  // POST → SmsCampaignDTO. Only QUEUED or SENDING; a finished or cancelled campaign answers 409 sms.campaign.notActive
  cancelCampaign(id) {
    return apiCaller.post(`${SMS_CAMPAIGNS}/${id}/cancel`)
  },

  // POST → SmsCampaignDTO. Moves FAILED recipients back to PENDING; a DONE campaign becomes QUEUED again.
  // 409 when cancelled (sms.campaign.cancelled) or when no recipient failed (sms.campaign.noFailed)
  retryCampaignFailed(id) {
    return apiCaller.post(`${SMS_CAMPAIGNS}/${id}/retry-failed`)
  },

  // POST, body in config.data {message (req ≤500), audience? (default STORE_CUSTOMERS), discountCodeId?} →
  // {fullText, characters, parts, recipientCount, totalParts}. fullText = message + the store footer
  previewCampaign(config) {
    return apiCaller.post(`${SMS_CAMPAIGNS}/preview`, config)
  },

  // POST, same body as previewCampaign → a translated sentence «پیام به 09… ارسال شد» (the full text goes only to the logged-in
  // user's own mobile and counts against the quota; 400 sms.campaign.test.noMobile when the username is not a mobile)
  testCampaign(config) {
    return apiCaller.post(`${SMS_CAMPAIGNS}/test`, config)
  },

  // POST (201), body in config.data {title (req ≤100), message (req ≤500), audience?, discountCodeId?, scheduledAt? (local ISO
  // yyyy-MM-ddTHH:mm:ss, in the future, ≤90 days, outside the quiet hours; empty = now)} → SmsCampaignDTO.
  // 400: no recipient, quota too small / campaigns off, bad time, discount-code mismatch
  createCampaign(config) {
    return apiCaller.post(SMS_CAMPAIGNS, config)
  },
})
