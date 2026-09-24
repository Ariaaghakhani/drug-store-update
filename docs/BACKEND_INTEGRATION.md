# Daro Plus — Backend Integration Guide

**Date**: 2026-09-18  
**Backend**: Pouyan Platform v2.0.0  
**Frontend**: Nuxt 3 + Vue 3  
**Status**: Ready for Integration

---

## 🎯 Integration Overview

Your frontend (`drug-store-search`) is ready to integrate with the backend API. The foundation is already in place:

```
Current Setup:
✅ API client factory (plugins/api.js)
✅ Auth plugin with token management (plugins/auth.client.js)
✅ Basic services (auth, products, blog, address)
✅ Pinia stores (user, cart, chat)
✅ Nuxt UI + Tailwind CSS v4
✅ RTL-first design (Farsi-native)

To Complete Integration:
⚠️ Expand services for all backend modules
⚠️ Create TypeScript types from DTOs
⚠️ Enhance state management
⚠️ Implement payment flow
⚠️ Build missing features (orders, inventory, dashboard, etc.)
```

---

## 📊 Backend API Reference

The backend documentation is in your project scratchpad:

**Main Documents** (3 levels of detail):
- `FRONTEND_SYNC_REPORT.md` — Complete technical spec (100+ pages)
- `API_QUICK_REFERENCE.md` — Copy-paste API examples
- `DTO_DATA_MODELS.md` — Data structures and types

**Quick Access**:
```
Backend URL: http://localhost:8080 (dev)
Swagger UI: http://localhost:8080/swagger-ui.html
OpenAPI JSON: http://localhost:8080/v3/api-docs
```

---

## 🔧 Current Architecture

### API Client Setup (Already in Place)

**File**: `plugins/api.js`

```javascript
// ✅ Multiple $fetch instances
const defaultInstance = $fetch.create({
  baseURL: runtimeConfig.public.BACKEND_URL,
  // Auto-adds Bearer token
})

// ✅ Request/response interceptors
// ✅ Token injection
// ✅ Promise caching for GET requests

// Usage in components:
await $api.auth.login({ phone, password, loginType: 'PASSWORD' })
await $api.products.fetchProductsList({ page, pageSize })
```

### Auth Plugin Setup (Already in Place)

**File**: `plugins/auth.client.js`

```javascript
// ✅ Token storage/retrieval
// ✅ User state management
// ✅ Auth ready promise
// ✅ Logout handling

// Usage:
$auth.setToken(token)
$auth.setUser(userData)
await $auth.fetchUser()
$auth.loggedIn  // readonly ref
$auth.user      // readonly ref
```

### Pinia Store Example

**File**: `stores/user.js`

```javascript
// Already exists - can be enhanced
export const useUserStore = defineStore('user', () => {
  const currentUser = ref(null)
  
  const setUser = (userData) => { currentUser.value = userData }
  const clearUser = () => { currentUser.value = null }
  
  return { currentUser, setUser, clearUser }
})
```

---

## 📋 Service Module Pattern

### How Services Are Structured

Each backend module needs a service file in `services/api/`:

```javascript
// services/api/goods.js
export default (apiCaller) => ({
  // List with pagination
  listGoods(config) {
    return apiCaller.post('api/goods/list', config)
  },
  
  // Filter
  filterGoods(config) {
    return apiCaller.post('api/goods/filter', config)
  },
  
  // Get single
  getGoods(config) {
    return apiCaller.post('api/goods/get', config)
  },
  
  // Create
  createGoods(config) {
    return apiCaller.post('api/goods/create', config)
  },
  
  // Update
  updateGoods(config) {
    return apiCaller.post('api/goods/update', config)
  },
  
  // Delete
  deleteGoods(config) {
    return apiCaller.post('api/goods/delete', config)
  },
})
```

### Register in API Index

**File**: `services/api/index.js`

```javascript
import auth from '@/services/api/auth.js'
import goods from '@/services/api/goods.js'  // ← Add new service
import orders from '@/services/api/orders.js' // ← Add new service

export default (apiCaller, apiInstances) => ({
  auth: auth(apiCaller),
  goods: goods(apiCaller),    // ← Register
  orders: orders(apiCaller),  // ← Register
  instances: apiInstances,
})
```

### Usage in Components

```vue
<script setup>
const products = ref([])
const loading = ref(false)

const fetchProducts = async () => {
  loading.value = true
  try {
    const response = await $api.goods.listGoods({
      data: { page: 1, pageSize: 20 }
    })
    products.value = response.data.content
  } catch (error) {
    console.error('Failed to fetch:', error)
  } finally {
    loading.value = false
  }
}

onMounted(fetchProducts)
</script>
```

---

## 🚀 Integration Roadmap

### Phase 1: Foundation (Done)
- ✅ API client setup
- ✅ Auth plugin
- ✅ Basic services

### Phase 2: Core Services (Next)
- [ ] Expand `auth.js` with complete endpoints
- [ ] Create `goods.js` (products)
- [ ] Create `orders.js` (checkout, order management)
- [ ] Create `payments.js` (payment gateway)
- [ ] Create `inventory.js` (warehouse, stock)

### Phase 3: State Management
- [ ] Enhance `user.js` store
- [ ] Enhance `cart.js` store
- [ ] Create `orders.js` store
- [ ] Create `products.js` store

### Phase 4: Features
- [ ] Complete authentication flow
- [ ] Product search & filtering
- [ ] Shopping cart
- [ ] Checkout & payment
- [ ] Order tracking
- [ ] User profile

### Phase 5: Admin Panel
- [ ] Dashboard & analytics
- [ ] Inventory management
- [ ] User management
- [ ] Report generation

---

## 🔐 Auth Integration

### Current Implementation (Review)

**File**: `plugins/auth.client.js`

Status:
- ✅ Token storage (localStorage)
- ✅ Token injection in requests
- ✅ User state management
- ⚠️ Missing: Token refresh logic
- ⚠️ Missing: Auto-logout on 401

### What Needs Implementation

1. **Token Refresh** (Auto before expiry)
   ```javascript
   // Should refresh 5 min before expiry
   const refreshToken = async () => {
     try {
       const response = await $api.auth.refreshToken()
       $auth.setToken(response.data.token)
     } catch (error) {
       $auth.reset() // Logout
     }
   }
   ```

2. **401 Interceptor** (Auto logout)
   ```javascript
   // In API client onResponseError
   if (response?.status === 401) {
     logoutAndResetAuthentication()
   }
   ```

3. **Auto-Logout on Tab Close**
   ```javascript
   // Clean up on page unload
   onBeforeUnmount(() => {
     if (!$auth.loggedIn) return
     $api.auth.logout()
   })
   ```

### Implementation Steps

1. Add token refresh timer
2. Add 401 error handling
3. Test login → logout → login flow
4. Test token expiry handling

---

## 📦 Service Modules to Create

### 1. **Goods/Products** (`services/api/goods.js`)

```javascript
export default (apiCaller) => ({
  listGoods(config) { /* paginated list */ },
  filterGoods(config) { /* filtered list */ },
  searchGoods(config) { /* Elasticsearch search */ },
  getGoods(config) { /* single product */ },
  createGoods(config) { /* admin */ },
  updateGoods(config) { /* admin */ },
  deleteGoods(config) { /* admin */ },
  importGoods(config) { /* bulk import */ },
})
```

### 2. **Orders** (`services/api/orders.js`)

```javascript
export default (apiCaller) => ({
  listOrders(config) { /* user orders */ },
  getOrder(config) { /* single order */ },
  createOrder(config) { /* checkout */ },
  updateOrder(config) { /* update status */ },
  deleteOrder(config) { /* cancel */ },
  listPurchaseOrders(config) { /* admin */ },
})
```

### 3. **Payments** (`services/api/payments.js`)

```javascript
export default (apiCaller) => ({
  initiateCheckout(config) { /* get gateway URL */ },
  verifyPayment(config) { /* callback handler */ },
  getPaymentStatus(config) { /* check status */ },
  listTransactions(config) { /* history */ },
})
```

### 4. **Inventory** (`services/api/inventory.js`)

```javascript
export default (apiCaller) => ({
  getInventory(config) { /* stock levels */ },
  listWarehouses(config) { /* warehouses */ },
  updateInventory(config) { /* adjust stock */ },
  getWarehouse(config) { /* single warehouse */ },
})
```

### 5. **Dashboard/Analytics** (`services/api/analytics.js`)

```javascript
export default (apiCaller) => ({
  getSummary(config) { /* KPIs */ },
  getKpi(config) { /* single metric */ },
  getSalesChart(config) { /* chart data */ },
  getExpiringGoods(config) { /* alerts */ },
  generateReport(config) { /* reports */ },
})
```

### 6. **Communication** (`services/api/communication.js`)

```javascript
export default (apiCaller) => ({
  // Tickets
  listTickets(config) { /* support tickets */ },
  getTicket(config) { /* single ticket */ },
  createTicket(config) { /* submit */ },
  updateTicket(config) { /* update status */ },
  
  // Reviews
  listReviews(config) { /* product reviews */ },
  createReview(config) { /* submit review */ },
  
  // Blog
  listBlogPosts(config) { /* articles */ },
  getBlogPost(config) { /* single article */ },
})
```

---

## 🎨 Design System Alignment

Your project follows `DESIGN_SYSTEM.md` (RTL-first, Farsi-native):

### Important Notes for API Integration

1. **Bilingual Data**:
   ```javascript
   // Backend returns:
   { nameEn: "Product", nameFa: "محصول" }
   
   // Display in component:
   {{ good.nameFa }} <!-- Show Farsi by default -->
   ```

2. **Number Formatting**:
   ```javascript
   // Prices should be formatted:
   {{ product.price.toLocaleString('fa-IR') }} تومان
   // Output: ۱۲۹٬۰۰۰ تومان
   ```

3. **Status Badges**:
   ```javascript
   // Map backend statuses to Nuxt UI colors:
   const statusColor = {
     'PENDING': 'warning',
     'CONFIRMED': 'info',
     'DELIVERED': 'success',
     'CANCELED': 'error',
   }
   
   <UBadge :color="statusColor[order.status]">
     {{ order.status }}
   </UBadge>
   ```

4. **Date Formatting**:
   ```javascript
   // Backend returns ISO-8601 (UTC)
   const formatter = new Intl.DateTimeFormat('fa-IR', {
     year: 'numeric',
     month: 'long',
     day: 'numeric',
   })
   {{ formatter.format(new Date(createdAt)) }}
   ```

---

## 🧪 Testing Integration

### Test Endpoints (Development)

```bash
# Test backend connection
curl http://localhost:8080/actuator/health

# Test login
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"phone":"09xxxxxxxxx","password":"test","loginType":"PASSWORD"}'

# Test products
curl -X POST http://localhost:8080/api/goods/list \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"page":1,"pageSize":20}'
```

### Frontend Testing

```javascript
// In browser console, after login:
await $api.goods.listGoods({ data: { page: 1, pageSize: 20 } })
await $api.auth.fetchUser()
```

---

## 🔗 Configuration

### Environment Variables

**`.env`** (Create if not exists):
```
NUXT_PUBLIC_BACKEND_URL=http://localhost:8080
NUXT_PUBLIC_CMS_URL=http://localhost:3000/cms
```

**Development**:
- Backend: `http://localhost:8080`
- OTP: Mocked to "12345"
- Payments: Sandbox mode

**Production** (To configure):
- Backend: Live URL
- Payments: Real gateways

---

## 📝 Type Safety (TypeScript)

### Generate Types from Backend DTOs

Create `types/api.ts`:

```typescript
// Authentication
export interface LoginRequest {
  phone: string
  password: string
  loginType: 'PASSWORD' | 'OTP'
}

export interface TokenResponse {
  token: string
  refreshToken?: string
  user: UserDTO
  message: string
}

export interface UserDTO {
  id: number
  firstName: string
  lastName: string
  email?: string
  mobile: string
  roles: RoleDTO[]
}

// Products
export interface GoodsDTO {
  id?: number
  nameEn: string
  nameFa: string
  price: number
  description?: string
  categoryId: number
  tags?: TagDTO[]
  // ... etc
}

// ... etc for all DTOs
```

### Use in Services

```typescript
export default (apiCaller: any) => ({
  async login(config: { data: LoginRequest }) {
    return apiCaller.post<TokenResponse>('api/auth/login', config)
  },
})
```

---

## 🐛 Common Issues & Solutions

### Issue: 401 Unauthorized on every request
**Solution**: Check token in localStorage
```javascript
// Debug in console:
console.log('Token:', localStorage.getItem('auth.local'))
console.log('Logged in:', $auth.loggedIn)
```

### Issue: CORS errors
**Solution**: Backend has CORS configured for `localhost:3000`
```javascript
// Check in network tab:
// Response headers should include:
// Access-Control-Allow-Origin: http://localhost:3000
```

### Issue: OTP not sending (production)
**Solution**: Backend uses Kavenegar SMS service
```javascript
// In production, real SMS sent
// In dev, mocked to "12345"
```

### Issue: Prices showing as Latin digits
**Solution**: Use `toLocaleString('fa-IR')`
```javascript
// ❌ Wrong:
{{ price }} // 12900

// ✅ Correct:
{{ price.toLocaleString('fa-IR') }} تومان // ۱۲٬۹۰۰ تومان
```

### Issue: RTL layout breaking on API data
**Solution**: Data is RTL-aware, use logical properties
```css
/* ❌ Wrong: */
margin-right: 1rem;

/* ✅ Correct: */
margin-inline-end: 1rem; /* or me-4 in Tailwind */
```

---

## 📚 Next Steps

### Immediate (Today)
1. Read `FRONTEND_SYNC_REPORT.md` sections 1-3
2. Create `services/api/goods.js` service
3. Test product listing

### This Week
1. Create remaining service modules
2. Enhance auth flow
3. Build product search
4. Set up shopping cart

### Next Week
1. Implement checkout flow
2. Integrate payment gateway
3. Build order tracking
4. Add user profile

### Following Weeks
1. Admin panel features
2. Dashboard & analytics
3. Inventory management
4. Performance optimization

---

## 🎓 Resources

### Documentation Files (In Scratchpad)
- `FRONTEND_SYNC_REPORT.md` — 100+ page technical spec
- `API_QUICK_REFERENCE.md` — Copy-paste examples
- `DTO_DATA_MODELS.md` — Data structures
- `COMPREHENSIVE_ANALYSIS.md` — Deep analysis

### Live Resources
- Swagger UI: http://localhost:8080/swagger-ui.html
- OpenAPI JSON: http://localhost:8080/v3/api-docs

### Your Project Files
- `CLAUDE.md` — Project conventions
- `DESIGN_SYSTEM.md` — Visual guidelines
- `app.config.ts` — Nuxt UI overrides
- `nuxt.config.ts` — Nuxt configuration

---

## ✅ Integration Checklist

### Foundation
- [ ] Read FRONTEND_SYNC_REPORT.md
- [ ] Backend running locally
- [ ] Can access Swagger UI
- [ ] Can login to backend

### Services
- [ ] Goods/Products service
- [ ] Orders service
- [ ] Payments service
- [ ] Inventory service
- [ ] Analytics service
- [ ] Communication service

### State Management
- [ ] User store
- [ ] Products store
- [ ] Cart store
- [ ] Orders store

### Features
- [ ] Login/Register flow
- [ ] Product listing & search
- [ ] Shopping cart
- [ ] Checkout & payment
- [ ] Order tracking
- [ ] User profile

### Quality
- [ ] All endpoints tested
- [ ] Error handling implemented
- [ ] Loading states added
- [ ] Form validation complete
- [ ] Type safety verified

---

## 📞 Support

**Need help?**
1. Check `FRONTEND_SYNC_REPORT.md` for technical details
2. Check `API_QUICK_REFERENCE.md` for examples
3. Test with Swagger UI first
4. Check browser console for errors

**Backend Issues?**
- Server logs: Check terminal
- Database: Use DBeaver
- Redis: Use Redis Client
- Elasticsearch: Use Kibana

---

**Status**: Ready to build! 🚀

Start with creating the `services/api/goods.js` service and test it with the Swagger UI.

