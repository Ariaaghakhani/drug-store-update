# Complete API Endpoints Summary

**Frontend**: Daro Plus (Nuxt 3)  
**Backend**: Pouyan Platform v2.0.0  
**Date**: 2026-09-21  
**Status**: All services ready to use

---

## 🎯 Quick Usage

All endpoints are accessible via the `$api` object in components:

```vue
<script setup>
// Example usage
const { data } = await $api.goods.listGoods({ data: { page: 1, pageSize: 20 } })
const order = await $api.orders.getOrder({ data: { id: 123 } })
await $api.payments.verifyPayment({ data: { referenceId: 'REF123' } })
</script>
```

---

## 📚 Service Modules

### 1. Authentication (`$api.auth`)

```javascript
// Login & Logout
.login({ data: { phone, password, loginType } })
.verifyOtp({ data: { mobile, otp } })
.logout({ data: {} })

// Registration
.sendRegisterOtp({ data: { mobile } })
.register({ data: { mobile, otp, firstName, lastName, password } })

// Token Management
.refreshToken()

// Password
.changePassword({ data: { oldPassword, newPassword } })
.sendForgotPasswordOtp({ data: { mobile } })
.resetPassword({ data: { mobile, otp, newPassword } })

// User Profile
.fetchUser()
.checkUsername({ data: { mobile } })

// Admin
.checkAdminAccess()
```

---

### 2. Products/Goods (`$api.goods`)

```javascript
// CRUD
.createGoods({ data: { nameEn, nameFa, price, categoryId } })
.updateGoods({ data: { id, ...updates } })
.getGoods({ data: { id } })
.deleteGoods({ data: { id } })

// Listing & Filtering
.listGoods({ data: { page, pageSize, sort, sortType } })
.filterGoods({ data: { nameFa, nameEn, brandId, categoryIds, tagIds } })

// Bulk
.importGoods({ data: formData }) // Excel file

// Tags
.getTags({ data: { page, pageSize } })
.createTag({ data: { name, description } })
.updateTag({ data: { id, name } })
.deleteTag({ data: { id } })

// Product Batches
.getProductBatches({ data: { page, pageSize } })
.createProductBatch({ data: { goodsId, batchNumber, expiryDate } })
.updateProductBatch({ data: { id, ...updates } })
.deleteProductBatch({ data: { id } })
```

---

### 3. Orders (`$api.orders`)

```javascript
// Orders
.listOrders({ data: { page, pageSize } })
.getOrder({ data: { id } })
.createOrder({ data: { customerId, orderItems, totalPrice } })
.updateOrder({ data: { id, status, notes } })
.deleteOrder({ data: { id } })

// Order Items
.listOrderItems({ data: { page, pageSize } })
.getOrderItem({ data: { id } })
.createOrderItem({ data: { orderId, goodsId, quantity, unitPrice } })
.updateOrderItem({ data: { id, ...updates } })
.deleteOrderItem({ data: { id } })

// Invoices
.listInvoices({ data: { page, pageSize } })
.getInvoice({ data: { id } })
.createInvoice({ data: { orderId } })
.updateInvoice({ data: { id, ...updates } })
.deleteInvoice({ data: { id } })

// Purchase Orders
.listPurchaseOrders({ data: { page, pageSize } })
.getPurchaseOrder({ data: { id } })
.createPurchaseOrder({ data: { supplierId, items, totalAmount } })
.updatePurchaseOrder({ data: { id, status } })
.deletePurchaseOrder({ data: { id } })

// Purchase Order Items
.listPurchaseOrderItems({ data: { page, pageSize } })
.getPurchaseOrderItem({ data: { id } })
.createPurchaseOrderItem({ data: { purchaseOrderId, goodsId, quantity } })
.updatePurchaseOrderItem({ data: { id, ...updates } })
.deletePurchaseOrderItem({ data: { id } })
```

---

### 4. Payments (`$api.payments`)

```javascript
// Checkout
.initiateCheckout({ data: { orderId, amount, callbackUrl } })

// Verification
.verifyPayment({ data: { referenceId, transactionId, status } })
.getPaymentStatus({ data: { orderId } })

// History
.listPayments({ data: { page, pageSize } })
.getPayment({ data: { id } })

// Mock Bank (Testing)
.mockBankCallback({ data: { authority, status } })
.initiateMockPayment({ data: { orderId, amount } })
```

---

### 5. Inventory (`$api.inventory`)

```javascript
// Inventory
.listInventory({ data: { page, pageSize } })
.getInventory({ data: { id } })
.createInventory({ data: { goodsId, warehouseId, quantity } })
.updateInventory({ data: { id, quantity } })
.deleteInventory({ data: { id } })

// Warehouses
.listWarehouses({ data: { page, pageSize } })
.getWarehouse({ data: { id } })
.createWarehouse({ data: { nameEn, nameFa, city, province, address } })
.updateWarehouse({ data: { id, ...updates } })
.deleteWarehouse({ data: { id } })

// Adjustments
.adjustInventory({ data: { goodsId, warehouseId, quantity, reason } })
.transferStock({ data: { goodsId, fromWarehouse, toWarehouse, quantity } })
```

---

### 6. Catalog/Categories (`$api.catalog`)

```javascript
// Catalogs (Generic lookup)
.listCatalogs({ data: { page, pageSize } })
.getCatalog({ data: { id } })
.createCatalog({ data: { name, type } })
.updateCatalog({ data: { id, ...updates } })
.deleteCatalog({ data: { id } })

// Categories
.listCategories({ data: { page, pageSize } })
.getCategory({ data: { id } })
.createCategory({ data: { nameEn, nameFa, parentCategoryId } })
.updateCategory({ data: { id, ...updates } })
.deleteCategory({ data: { id } })

// Category Scopes (Hierarchy)
.listCategoryScopes({ data: { page, pageSize } })
.getCategoryScope({ data: { id } })
.createCategoryScope({ data: { categoryId, scopeType } })
.updateCategoryScope({ data: { id, ...updates } })
.deleteCategoryScope({ data: { id } })
```

---

### 7. Analytics & Dashboard (`$api.analytics`)

```javascript
// Dashboard
.getDashboardSummary({ data: { dateFrom, dateTo } })
.getDashboardKpi({ data: { metric, dateFrom, dateTo } })
.getSalesChart({ data: { dateFrom, dateTo, groupBy } })
.getRevenueChart({ data: { dateFrom, dateTo } })
.getCategoryChart({ data: { dateFrom, dateTo } })
.getExpiringGoods({ data: { daysUntilExpiry } })

// Reports
.listReports({ data: { page, pageSize } })
.getReport({ data: { id } })
.generateReport({ data: { type, dateFrom, dateTo, filters } })
.downloadReport({ data: { id } })

// Report Management
.listReportTemplates({ data: { page, pageSize } })
.createReportTemplate({ data: { name, templateData } })
.updateReportTemplate({ data: { id, ...updates } })
.deleteReportTemplate({ data: { id } })
.scheduleReport({ data: { reportId, schedule } })
```

---

### 8. Communication (`$api.communication`)

```javascript
// Support Tickets
.listTickets({ data: { page, pageSize, status } })
.getTicket({ data: { id } })
.createTicket({ data: { title, description, priority } })
.updateTicket({ data: { id, status, ...updates } })
.deleteTicket({ data: { id } })

// Ticket Messages
.listTicketMessages({ data: { ticketId, page, pageSize } })
.getTicketMessage({ data: { id } })
.createTicketMessage({ data: { ticketId, message } })
.updateTicketMessage({ data: { id, message } })
.deleteTicketMessage({ data: { id } })

// Reviews
.listReviews({ data: { goodsId, page, pageSize } })
.getReview({ data: { id } })
.createReview({ data: { goodsId, rating, title, content } })
.updateReview({ data: { id, ...updates } })
.deleteReview({ data: { id } })

// Review Replies
.listReplies({ data: { reviewId, page, pageSize } })
.createReply({ data: { reviewId, message } })
.updateReply({ data: { id, message } })
.deleteReply({ data: { id } })

// Blog Posts
.listBlogPosts({ data: { page, pageSize } })
.getBlogPost({ data: { id } })
.createBlogPost({ data: { titleEn, titleFa, content } })
.updateBlogPost({ data: { id, ...updates } })
.deleteBlogPost({ data: { id } })

// Contact Messages
.listContactMessages({ data: { page, pageSize } })
.getContactMessage({ data: { id } })
.createContactMessage({ data: { name, email, subject, message } })
.updateContactMessage({ data: { id, status } })
.deleteContactMessage({ data: { id } })

// About Us & Terms
.getAboutUs()
.updateAboutUs({ data: { content } })
.getTermsAndConditions()
.updateTermsAndConditions({ data: { content } })
```

---

### 9. Users & Roles (`$api.user`)

```javascript
// Users
.listUsers({ data: { page, pageSize } })
.getUser({ data: { id } })
.createUser({ data: { firstName, lastName, phone, email } })
.updateUser({ data: { id, ...updates } })
.deleteUser({ data: { id } })

// Roles
.listRoles({ data: { page, pageSize } })
.getRole({ data: { id } })
.createRole({ data: { name, description } })
.updateRole({ data: { id, ...updates } })
.deleteRole({ data: { id } })

// User Roles
.listUserRoles({ data: { userId } })
.assignRole({ data: { userId, roleId } })
.removeRole({ data: { userId, roleId } })

// Permissions
.listPermissions({ data: { page, pageSize } })
.getPermission({ data: { id } })

// Role Permissions
.listRolePermissions({ data: { roleId } })
.assignPermissionToRole({ data: { roleId, permissionId } })
.removePermissionFromRole({ data: { roleId, permissionId } })

// Endpoint Permissions
.listEndpointPermissions({ data: { page, pageSize } })

// Role Endpoint Permissions
.assignEndpointToRole({ data: { roleId, endpointId } })
.removeEndpointFromRole({ data: { roleId, endpointId } })

// Password Policies
.getPasswordPolicy()
.updatePasswordPolicy({ data: { minLength, requireSpecial, requireNumbers } })
```

---

### 10. Location (`$api.location`)

```javascript
// Addresses
.listAddresses({ data: { userId, page, pageSize } })
.getAddress({ data: { id } })
.createAddress({ data: { recipientName, street, city, province, zipCode } })
.updateAddress({ data: { id, ...updates } })
.deleteAddress({ data: { id } })

// Provinces
.listProvinces({ data: { page, pageSize } })
.getProvince({ data: { id } })

// Cities
.listCities({ data: { provinceId, page, pageSize } })
.getCity({ data: { id } })
.getCitiesByProvince({ data: { provinceId } })
```

---

### 11. Search (`$api.search`)

```javascript
// Global Search
.globalSearch({ data: { query, type } })

// Goods Search (Elasticsearch)
.searchGoods({ data: { searchTerm, filters, page, pageSize } })

// Order Search (Elasticsearch)
.searchOrders({ data: { query, filters, page, pageSize } })

// Reindexing
.reindexGoods()
.reindexOrders()

// Elasticsearch Backup
.backupElasticsearch()
.restoreElasticsearch({ data: { backupId } })
.getBackupStatus()
```

---

### 12. Organization (`$api.organization`)

```javascript
// Organizations
.listOrganizations({ data: { page, pageSize } })
.getOrganization({ data: { id } })
.createOrganization({ data: { nameEn, nameFa, email, phone } })
.updateOrganization({ data: { id, ...updates } })
.deleteOrganization({ data: { id } })

// Suppliers
.listSuppliers({ data: { page, pageSize } })
.getSupplier({ data: { id } })
.createSupplier({ data: { nameEn, nameFa, email, mobile } })
.updateSupplier({ data: { id, ...updates } })
.deleteSupplier({ data: { id } })

// Supplier Ratings
.rateSupplier({ data: { supplierId, rating, comment } })
.getSupplierRating({ data: { supplierId } })
```

---

### 13. Medical (`$api.medical`)

```javascript
// Patients
.listPatients({ data: { page, pageSize } })
.getPatient({ data: { id } })
.createPatient({ data: { firstName, lastName, phone, nationalId } })
.updatePatient({ data: { id, ...updates } })
.deletePatient({ data: { id } })

// Prescriptions
.listPrescriptions({ data: { patientId, page, pageSize } })
.getPrescription({ data: { id } })
.createPrescription({ data: { patientId, prescriptionDate } })
.updatePrescription({ data: { id, ...updates } })
.deletePrescription({ data: { id } })

// Prescription Items
.listPrescriptionItems({ data: { prescriptionId } })
.getPrescriptionItem({ data: { id } })
.createPrescriptionItem({ data: { prescriptionId, goodsId, quantity } })
.updatePrescriptionItem({ data: { id, ...updates } })
.deletePrescriptionItem({ data: { id } })

// Validation
.validatePrescription({ data: { prescriptionId } })
.checkPrescriptionGoods({ data: { prescriptionId } })
```

---

### 14. Attachments (`$api.attachment`)

```javascript
// Attachments
.listAttachments({ data: { page, pageSize } })
.getAttachment({ data: { id } })
.uploadAttachment({ data: formData }) // File upload
.deleteAttachment({ data: { id } })
.downloadAttachment({ data: { id } })

// Bulk
.uploadMultiple({ data: formData }) // Multiple files
.deleteMultiple({ data: { ids } })

// Metadata
.updateAttachmentMetadata({ data: { id, ...metadata } })
.getAttachmentMetadata({ data: { id } })
```

---

### 15. System Settings (`$api.settings`)

```javascript
// Settings
.listSettings({ data: { page, pageSize } })
.getSetting({ data: { key } })
.updateSetting({ data: { key, value } })

// Output Formats
.listOutputFormats({ data: { page, pageSize } })
.getOutputFormat({ data: { id } })
.updateOutputFormat({ data: { id, format } })

// Configuration
.getSystemConfig()
.updateSystemConfig({ data: { ...config } })

// Backup & Restore
.backupSettings()
.restoreSettings({ data: { backupId } })
.resetToDefaults()
```

---

### 16. Audit (`$api.audit`)

```javascript
// Logs
.listAuditLogs({ data: { page, pageSize } })
.getAuditLog({ data: { id } })
.filterAuditLogs({ data: { entity, action, dateFrom, dateTo } })
.searchAuditLogs({ data: { query } })

// Entity History
.getEntityAuditLogs({ data: { entityType, entityId } })
.getEntityHistory({ data: { entityType, entityId } })

// Export
.exportAuditLogs({ data: { format, filters } })

// Configuration
.getAuditConfig()
.updateAuditConfig({ data: { ...config } })

// Retention
.getRetentionPolicy()
.updateRetentionPolicy({ data: { retentionDays } })
.archiveAuditLogs({ data: { beforeDate } })
```

---

### 17. Dynamic Columns (`$api.dynamic`)

```javascript
// Columns
.listDynamicColumns({ data: { page, pageSize } })
.getDynamicColumn({ data: { id } })
.createDynamicColumn({ data: { name, type, entityType } })
.updateDynamicColumn({ data: { id, ...updates } })
.deleteDynamicColumn({ data: { id } })

// Reorder
.reorderColumns({ data: { columnIds } })

// Templates
.listColumnTemplates({ data: { page, pageSize } })
.applyColumnTemplate({ data: { templateId, entityType } })
.saveAsTemplate({ data: { name, columnIds } })
.deleteTemplate({ data: { id } })

// Validation & Migration
.validateColumnConfig({ data: { config } })
.migrateColumnData({ data: { columnId, oldType, newType } })
```

---

### 18. SMS (`$api.sms`)

```javascript
// SMS Operations
.sendSms({ data: { phone, message } })
.sendBulkSms({ data: { phones, message } })

// History
.listSmsMessages({ data: { page, pageSize } })
.getSmsMessage({ data: { id } })

// Status
.getSmsStatus({ data: { messageId } })

// Templates
.listSmsTemplates({ data: { page, pageSize } })
.createSmsTemplate({ data: { name, template } })
.updateSmsTemplate({ data: { id, ...updates } })
.deleteSmsTemplate({ data: { id } })

// OTP
.generateOtp({ data: { phone } })
.verifyOtp({ data: { phone, otp } })
.resendOtp({ data: { phone } })

// Configuration
.getSmsConfig()
.updateSmsConfig({ data: { apiKey, sender } })
```

---

## 📊 Data Types

All DTOs are defined in `types/api.ts`:

```typescript
import type {
  UserDTO,
  GoodsDTO,
  OrderDTO,
  PaymentTransactionDTO,
  TicketDTO,
  ReviewDTO,
  // ... all other types
} from '~/types/api'
```

---

## 🧪 Testing Endpoints

Test with Swagger UI:
```
http://localhost:8080/swagger-ui.html
```

---

## 📝 Request/Response Examples

### List Products
```javascript
const response = await $api.goods.listGoods({
  data: {
    page: 1,
    pageSize: 20,
    sort: 'createdAt',
    sortType: 'DESC'
  }
})

// Response
{
  status: 'success',
  code: 200,
  data: {
    content: [GoodsDTO, GoodsDTO, ...],
    totalElements: 150,
    totalPages: 8,
    pageNumber: 1,
    hasNext: true
  }
}
```

### Create Order
```javascript
const response = await $api.orders.createOrder({
  data: {
    customerId: 10,
    orderItems: [
      { goodsId: 1, quantity: 5, unitPrice: 99.99 }
    ],
    totalPrice: 499.95
  }
})

// Response
{
  status: 'success',
  code: 201,
  data: OrderDTO
}
```

---

## ✅ Complete Endpoint Count

- **18 Service Modules**
- **150+ API Endpoints**
- **All CRUD operations**
- **All filtering & search**
- **All business logic**

---

**Status**: All endpoints ready to use! Start building your features! 🚀

