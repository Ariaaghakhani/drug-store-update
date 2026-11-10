<!-- pages/panel/wallets/[personId].vue -->
<template>
  <div class="space-y-5">
    <PanelPageHeader icon="i-heroicons-banknotes" title="کیف پول" :accent="customerName" subtitle="موجودی و تراکنش‌های کیف پول مشتری">
      <template #actions>
        <UButton to="/panel/wallets" color="neutral" variant="ghost" icon="i-heroicons-arrow-right">بازگشت</UButton>
        <UButton color="primary" size="lg" icon="i-heroicons-pencil-square" @click="adjustOpen = true">
          اصلاح موجودی
        </UButton>
      </template>
    </PanelPageHeader>

    <!-- Balance -->
    <UCard :ui="{ body: 'p-4 sm:p-6' }">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-brand-100 dark:bg-brand-900/20 flex items-center justify-center flex-shrink-0">
          <UIcon name="i-heroicons-wallet" class="w-5 h-5 text-brand-500 dark:text-brand-400" />
        </div>
        <div class="min-w-0 flex-1">
          <p class="text-xs text-gray-500 dark:text-gray-400">موجودی فعلی</p>
          <div class="relative min-h-7">
            <Transition name="sk">
              <USkeleton v-if="walletLoading" key="skeleton" class="h-6 w-40" />
              <p v-else-if="walletError" key="error" class="text-sm text-error">دریافت موجودی ناموفق بود</p>
              <p v-else key="value" class="text-xl font-black text-gray-900 dark:text-white">
                {{ formatMoney(wallet?.balance ?? 0) }}
              </p>
            </Transition>
          </div>
        </div>
        <UButton
          v-if="walletError"
          color="neutral"
          variant="soft"
          size="sm"
          icon="i-heroicons-arrow-path"
          @click="loadWallet"
        >
          تلاش دوباره
        </UButton>
      </div>
      <p v-if="wallet && !wallet.enabled" class="mt-3 text-xs text-warning">
        پرداخت با کیف پول برای این فروشگاه غیرفعال است.
      </p>
    </UCard>

    <!-- Transactions -->
    <UCard :ui="{ body: 'p-0' }">
      <div class="flex items-center gap-2 px-4 sm:px-6 py-4 border-b border-gray-100 dark:border-gray-800">
        <UIcon name="i-heroicons-queue-list" class="w-4 h-4 text-brand-500" />
        <h2 class="text-sm font-medium text-gray-900 dark:text-white">تراکنش‌ها</h2>
      </div>

      <div class="relative">
        <Transition name="sk">
          <div v-if="loading" key="skeleton" class="divide-y divide-gray-100 dark:divide-gray-800">
            <div v-for="i in 4" :key="i" class="flex items-center gap-4 px-4 sm:px-6 py-4">
              <div class="flex-1 space-y-2">
                <USkeleton class="h-4 w-32" />
                <USkeleton class="h-3 w-56" />
              </div>
              <USkeleton class="h-4 w-24" />
            </div>
          </div>

          <PanelEmptyState
            v-else-if="forbidden"
            key="forbidden"
            variant="forbidden"
            title="دسترسی به تراکنش‌های کیف پول ندارید"
          />

          <PanelEmptyState
            v-else-if="error"
            key="error"
            variant="error"
            title="دریافت تراکنش‌ها ناموفق بود"
          >
            <template #action>
              <UButton color="neutral" variant="soft" icon="i-heroicons-arrow-path" @click="reload">
                تلاش دوباره
              </UButton>
            </template>
          </PanelEmptyState>

          <div v-else-if="items.length" key="content" class="divide-y divide-gray-100 dark:divide-gray-800">
            <div
              v-for="row in items"
              :key="row.id"
              class="flex flex-wrap items-start gap-x-6 gap-y-2 px-4 sm:px-6 py-4"
            >
              <div class="flex-1 min-w-0 space-y-1">
                <div class="flex flex-wrap items-center gap-2">
                  <span class="text-sm font-semibold text-gray-900 dark:text-white">{{ row.typeLabel || row.type }}</span>
                  <NuxtLink
                    v-if="row.orderId"
                    :to="`/panel/orders/${row.orderId}`"
                    class="text-xs text-brand-500 dark:text-brand-400 hover:underline"
                  >
                    سفارش #{{ row.orderId.toLocaleString('fa-IR') }}
                  </NuxtLink>
                </div>
                <p v-if="row.note" class="text-xs text-gray-500 dark:text-gray-400 whitespace-pre-line break-words">{{ row.note }}</p>
                <p class="text-xs text-gray-500 dark:text-gray-400">{{ formatJalali(row.createdAt, { withTime: true }) }}</p>
              </div>

              <div class="text-end space-y-1">
                <p
                  class="text-sm font-black"
                  :class="row.amount > 0 ? 'text-success' : 'text-error'"
                  dir="ltr"
                >
                  {{ signedAmount(row.amount) }}
                </p>
                <p class="text-xs text-gray-500 dark:text-gray-400">
                  مانده: {{ formatMoney(row.balanceAfter) }}
                </p>
              </div>
            </div>
          </div>

          <PanelEmptyState
            v-else
            key="empty"
            icon="i-heroicons-queue-list"
            title="هنوز تراکنشی ثبت نشده است"
          />
        </Transition>
      </div>

      <div v-if="totalPages > 1" class="flex justify-center py-4 border-t border-gray-100 dark:border-gray-800">
        <UPagination v-model:page="page" :total="total" :items-per-page="PAGE_SIZE" />
      </div>
    </UCard>

    <WalletAdjustModal
      v-model:open="adjustOpen"
      :person-id="personId"
      @saved="refreshAll"
    />
  </div>
</template>

<script setup>
import PanelPageHeader from '@/components/panel/PanelPageHeader.vue'
import PanelEmptyState from '@/components/panel/PanelEmptyState.vue'
import WalletAdjustModal from '@/components/panel/wallets/WalletAdjustModal.vue'
import { formatMoney } from '~/utils/money.js'
import { formatJalali } from '~/utils/jalali.js'

const app = useNuxtApp()
const route = useRoute()

const PAGE_SIZE = 20
const personId = computed(() => route.params.personId)
// The list page passes the name in the query; a direct visit falls back to the id
const customerName = computed(() => route.query.name || `مشتری #${personId.value}`)

const wallet = ref(null)
const walletLoading = ref(true)
const walletError = ref(null)
const adjustOpen = ref(false)

const loadWallet = async () => {
  walletLoading.value = true
  walletError.value = null
  try {
    const response = await app.$api.commerceAdmin.getWallet(personId.value)
    wallet.value = response.data.data ?? null
  } catch (e) {
    wallet.value = null
    walletError.value = e
  } finally {
    walletLoading.value = false
  }
}

const { items, total, totalPages, page, loading, error, forbidden, reload } = usePagedList(
  ({ page: backendPage, size }) =>
    app.$api.commerceAdmin.listWalletTransactionsAdmin(personId.value, { params: { page: backendPage, size } }),
  { size: PAGE_SIZE }
)

// Both reads move together after an adjustment: the balance and the ledger
const refreshAll = async () => {
  await Promise.all([loadWallet(), reload()])
}

// Signed Rial amount, Persian digits, explicit plus for credits
const signedAmount = (amount) => {
  const value = Number(amount ?? 0)
  const digits = Math.abs(value).toLocaleString('fa-IR')
  if (value > 0) return `+${digits} ریال`
  if (value < 0) return `−${digits} ریال`
  return formatMoney(0)
}

onMounted(loadWallet)

useHead({ title: 'کیف پول مشتری | پنل مدیریت' })
</script>

<style scoped>
.sk-enter-active { transition: opacity 0.25s ease; }
.sk-leave-active { transition: opacity 0.25s ease; position: absolute; inset: 0; }
.sk-enter-from, .sk-leave-to { opacity: 0; }
</style>
