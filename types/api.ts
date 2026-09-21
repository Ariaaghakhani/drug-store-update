/**
 * API Types & DTOs
 * Complete TypeScript type definitions for all backend responses
 */

// ========== GENERIC RESPONSE WRAPPERS ==========
export interface ApiResponse<T> {
  status: 'success' | 'error'
  code: number
  data: T | null
  message: string
  errors?: Record<string, string>
}

export interface PageResponse<T> {
  content: T[]
  pageNumber: number
  pageSize: number
  totalElements: number
  totalPages: number
  isFirst: boolean
  isLast: boolean
  hasNext: boolean
  hasPrevious: boolean
}

// ========== AUTHENTICATION ==========
export interface LoginRequest {
  phone: string
  password: string
  loginType: 'PASSWORD' | 'OTP'
}

export interface TokenResponse {
  token: string
  refreshToken?: string
  expiresIn?: number
  tokenType?: string
  user?: UserDTO
  message?: string
}

export interface OtpRequest {
  mobile: string
  verificationCode?: string
}

export interface RegisterRequest {
  mobile: string
  otp: string
  firstName: string
  lastName: string
  password: string
  email?: string
}

// ========== USER & PROFILE ==========
export interface UserDTO {
  id: number
  firstName: string
  lastName: string
  email?: string
  mobile: string
  username?: string
  roles?: RoleDTO[]
  permissions?: PermissionDTO[]
  status?: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED'
  createdAt?: string
  updatedAt?: string
}

export interface PersonDTO extends UserDTO {
  type?: 'INDIVIDUAL' | 'ORGANIZATION'
  phone?: string
  fax?: string
  address?: string
  city?: string
  province?: string
  zipCode?: string
  nationalId?: string
  avatar?: string
}

export interface RoleDTO {
  id?: number
  name: string
  nameEn?: string
  nameFa?: string
  description?: string
  permissions?: PermissionDTO[]
  active?: boolean
  order?: number
}

export interface PermissionDTO {
  id?: number
  name: string
  description?: string
  resource?: string
  action?: string
  module?: string
}

// ========== PRODUCTS/GOODS ==========
export interface GoodsDTO {
  id?: number
  goodCode: string
  nameEn: string
  nameFa: string
  description?: string
  barcode?: string
  price: number
  purchasePrice?: number
  discount?: number
  discountType?: 'PERCENT' | 'FIXED'
  finalPrice?: number
  holdCost?: number
  minOrderQuantity?: number
  isPrescriptionRequired?: boolean
  categoryId?: number
  category?: CategoryDTO
  brandId?: number
  brand?: CatalogDTO
  unitId?: number
  unit?: CatalogDTO
  tagIds?: number[]
  tags?: TagDTO[]
  images?: string[]
  currentStock?: number
  warehouseId?: number
  active?: boolean
  featured?: boolean
  createdAt?: string
  updatedAt?: string
  createdBy?: string
  updatedBy?: string
}

export interface TagDTO {
  id?: number
  name: string
  description?: string
  count?: number
  color?: string
}

export interface CategoryDTO {
  id?: number
  nameEn: string
  nameFa: string
  description?: string
  parentCategoryId?: number
  parentCategory?: CategoryDTO
  subCategories?: CategoryDTO[]
  imageUrl?: string
  active?: boolean
  order?: number
}

export interface CatalogDTO {
  id?: number
  name: string
  nameEn?: string
  nameFa?: string
  type?: string
  description?: string
  value?: string
  order?: number
  active?: boolean
}

export interface ProductBatchDTO {
  id?: number
  goodsId: number
  batchNumber: string
  expiryDate: string
  manufactureDate?: string
  quantity: number
  warehouseId: number
  status?: 'AVAILABLE' | 'EXPIRED' | 'DAMAGED'
}

export interface GoodsFilterRequestDTO {
  nameFa?: string
  nameEn?: string
  brandId?: number
  categoryIds?: number[]
  tagIds?: number[]
  warehouseId?: number
  active?: boolean
  goodCode?: string
  sortType?: 'ASC' | 'DESC'
  page?: number
  pageSize?: number
}

// ========== ORDERS ==========
export interface OrderDTO {
  id?: number
  orderNumber?: string
  customerId: number
  customer?: PersonDTO
  orderItems?: OrderItemDTO[]
  subtotal?: number
  taxAmount?: number
  shippingCost?: number
  discountAmount?: number
  totalPrice: number
  shippingAddressId?: number
  shippingAddress?: AddressDTO
  warehouseId?: number
  status?: 'PENDING' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'CANCELED'
  paymentStatus?: 'PENDING' | 'VERIFIED' | 'FAILED'
  notes?: string
  createdAt?: string
  updatedAt?: string
}

export interface OrderItemDTO {
  id?: number
  orderId?: number
  goodsId: number
  goods?: GoodsDTO
  quantity: number
  unitPrice: number
  totalPrice?: number
  discount?: number
  notes?: string
}

export interface InvoiceDTO {
  id?: number
  invoiceNumber: string
  orderId: number
  order?: OrderDTO
  customerId: number
  customer?: PersonDTO
  subtotal: number
  tax: number
  shipping: number
  discount: number
  total: number
  invoiceDate: string
  dueDate?: string
  paidDate?: string
  status?: 'DRAFT' | 'ISSUED' | 'PAID' | 'OVERDUE' | 'CANCELED'
  items?: OrderItemDTO[]
  notes?: string
}

export interface PurchaseOrderDTO {
  id?: number
  poNumber: string
  supplierId: number
  supplier?: SupplierDTO
  status?: 'DRAFT' | 'SENT' | 'CONFIRMED' | 'RECEIVED' | 'CANCELED'
  orderDate: string
  expectedDeliveryDate?: string
  actualDeliveryDate?: string
  items?: PurchaseOrderItemDTO[]
  totalAmount: number
  warehouseId: number
  notes?: string
}

export interface PurchaseOrderItemDTO {
  id?: number
  purchaseOrderId?: number
  goodsId: number
  goods?: GoodsDTO
  quantity: number
  unitPrice: number
  totalPrice?: number
}

// ========== PAYMENTS ==========
export interface PaymentInitiationRequest {
  orderId: number
  amount: number
  callbackUrl: string
  metadata?: Record<string, any>
}

export interface CheckoutResponse {
  paymentGatewayUrl: string
  referenceId: string
  transactionId?: string
  expiresAt?: string
}

export interface PaymentVerificationRequest {
  referenceId: string
  transactionId?: string
  status: 'success' | 'failed' | 'canceled'
}

export interface PaymentVerificationResponse {
  success: boolean
  message: string
  orderId: number
  paymentStatus: 'VERIFIED' | 'FAILED' | 'PENDING'
  amount: number
  verifiedAt?: string
}

export interface PaymentTransactionDTO {
  id?: number
  transactionId: string
  orderId: number
  order?: OrderDTO
  amount: number
  currency?: string
  status?:
    | 'PENDING'
    | 'VERIFIED'
    | 'COMPLETED'
    | 'FAILED'
    | 'CANCELED'
    | 'EXPIRED'
  gatewayReference?: string
  paymentMethod?: 'CREDIT_CARD' | 'BANK_TRANSFER' | 'WALLET'
  maskedCardNumber?: string
  createdAt?: string
  verifiedAt?: string
}

// ========== INVENTORY ==========
export interface InventoryDTO {
  id?: number
  goodsId: number
  goods?: GoodsDTO
  warehouseId: number
  warehouse?: WarehouseDTO
  quantity: number
  reservedQuantity?: number
  availableQuantity?: number
  lastUpdated?: string
  lastCountDate?: string
}

export interface WarehouseDTO {
  id?: number
  nameEn: string
  nameFa: string
  street: string
  city: string
  province: string
  zipCode?: string
  phone?: string
  manager?: string
  email?: string
  capacity?: number
  currentStock?: number
  active?: boolean
}

// ========== LOCATION ==========
export interface AddressDTO {
  id?: number
  recipientName: string
  street: string
  city: string
  province: string
  zipCode: string
  phone?: string
  isDefault?: boolean
  addressType?: 'HOME' | 'OFFICE' | 'OTHER'
  latitude?: number
  longitude?: number
  userId?: number
}

export interface ProvinceDTO {
  id?: number
  name: string
  code?: string
}

export interface CityDTO {
  id?: number
  name: string
  provinceId: number
  province?: ProvinceDTO
}

// ========== ANALYTICS & DASHBOARD ==========
export interface DashboardSummaryDTO {
  totalSales: number
  totalRevenue: number
  totalOrders: number
  activeCustomers: number
  newCustomers?: number
  averageOrderValue?: number
  dateFrom: string
  dateTo: string
}

export interface KpiDTO {
  metric: string
  value: number
  previousValue: number
  changeAmount: number
  changePercent: number
  trend: 'UP' | 'DOWN' | 'STABLE'
  color?: string
}

export interface BarChartDTO {
  title: string
  labels: string[]
  datasets: Array<{
    label: string
    data: number[]
    backgroundColor?: string
    borderColor?: string
  }>
}

export interface PieChartDTO {
  title: string
  labels: string[]
  data: number[]
  backgroundColor?: string[]
  borderColor?: string[]
}

export interface ExpiringGoodsDTO {
  id: number
  nameEn: string
  nameFa: string
  expiryDate: string
  daysUntilExpiry: number
  currentStock: number
  warehouse: string
  warehouseId: number
}

// ========== COMMUNICATION ==========
export interface TicketDTO {
  id?: number
  ticketNumber?: string
  userId: number
  user?: PersonDTO
  title: string
  description: string
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  status?: 'OPEN' | 'IN_PROGRESS' | 'WAITING_FOR_USER' | 'RESOLVED' | 'CLOSED'
  category?: string
  assignedTo?: PersonDTO
  messages?: TicketMessageDTO[]
  messageCount?: number
  createdAt?: string
  resolvedAt?: string
}

export interface TicketMessageDTO {
  id?: number
  ticketId: number
  authorId: number
  author?: PersonDTO
  message: string
  attachments?: string[]
  isInternal?: boolean
  createdAt?: string
  updatedAt?: string
}

export interface ReviewDTO {
  id?: number
  goodsId: number
  goods?: GoodsDTO
  userId: number
  user?: PersonDTO
  rating: number
  title: string
  content: string
  status?: 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED'
  helpful?: number
  unhelpful?: number
  createdAt?: string
}

export interface BlogPostDTO {
  id?: number
  titleEn: string
  titleFa: string
  excerpt?: string
  content: string
  author?: string
  authorId?: number
  tags?: string[]
  category?: string
  thumbnail?: string
  published?: boolean
  publishedAt?: string
  views?: number
  rating?: number
  createdAt?: string
  updatedAt?: string
}

export interface ContactMessageDTO {
  id?: number
  name: string
  email: string
  phone?: string
  subject: string
  message: string
  status?: 'NEW' | 'READ' | 'REPLIED' | 'CLOSED'
  attachments?: string[]
  createdAt?: string
  repliedAt?: string
}

// ========== ORGANIZATION ==========
export interface SupplierDTO {
  id?: number
  nameEn: string
  nameFa: string
  contactPerson?: string
  email: string
  mobile: string
  phone?: string
  address: string
  city: string
  province: string
  registrationNumber?: string
  bankAccount?: string
  status?: 'ACTIVE' | 'INACTIVE' | 'BLOCKED'
  rating?: number
}

export interface OrganizationDTO {
  id?: number
  nameEn: string
  nameFa: string
  email: string
  phone: string
  website?: string
  address: string
  city: string
  province: string
  zipCode?: string
  registrationNumber?: string
  taxId?: string
  industryType?: string
  active?: boolean
  logo?: string
}

// ========== MEDICAL ==========
export interface PatientDTO {
  id?: number
  firstName: string
  lastName: string
  nationalId?: string
  dateOfBirth?: string
  gender?: 'MALE' | 'FEMALE' | 'OTHER'
  phone: string
  email?: string
  address?: string
  allergies?: string[]
  medicalHistory?: string
  createdAt?: string
}

export interface PrescriptionDTO {
  id?: number
  patientId: number
  patient?: PatientDTO
  doctorName?: string
  prescriptionDate: string
  validUntil?: string
  items?: PrescriptionItemDTO[]
  notes?: string
  createdAt?: string
}

export interface PrescriptionItemDTO {
  id?: number
  prescriptionId?: number
  goodsId: number
  goods?: GoodsDTO
  quantity: number
  dosage?: string
  frequency?: string
  duration?: string
}

// ========== ATTACHMENTS ==========
export interface AttachmentDTO {
  id?: number
  fileName: string
  fileSize: number
  mimeType: string
  url: string
  entityType?: string
  entityId?: number
  uploadedBy?: string
  uploadedAt?: string
}

// ========== PAGINATION REQUEST ==========
export interface FilterablePage {
  page: number
  pageSize: number
  sort?: string
  sortType?: 'ASC' | 'DESC'
}

export interface IdRequest {
  id: number
}

// ========== ERROR RESPONSE ==========
export interface ErrorResponse {
  status: 'error'
  code: number
  message: string
  errors?: Record<string, string | string[]>
  timestamp?: string
  path?: string
}

// ========== SEARCH RESULTS ==========
export interface SearchResultDTO {
  products?: GoodsDTO[]
  orders?: OrderDTO[]
  articles?: BlogPostDTO[]
  users?: PersonDTO[]
  totalResults: number
}

// ========== AUDIT ==========
export interface AuditLogDTO {
  id?: number
  entity: string
  action: 'CREATE' | 'READ' | 'UPDATE' | 'DELETE'
  entityId: number
  userId: number
  user?: PersonDTO
  oldValue?: Record<string, any>
  newValue?: Record<string, any>
  timestamp: string
  ipAddress?: string
  changes?: string
}

// ========== CART (Frontend state, not from API) ==========
export interface CartItem {
  goodsId: number
  quantity: number
  goods?: GoodsDTO
}

export interface Cart {
  items: CartItem[]
  subtotal: number
  tax: number
  shipping: number
  discount: number
  total: number
}
