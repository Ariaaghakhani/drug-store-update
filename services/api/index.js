/**
 * API Service Index
 * Central registry for all API services
 *
 * Usage: $api.goods.listGoods(), $api.orders.createOrder(), etc.
 */
import auth from '@/services/api/auth.js'
import blog from '@/services/api/blog.js'
import products from '@/services/api/products.js'
import goods from '@/services/api/goods.js'
import orders from '@/services/api/orders.js'
import payments from '@/services/api/payments.js'
import inventory from '@/services/api/inventory.js'
import catalog from '@/services/api/catalog.js'
import analytics from '@/services/api/analytics.js'
import communication from '@/services/api/communication.js'
import user from '@/services/api/user.js'
import location from '@/services/api/location.js'
import organization from '@/services/api/organization.js'
import search from '@/services/api/search.js'
import medical from '@/services/api/medical.js'
import attachment from '@/services/api/attachment.js'
import settings from '@/services/api/settings.js'
import audit from '@/services/api/audit.js'
import dynamic from '@/services/api/dynamic.js'
import sms from '@/services/api/sms.js'
import address from '~/services/api/panel/address.js'

export default (apiCaller, apiInstances) => ({
  // ========== AUTHENTICATION ==========
  auth: auth(apiCaller),

  // ========== PRODUCTS & CATALOG ==========
  goods: goods(apiCaller),
  products: products(apiCaller), // Legacy alias
  catalog: catalog(apiCaller),

  // ========== ORDERS & PAYMENTS ==========
  orders: orders(apiCaller),
  payments: payments(apiCaller),

  // ========== INVENTORY ==========
  inventory: inventory(apiCaller),

  // ========== ANALYTICS & REPORTS ==========
  analytics: analytics(apiCaller),

  // ========== COMMUNICATION ==========
  communication: communication(apiCaller),

  // ========== USERS & ORGANIZATION ==========
  user: user(apiCaller),
  organization: organization(apiCaller),

  // ========== LOCATION ==========
  location: location(apiCaller),

  // ========== SEARCH ==========
  search: search(apiCaller),

  // ========== MEDICAL ==========
  medical: medical(apiCaller),

  // ========== FILES & ATTACHMENTS ==========
  attachment: attachment(apiCaller),

  // ========== SYSTEM ==========
  settings: settings(apiCaller),
  audit: audit(apiCaller),
  dynamic: dynamic(apiCaller),
  sms: sms(apiCaller),

  // ========== CMS (Blog) ==========
  blog: blog(apiCaller),

  // ========== PANEL ROUTES ==========
  address: address(apiCaller),

  // ========== API INSTANCES ==========
  instances: apiInstances,
})
