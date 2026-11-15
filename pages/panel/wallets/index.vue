<!-- pages/panel/wallets/index.vue -->
<template>
  <div class="space-y-5">
    <PanelPageHeader icon="i-heroicons-banknotes" title="کیف پول" accent="مشتریان" subtitle="موجودی کیف پول مشتریان و تراکنش‌های آن" />

    <div v-if="profile && !walletEnabled" class="flex items-start gap-3 rounded-xl border border-warning/30 bg-warning/10 dark:bg-warning/20 px-4 py-3">
      <UIcon name="i-heroicons-information-circle" class="w-5 h-5 mt-0.5 flex-shrink-0 text-warning" />
      <p class="text-sm text-gray-700 dark:text-gray-300">
        پرداخت با کیف پول برای این فروشگاه غیرفعال است. مبالغ زیر فقط نمایش داده می‌شوند.
      </p>
    </div>

    <UCard :ui="{ body: 'p-0' }">
      <div class="flex items-center gap-2 px-4 sm:px-6 py-4 border-b border-gray-100 dark:border-gray-800">
        <label class="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300 cursor-pointer select-none">
          <USwitch v-model="onlyFunded" size="lg" :ui="SWITCH_UI" />
          فقط کیف پول‌های دارای موجودی
        </label>
      </div>

      <div class="relative">
        <Transition name="sk">
          <div v-if="loading" key="skeleton" class="divide-y divide-gray-100 dark:divide-gray-800">
            <div v-for="i in 4" :key="i" class="flex items-center gap-4 px-4 sm:px-6 py-4">
              <div class="flex-1 space-y-2">
                <USkeleton class="h-4 w-32" />
                <USkeleton class="h-3 w-24" />
              </div>
              <USkeleton class="h-4 w-24" />
            </div>
          </div>

          <PanelEmptyState
            v-else-if="forbidden"
            key="forbidden"
            variant="forbidden"
            title="دسترسی به کیف پول‌ها ندارید"
          />

          <PanelEmptyState
            v-else-if="error"
            key="error"
            variant="error"
            title="دریافت کیف پول‌ها ناموفق بود"
          >
            <template #action>
              <UButton color="neutral" variant="soft" icon="i-heroicons-arrow-path" @click="reload">
                تلاش دوباره
              </UButton>
            </template>
          </PanelEmptyState>

          <div v-else-if="items.length" key="content">
            <div class="overflow-x-auto">
              <table class="w-full">
                <thead>
                  <tr class="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                    <th class="text-start text-xs font-medium text-gray-500 dark:text-gray-400 px-6 py-3">نام</th>
                    <th class="text-start text-xs font-medium text-gray-500 dark:text-gray-400 px-6 py-3">موبایل</th>
                    <th class="text-start text-xs font-medium text-gray-500 dark:text-gray-400 px-6 py-3">موجودی</th>
                    <th class="text-start text-xs font-medium text-gray-500 dark:text-gray-400 px-6 py-3">آخرین تغییر</th>
                    <th class="px-6 py-3" />
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="row in items"
                    :key="row.personId"
                    class="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors"
                  >
                    <td class="px-6 py-3 text-sm font-semibold text-gray-900 dark:text-white">
                      {{ row.fullName || '—' }}
                    </td>
                    <td dir="ltr" class="px-6 py-3 text-sm text-start text-gray-700 dark:text-gray-300">
                      {{ row.phone || '—' }}
                    </td>
                    <td class="px-6 py-3 text-sm font-bold text-gray-900 dark:text-white">
                      {{ formatMoney(row.balance) }}
                    </td>
                    <td class="px-6 py-3 text-xs text-gray-600 dark:text-gray-400">
                      {{ row.updatedAt ? formatJalali(row.updatedAt, { withTime: true }) : '—' }}
                    </td>
                    <td class="px-6 py-3 text-end">
                      <UButton
                        :to="{ path: `/panel/wallets/${row.personId}`, query: { name: row.fullName || '' } }"
                        color="neutral"
                        variant="soft"
                        size="xs"
                        trailing-icon="i-heroicons-arrow-left"
                      >
                        جزئیات
                      </UButton>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div v-if="totalPages > 1" class="flex justify-center py-4">
              <UPagination v-model:page="page" :total="total" :items-per-page="PAGE_SIZE" />
            </div>
          </div>

          <PanelEmptyState
            v-else
            key="empty"
            icon="i-heroicons-banknotes"
            :title="onlyFunded ? 'کیف پول دارای موجودی نداریم' : 'هنوز کیف پولی ثبت نشده است'"
          />
        </Transition>
      </div>
    </UCard>
  </div>
</template>

<script setup>
import PanelPageHeader from '@/components/panel/PanelPageHeader.vue'
import PanelEmptyState from '@/components/panel/PanelEmptyState.vue'
import { formatMoney } from '~/utils/money.js'
import { formatJalali } from '~/utils/jalali.js'

const app = useNuxtApp()
const { profile, walletEnabled } = useStoreProfile()

const PAGE_SIZE = 20
// Brand teal switch (DESIGN_SYSTEM "USwitch"): never color="teal"
const SWITCH_UI = {
  base: 'data-[state=checked]:bg-brand-500 dark:data-[state=checked]:bg-brand-400 data-[state=unchecked]:bg-gray-300 dark:data-[state=unchecked]:bg-gray-600',
}

const onlyFunded = ref(false)

// Highest balance first comes from the server. Turning the switch resets to page 1 (usePagedList filters).
const { items, total, totalPages, page, loading, error, forbidden, reload } = usePagedList(
  ({ page: backendPage, size }) =>
    app.$api.commerceAdmin.listWallets({
      params: {
        page: backendPage,
        size,
        ...(onlyFunded.value ? { minBalance: 1 } : {}),
      },
    }),
  { size: PAGE_SIZE, filters: onlyFunded }
)

useHead({ title: 'کیف پول مشتریان | پنل مدیریت' })
</script>

<style scoped>
.sk-enter-active { transition: opacity 0.25s ease; }
.sk-leave-active { transition: opacity 0.25s ease; position: absolute; inset: 0; }
.sk-enter-from, .sk-leave-to { opacity: 0; }
</style>
