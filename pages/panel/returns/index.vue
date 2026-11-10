<!-- pages/panel/returns/index.vue -->
<template>
  <UCard>
    <div class="flex items-center justify-between mb-6 gap-3 flex-wrap">
      <h3 class="text-xl font-black text-gray-900 dark:text-white">
        مرجوعی‌های <span class="text-brand-500">من</span>
      </h3>
      <div class="flex items-center gap-4 flex-wrap">
        <label class="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
          <USwitch
            v-model="filters.open"
            size="lg"
            :ui="{
              base: 'data-[state=checked]:bg-brand-500 dark:data-[state=checked]:bg-brand-400 data-[state=unchecked]:bg-gray-300 dark:data-[state=unchecked]:bg-gray-600',
            }"
          />
          فقط در جریان
        </label>
        <USelect
          v-model="filters.status"
          :items="statusOptions"
          :disabled="filters.open"
          size="sm"
          class="w-44"
        />
      </div>
    </div>

    <div class="relative">
      <Transition name="sk">
        <div v-if="loading" key="skeleton" class="space-y-3">
          <div
            v-for="i in 3"
            :key="i"
            class="flex items-center gap-4 px-4 py-4 rounded-xl border border-gray-100 dark:border-gray-800"
          >
            <div class="flex-1 space-y-2">
              <USkeleton class="h-4 w-40" />
              <USkeleton class="h-3 w-56" />
            </div>
            <USkeleton class="h-5 w-16 rounded-full" />
          </div>
        </div>

        <PanelEmptyState
          v-else-if="forbidden"
          key="forbidden"
          variant="forbidden"
          title="دسترسی به مرجوعی‌ها ندارید"
        />

        <PanelEmptyState
          v-else-if="error"
          key="error"
          variant="error"
          title="دریافت مرجوعی‌ها ناموفق بود"
        >
          <template #action>
            <UButton color="neutral" variant="soft" icon="i-heroicons-arrow-path" @click="reload">
              تلاش دوباره
            </UButton>
          </template>
        </PanelEmptyState>

        <div v-else-if="items.length" key="content" class="space-y-3">
          <div
            v-for="item in items"
            :key="item.id"
            class="flex items-start gap-4 px-4 py-4 rounded-xl border border-gray-100 dark:border-gray-800"
          >
            <div class="flex-1 min-w-0 space-y-1.5">
              <div class="flex items-center gap-2 flex-wrap">
                <NuxtLink
                  :to="`/panel/returns/${item.id}`"
                  class="text-sm font-semibold text-gray-900 dark:text-white hover:text-brand-500 dark:hover:text-brand-400"
                >
                  درخواست #{{ item.id.toLocaleString('fa-IR') }}
                </NuxtLink>
                <UBadge :color="returnStatusMeta(item.status).color" variant="subtle" size="xs">
                  {{ returnStatusMeta(item.status).label }}
                </UBadge>
                <UBadge v-if="item.workflow?.pending" color="warning" variant="subtle" size="xs">
                  در انتظار تأیید
                </UBadge>
              </div>
              <p class="text-xs text-gray-500 dark:text-gray-400">
                <NuxtLink
                  :to="`/panel/orders/${item.orderId}`"
                  class="hover:text-brand-500 dark:hover:text-brand-400 underline-offset-2 hover:underline"
                >
                  سفارش #{{ item.orderId.toLocaleString('fa-IR') }}
                </NuxtLink>
                · {{ formatDate(item.createdAt) }}
              </p>
              <p class="text-sm text-gray-700 dark:text-gray-300">
                {{ item.reasonLabel || returnReasonLabel(item.reason) }}
              </p>
            </div>
          </div>

          <div v-if="totalPages > 1" class="flex justify-center pt-2">
            <UPagination v-model:page="page" :total="total" :items-per-page="PAGE_SIZE" />
          </div>
        </div>

        <PanelEmptyState
          v-else
          key="empty"
          icon="i-heroicons-arrow-uturn-left"
          title="درخواست مرجوعی ندارید"
          text="اگر کالایی از سفارش‌های خود می‌خواهید برگردانید، از صفحه سفارش آن درخواست مرجوعی ثبت کنید"
        >
          <template #action>
            <UButton to="/panel/orders" color="primary" icon="i-heroicons-shopping-bag">مشاهده سفارش‌ها</UButton>
          </template>
        </PanelEmptyState>
      </Transition>
    </div>
  </UCard>
</template>

<script setup>
import PanelEmptyState from '@/components/panel/PanelEmptyState.vue'

const PAGE_SIZE = 20

const app = useNuxtApp()
// Staff branch (BACKEND_SYNC_PLAN C1a) goes here: `const isStaff = computed(() => useUserPanelTabs().getUserRole() !== 'customer')`
// and the list call switches to `listReturns(isStaff.value, ...)` with the staff columns. Until then every role
// reads the customer endpoint (`staff` = false).
const STAFF = false

const filters = reactive({ status: 'all', open: false })

const statusOptions = [
  { value: 'all', label: 'همه وضعیت‌ها' },
  ...Object.entries(RETURN_STATUS_META).map(([value, meta]) => ({ value, label: meta.label })),
]

// Paging, loading and error state come from the shared composable (0-based BACK paging behind a 1-based UPagination).
// `open` and `status` are sent only when set: BACK ignores `status` while `open` is on.
const { items, total, totalPages, page, loading, error, forbidden, reload } = usePagedList(
  ({ page: backendPage, size }) => {
    const params = { page: backendPage, size }
    if (filters.open) params.open = true
    else if (filters.status !== 'all') params.status = filters.status
    return app.$api.returns.listReturns(STAFF, { params })
  },
  { size: PAGE_SIZE, filters }
)

const formatDate = (value) => {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '' : date.toLocaleDateString('fa-IR')
}

useHead({ title: 'مرجوعی‌های من | پنل کاربری' })
</script>

<style scoped>
.sk-enter-active { transition: opacity 0.25s ease; }
.sk-leave-active { transition: opacity 0.25s ease; position: absolute; inset: 0; }
.sk-enter-from, .sk-leave-to { opacity: 0; }
</style>
