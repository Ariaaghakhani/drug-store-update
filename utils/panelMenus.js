// Static registry of every panel menu this frontend can render.
// `key` is the stable id of the menu. `modules` joins it to BACK: `POST /api/auth/me/permissions` returns the user's
// `{module, action, allowed}` grants, and a staff user sees a menu when they hold READ on any of its `modules`
// (module names are BACK's `@EndpointInfo(module = …)`). `always: true` menus show for every logged-in user.
// Optional `flag`: a StoreProfileDTO boolean (GET /api/store-profile) that must be true for the menu to show.
// Optional `group`: a key of GROUP_LABELS. The desktop sidebar (pages/panel.vue) renders a heading when the group
// changes and a divider between grouped and ungrouped entries; entries without `group` render exactly as before.
// To add a menu: add an entry here (+ its page under pages/panel/) with the BACK module(s) guarding its endpoints.
// Every entry must have a page, or it links to a 404. Not built yet, so not listed: reports (REPORT), settings (STORE_PROFILE, SYSTEM_SETTINGS, MY_ORGANIZATION), analytics, finance.
export const GROUP_LABELS = {
  sales: 'فروش و مشتریان',
  stock: 'کالا و انبار',
  content: 'محتوا و تعامل',
  marketing: 'بازاریابی',
  insights: 'گزارش و تحلیل',
  workflow: 'گردش کار',
  settings: 'تنظیمات',
}

export const PANEL_MENUS = [
  { key: 'dashboard', label: 'داشبورد', icon: 'i-heroicons-rectangle-group', to: '/panel/dashboard', modules: ['DASHBOARD'], always: true },
  { key: 'users', label: 'مدیریت کاربران', icon: 'i-heroicons-users', to: '/panel/users', modules: ['USER_MANAGEMENT'] },
  { key: 'products', label: 'مدیریت محصولات', icon: 'i-heroicons-cube', to: '/panel/products', modules: ['GOODS'] },
  { key: 'inventory', label: 'انبار', icon: 'i-heroicons-archive-box', to: '/panel/inventory', modules: ['INVENTORY', 'WAREHOUSE'] },
  { key: 'orders', label: 'سفارشات', icon: 'i-heroicons-shopping-bag', to: '/panel/orders', modules: ['ORDER'] },
  { key: 'tickets', label: 'تیکت‌ها', icon: 'i-heroicons-lifebuoy', to: '/panel/tickets', modules: ['TICKET'] },
  { key: 'returns', label: 'مرجوعی‌ها', icon: 'i-heroicons-arrow-uturn-left', to: '/panel/returns', modules: ['ORDER_RETURN'], group: 'sales' },
  { key: 'shipping', label: 'روش‌های ارسال', icon: 'i-heroicons-truck', to: '/panel/shipping', modules: ['SHIPPING'], group: 'sales' },
  { key: 'reviews', label: 'نظرات', icon: 'i-heroicons-star', to: '/panel/reviews', modules: ['GOODS_REVIEW'], group: 'content' },
  { key: 'questions', label: 'پرسش و پاسخ', icon: 'i-heroicons-chat-bubble-left-right', to: '/panel/questions', modules: ['GOODS_QUESTION'], flag: 'goodsQuestionsEnabled', group: 'content' },
  { key: 'wishlist', label: 'علاقه‌مندی‌ها', icon: 'i-heroicons-heart', to: '/panel/wishlist', flag: 'wishlistEnabled' },
  { key: 'wallet', label: 'کیف پول', icon: 'i-heroicons-wallet', to: '/panel/wallet', flag: 'walletEnabled' },
  { key: 'addresses', label: 'آدرس‌ها', icon: 'i-heroicons-map-pin', to: '/panel/address' },
  { key: 'security', label: 'امنیت', icon: 'i-heroicons-shield-check', to: '/panel/security', always: true },
  { key: 'notifications', label: 'اعلان‌ها', icon: 'i-heroicons-bell', to: '/panel/notifications', always: true },
  { key: 'profile', label: 'اطلاعات شخصی', icon: 'i-heroicons-user', to: '/panel/profile', always: true },
]

// Used for customers, and for staff while BACK's permissions are missing/failing/empty: the old hardcoded per-role lists,
// expressed as registry keys (+ the role-specific label/badge the old lists carried).
export const FALLBACK_MENUS_BY_ROLE = {
  customer: [
    { key: 'dashboard' },
    { key: 'orders' },
    { key: 'returns', group: '' },
    { key: 'wishlist' },
    { key: 'wallet' },
    { key: 'tickets' },
    { key: 'reviews', label: 'نظرات من', group: '' },
    { key: 'questions', label: 'پرسش‌های من', group: '' },
    { key: 'notifications' },
    { key: 'profile' },
    { key: 'addresses' },
    { key: 'security' },
  ],
  admin: [
    { key: 'dashboard', label: 'داشبورد مدیریت', icon: 'i-heroicons-home' },
    { key: 'users' },
    { key: 'products' },
    { key: 'inventory' },
    { key: 'orders', label: 'مدیریت سفارشات', badge: 5 },
    { key: 'tickets' },
    { key: 'notifications' },
    { key: 'profile' },
  ],
  owner: [
    { key: 'dashboard', label: 'داشبورد مدیریت', icon: 'i-heroicons-home' },
    { key: 'users' },
    { key: 'products' },
    { key: 'inventory' },
    { key: 'orders', label: 'مدیریت سفارشات', badge: 5 },
    { key: 'tickets' },
    { key: 'shipping' },
    { key: 'notifications' },
    { key: 'profile' },
  ],
}
