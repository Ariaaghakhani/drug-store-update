<!-- pages/panel/prescriptions/index.vue -->
<template>
  <UCard>
    <div class="flex items-center justify-between mb-6 gap-3 flex-wrap">
      <h3 v-if="isStaff" class="text-xl font-black text-gray-900 dark:text-white">
        مدیریت <span class="text-brand-500">نسخه‌ها</span>
      </h3>
      <h3 v-else class="text-xl font-black text-gray-900 dark:text-white">
        نسخه‌های <span class="text-brand-500">من</span>
      </h3>
      <div v-if="!disabled" class="flex items-center gap-3 flex-wrap">
        <USelect v-model="filters.status" :items="statusOptions" size="sm" class="w-52" />
        <UButton
          v-if="!isStaff"
          to="/panel/prescriptions/new"
          color="primary"
          icon="i-heroicons-plus"
        >
          ثبت نسخه
        </UButton>
      </div>
    </div>

    <div class="relative">
      <Transition name="sk">
        <div v-if="disabled" key="disabled">
          <PanelEmptyState
            icon="i-heroicons-document-text"
            title="ثبت نسخه در این فروشگاه فعال نیست"
            text="این فروشگاه در حال حاضر نسخه نمی‌پذیرد"
          />
        </div>

        <div v-else-if="loading" key="skeleton" class="space-y-3">
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
          title="دسترسی به نسخه‌ها ندارید"
        />

        <PanelEmptyState
          v-else-if="error"
          key="error"
          variant="error"
          title="دریافت نسخه‌ها ناموفق بود"
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
                  :to="`/panel/prescriptions/${item.id}`"
                  class="text-sm font-semibold text-gray-900 dark:text-white hover:text-brand-500 dark:hover:text-brand-400"
                >
                  {{ patientName(item) }}
                </NuxtLink>
                <StatusBadge :meta="prescriptionStatusMeta(item.status)" />
                <StatusBadge v-if="item.paymentStatus" :meta="paymentStatusMeta(item.paymentStatus)" />
              </div>
              <p class="text-xs text-gray-500 dark:text-gray-400">
                <template v-if="item.trackingCode">
                  کد رهگیری: <span dir="ltr" class="font-mono">{{ item.trackingCode }}</span> ·
                </template>
                {{ formatJalali(item.createdAt, { withTime: true }) }}
              </p>
              <p v-if="isStaff && item.personName" class="text-xs text-gray-700 dark:text-gray-300">
                {{ item.personName }}
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
          icon="i-heroicons-document-text"
          :title="filters.status === 'all' ? 'نسخه‌ای ثبت نشده است' : 'نسخه‌ای با این وضعیت پیدا نشد'"
          :text="filters.status === 'all' && !isStaff ? 'نسخه‌ی خود را برای بررسی موجودی داروها ثبت کنید' : ''"
        >
          <template v-if="filters.status === 'all' && !isStaff" #action>
            <UButton to="/panel/prescriptions/new" color="primary" icon="i-heroicons-plus">ثبت نسخه</UButton>
          </template>
        </PanelEmptyState>
      </Transition>
    </div>
  </UCard>
</template>

<script setup>
import PanelEmptyState from '@/components/panel/PanelEmptyState.vue'
import StatusBadge from '@/components/panel/StatusBadge.vue'
import { formatJalali } from '@/utils/jalali.js'
import { PRESCRIPTION_STATUS_META, paymentStatusMeta, prescriptionStatusMeta } from '~/utils/prescriptionMeta.js'
import { selectItems } from '~/utils/enumMeta.js'

const PAGE_SIZE = 20

const app = useNuxtApp()
const { getUserRole } = useUserPanelTabs()
const { profile, prescriptionEnabled } = useStoreProfile()

// Customers see their own prescriptions. Staff (any non-customer role) read the admin list; their detail view comes later.
const isStaff = computed(() => getUserRole() !== 'customer')

// The store switched prescriptions off: show the disabled state instead of the list
const disabled = computed(() => Boolean(profile.value) && !prescriptionEnabled.value)

const filters = reactive({ status: 'all' })
const statusOptions = selectItems(PRESCRIPTION_STATUS_META, 'همه وضعیت‌ها')

// Paging, loading and error state come from the shared composable (0-based BACK paging behind a 1-based UPagination).
const { items, total, totalPages, page, loading, error, forbidden, reload } = usePagedList(
  ({ page: backendPage, size }) => {
    const params = { page: backendPage, size }
    if (filters.status !== 'all') params.status = filters.status
    return app.$api.prescription.listPrescriptions(isStaff.value, { params })
  },
  { size: PAGE_SIZE, filters }
)

const patientName = (item) => `${item.patientFirstName ?? ''} ${item.patientLastName ?? ''}`.trim() || '—'

useHead({ title: isStaff.value ? 'نسخه‌ها | پنل مدیریت' : 'نسخه‌های من | پنل کاربری' })
</script>

<style scoped>
.sk-enter-active { transition: opacity 0.25s ease; }
.sk-leave-active { transition: opacity 0.25s ease; position: absolute; inset: 0; }
.sk-enter-from, .sk-leave-to { opacity: 0; }
</style>
