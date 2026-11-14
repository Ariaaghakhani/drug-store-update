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
import catalogAdmin from '@/services/api/catalogAdmin.js'
import analytics from '@/services/api/analytics.js'
import communication from '@/services/api/communication.js'
import user from '@/services/api/user.js'
import location from '@/services/api/location.js'
import organization from '@/services/api/organization.js'
import search from '@/services/api/search.js'
import medical from '@/services/api/medical.js'
import attachment from '@/services/api/attachment.js'
import crm from '@/services/api/crm.js'
import contentAdmin from '@/services/api/contentAdmin.js'
import settings from '@/services/api/settings.js'
import audit from '@/services/api/audit.js'
import dynamic from '@/services/api/dynamic.js'
import sms from '@/services/api/sms.js'
import address from '~/services/api/panel/address.js'
import ticket from '@/services/api/ticket.js'
import returns from '@/services/api/returns.js'
import prescription from '@/services/api/prescription.js'
import shipping from '@/services/api/shipping.js'
import commerceAdmin from '@/services/api/commerceAdmin.js'
import storefront from '@/services/api/storefront.js'
import notification from '@/services/api/notification.js'
import storeSettings from '@/services/api/storeSettings.js'
import workflow from '@/services/api/workflow.js'

export default (apiCaller, apiInstances) => ({
  // ========== AUTHENTICATION ==========
  auth: auth(apiCaller),

  // ========== PRODUCTS & CATALOG ==========
  goods: goods(apiCaller),
  products: products(apiCaller), // Legacy alias
  catalog: catalog(apiCaller),
  catalogAdmin: catalogAdmin(apiCaller),

  // ========== ORDERS & PAYMENTS ==========
  orders: orders(apiCaller),
  payments: payments(apiCaller),
  returns: returns(apiCaller),
  prescription: prescription(apiCaller),
  shipping: shipping(apiCaller),
  commerceAdmin: commerceAdmin(apiCaller),

  // ========== INVENTORY ==========
  inventory: inventory(apiCaller),

  // ========== ANALYTICS & REPORTS ==========
  analytics: analytics(apiCaller),

  // ========== COMMUNICATION ==========
  communication: communication(apiCaller),
  ticket: ticket(apiCaller),
  storefront: storefront(apiCaller),
  notification: notification(apiCaller),

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
  storeSettings: storeSettings(apiCaller),
  audit: audit(apiCaller),
  dynamic: dynamic(apiCaller),
  sms: sms(apiCaller),

  // ========== CMS (Blog) ==========
  blog: blog(apiCaller),

  // ========== CRM (store customers) ==========
  crm: crm(apiCaller),
  contentAdmin: contentAdmin(apiCaller),

  // ========== PANEL ROUTES ==========
  address: address(apiCaller),

  // ========== WORKFLOW ==========
  workflow: workflow(apiCaller),

  // ========== API INSTANCES ==========
  instances: apiInstances,
})
