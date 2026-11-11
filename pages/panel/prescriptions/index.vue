<!-- pages/panel/prescriptions/index.vue -->
<template>
  <UCard :ui="isStaff ? { body: 'p-0 sm:p-0' } : undefined">
    <div class="flex items-center justify-between mb-6 gap-3 flex-wrap" :class="isStaff ? 'px-4 pt-4 sm:px-6 sm:pt-6' : ''">
      <h3 v-if="isStaff" class="text-xl font-black text-gray-900 dark:text-white">
        مدیریت <span class="text-brand-500">نسخه‌ها</span>
      </h3>
      <h3 v-else class="text-xl font-black text-gray-900 dark:text-white">
        نسخه‌های <span class="text-brand-500">من</span>
      </h3>
      <div v-if="!disabled" class="flex items-center gap-3 flex-wrap">
        <USelect v-model="filters.status" :items="statusOptions" size="sm" class="w-52" />
        <UButton
          v-if="isStaff"
          color="neutral"
          variant="outline"
          icon="i-heroicons-identification"
          @click="insurancesOpen = true"
        >
          بیمه‌ها
        </UButton>
        <UButton
          v-else
          to="/panel/prescriptions/new"
          color="primary"
          icon="i-heroicons-plus"
        >
          ثبت نسخه
        </UButton>
      </div>
    </div>

    <!-- Staff filters: free text search (debounced), insurance and the created-date range -->
    <div
      v-if="isStaff && !disabled"
      class="flex items-end gap-3 flex-wrap mb-4 px-4 sm:px-6"
    >
      <UInput
        v-model="searchText"
        size="sm"
        dir="rtl"
        placeholder="نام بیمار، کد ملی یا کد رهگیری"
        aria-label="جستجو"
        class="w-full sm:w-64"
      />
      <USelect v-model="filters.insuranceId" :items="insuranceOptions" size="sm" class="w-52" />
      <div class="w-44">
        <JalaliDateInput v-model="filters.createdFrom" label="از تاریخ" clearable />
      </div>
      <div class="w-44">
        <JalaliDateInput v-model="filters.createdTo" label="تا تاریخ" clearable />
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

        <div v-else-if="loading" key="skeleton" :class="isStaff ? 'px-4 sm:px-6 pb-4 space-y-3' : 'space-y-3'">
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

        <!-- Staff: admin table. SUBMITTED rows are highlighted: they wait for an answer -->
        <div v-else-if="isStaff && items.length" key="staff-table">
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead class="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800">
                <tr>
                  <th v-for="col in STAFF_COLUMNS" :key="col" class="text-xs font-medium text-gray-500 dark:text-gray-400 px-4 sm:px-6 py-3 text-start whitespace-nowrap">
                    {{ col }}
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="item in items"
                  :key="item.id"
                  class="border-b border-gray-100 dark:border-gray-800 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/40"
                  :class="item.status === 'SUBMITTED' ? 'bg-warning/5 dark:bg-warning/10' : ''"
                >
                  <td class="px-4 sm:px-6 py-3 whitespace-nowrap">
                    <NuxtLink
                      :to="`/panel/prescriptions/${item.id}`"
                      class="font-medium text-gray-900 dark:text-white hover:text-brand-500 dark:hover:text-brand-400"
                    >
                      #{{ item.id.toLocaleString('fa-IR') }}
                    </NuxtLink>
                  </td>
                  <td class="px-4 sm:px-6 py-3">
                    <p class="text-gray-900 dark:text-white">{{ patientName(item) }}</p>
                    <p dir="ltr" class="text-xs font-mono text-gray-500 dark:text-gray-400 text-start">
                      {{ item.patientNationalCode || '—' }}
                    </p>
                  </td>
                  <td class="px-4 sm:px-6 py-3">
                    <p class="text-gray-900 dark:text-white">{{ item.personName || '—' }}</p>
                    <p dir="ltr" class="text-xs text-gray-500 dark:text-gray-400 text-start">{{ item.personPhone || '' }}</p>
                  </td>
                  <td class="px-4 sm:px-6 py-3 text-gray-700 dark:text-gray-300">{{ insuranceText(item) }}</td>
                  <td class="px-4 sm:px-6 py-3">
                    <StatusBadge :meta="prescriptionStatusMeta(item.status)" />
                  </td>
                  <td class="px-4 sm:px-6 py-3">
                    <StatusBadge v-if="item.paymentStatus" :meta="paymentStatusMeta(item.paymentStatus)" />
                    <span v-else class="text-gray-400 dark:text-gray-500">—</span>
                  </td>
                  <td class="px-4 sm:px-6 py-3 whitespace-nowrap text-gray-700 dark:text-gray-300">
                    {{ formatJalali(item.createdAt, { withTime: true }) }}
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
          v-else-if="isStaff"
          key="staff-empty"
          icon="i-heroicons-document-text"
          title="نسخه‌ای پیدا نشد"
          text="با این فیلترها نسخه‌ای ثبت نشده است"
        />

        <!-- Customer: own prescriptions as a card list -->
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
          :text="filters.status === 'all' ? 'نسخه‌ی خود را برای بررسی موجودی داروها ثبت کنید' : ''"
        >
          <template v-if="filters.status === 'all'" #action>
            <UButton to="/panel/prescriptions/new" color="primary" icon="i-heroicons-plus">ثبت نسخه</UButton>
          </template>
        </PanelEmptyState>
      </Transition>
    </div>

    <InsurancesModal
      v-if="isStaff"
      v-model:open="insurancesOpen"
      @changed="loadInsurances"
    />
  </UCard>
</template>

<script setup>
import PanelEmptyState from '@/components/panel/PanelEmptyState.vue'
import StatusBadge from '@/components/panel/StatusBadge.vue'
import JalaliDateInput from '@/components/panel/JalaliDateInput.vue'
import InsurancesModal from '@/components/panel/prescriptions/InsurancesModal.vue'
import { formatJalali } from '@/utils/jalali.js'
import {
  PRESCRIPTION_STATUS_META,
  insuranceKindLabel,
  paymentStatusMeta,
  prescriptionStatusMeta,
} from '~/utils/prescriptionMeta.js'
import { selectItems } from '~/utils/enumMeta.js'

const PAGE_SIZE = 20
const SEARCH_DEBOUNCE_MS = 300
const STAFF_COLUMNS = ['#', 'بیمار', 'فرستنده', 'بیمه', 'وضعیت', 'پرداخت', 'تاریخ ثبت']

const app = useNuxtApp()
const { getUserRole } = useUserPanelTabs()
const { profile, prescriptionEnabled } = useStoreProfile()

// Customers see their own prescriptions. Staff (any non-customer role) read the admin list with the staff filters.
const isStaff = computed(() => getUserRole() !== 'customer')

// The store switched prescriptions off: customers see the disabled state instead of the list. Staff keep the list.
const disabled = computed(() => !isStaff.value && Boolean(profile.value) && !prescriptionEnabled.value)

const filters = reactive({ status: 'all', insuranceId: 'all', q: '', createdFrom: '', createdTo: '' })
const statusOptions = selectItems(PRESCRIPTION_STATUS_META, 'همه وضعیت‌ها')

// The search box is debounced into `filters.q`, so typing does not fire a request per keystroke
const searchText = ref('')
let searchTimer = null
watch(searchText, (value) => {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    filters.q = value.trim()
  }, SEARCH_DEBOUNCE_MS)
})
onBeforeUnmount(() => clearTimeout(searchTimer))

// Insurance filter: every insurance of the store (inactive ones too, since old prescriptions still carry them)
const insurances = ref([])
const insuranceOptions = computed(() => [
  { value: 'all', label: 'همه بیمه‌ها' },
  ...insurances.value.map((item) => ({
    value: item.id,
    label: `${item.name}${item.active === false ? ' (غیرفعال)' : ''} · ${insuranceKindLabel(item.kind)}`,
  })),
])
const insurancesOpen = ref(false)

async function loadInsurances() {
  if (!isStaff.value) return
  try {
    const response = await app.$api.prescription.listInsurances()
    insurances.value = response.data.data ?? []
  } catch {
    // The filter keeps only «همه بیمه‌ها» when the list fails
    insurances.value = []
  }
}

// Paging, loading and error state come from the shared composable (0-based BACK paging behind a 1-based UPagination).
// Staff-only filters are sent only when set; BACK treats a missing param as no filter.
const { items, total, totalPages, page, loading, error, forbidden, reload } = usePagedList(
  ({ page: backendPage, size }) => {
    const params = { page: backendPage, size }
    if (filters.status !== 'all') params.status = filters.status
    if (isStaff.value) {
      if (filters.insuranceId !== 'all') params.insuranceId = filters.insuranceId
      if (filters.q) params.q = filters.q
      if (filters.createdFrom) params.createdFrom = filters.createdFrom
      if (filters.createdTo) params.createdTo = filters.createdTo
    }
    return app.$api.prescription.listPrescriptions(isStaff.value, { params })
  },
  { size: PAGE_SIZE, filters }
)

const patientName = (item) => `${item.patientFirstName ?? ''} ${item.patientLastName ?? ''}`.trim() || '—'

// Base insurance and the supplementary one, joined. Neither set means the prescription is free («آزاد»)
const insuranceText = (item) =>
  [item.insuranceName, item.supplementaryInsuranceName].filter(Boolean).join(' + ') || 'آزاد'

onMounted(loadInsurances)

useHead({ title: isStaff.value ? 'نسخه‌ها | پنل مدیریت' : 'نسخه‌های من | پنل کاربری' })
</script>

<style scoped>
.sk-enter-active { transition: opacity 0.25s ease; }
.sk-leave-active { transition: opacity 0.25s ease; position: absolute; inset: 0; }
.sk-enter-from, .sk-leave-to { opacity: 0; }
</style>
