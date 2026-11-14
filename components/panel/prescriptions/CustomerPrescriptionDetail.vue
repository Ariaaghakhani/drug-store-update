<template>
  <div class="space-y-4">
    <div class="relative">
      <Transition name="sk">
        <div v-if="loading" key="skeleton" class="space-y-4">
          <USkeleton class="h-24 w-full rounded-xl" />
          <USkeleton class="h-40 w-full rounded-xl" />
          <USkeleton class="h-32 w-3/4 rounded-xl" />
        </div>

        <div v-else-if="rx" key="content" class="space-y-4">
          <!-- Header -->
          <UCard>
            <div class="flex items-center gap-2 flex-wrap">
              <span class="text-base font-bold text-gray-900 dark:text-white">
                نسخه #{{ rx.id.toLocaleString('fa-IR') }}
              </span>
              <StatusBadge :meta="prescriptionStatusMeta(rx.status)" />
              <StatusBadge v-if="rx.paymentStatus" :meta="paymentStatusMeta(rx.paymentStatus)" />
            </div>
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
              <template v-if="rx.trackingCode">
                کد رهگیری: <span dir="ltr" class="font-mono">{{ rx.trackingCode }}</span> ·
              </template>
              ثبت شده در {{ formatJalali(rx.createdAt, { withTime: true }) }}
            </p>
          </UCard>

          <!-- Outcome that ends the flow: the reason from the store or the cancellation -->
          <UCard v-if="terminal">
            <div class="rounded-xl bg-error/10 dark:bg-error/20 p-4 space-y-1">
              <p class="text-sm font-bold text-error">{{ terminalTitle }}</p>
              <p v-if="terminalText" class="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line">
                {{ terminalText }}
              </p>
            </div>
          </UCard>

          <!-- Progress -->
          <UCard v-else>
            <ol class="flex items-start gap-2" aria-label="مراحل نسخه">
              <li
                v-for="(step, index) in STEPS"
                :key="step.label"
                class="flex-1 min-w-0 flex flex-col items-center gap-2 text-center"
                :aria-current="index === currentStep ? 'step' : undefined"
              >
                <span
                  class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                  :class="index <= currentStep
                    ? 'bg-brand-500 text-white dark:bg-brand-400'
                    : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'"
                >
                  <UIcon v-if="index < currentStep" name="i-heroicons-check" class="w-4 h-4" />
                  <template v-else>{{ (index + 1).toLocaleString('fa-IR') }}</template>
                </span>
                <span
                  class="text-xs leading-5"
                  :class="index <= currentStep ? 'text-gray-900 dark:text-white font-medium' : 'text-gray-500 dark:text-gray-400'"
                >
                  {{ step.label }}
                </span>
              </li>
            </ol>
          </UCard>

          <!-- Patient, doctor, insurance -->
          <UCard>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-sm">
              <div>
                <p class="text-xs text-gray-500 dark:text-gray-400">بیمار</p>
                <p class="text-gray-900 dark:text-white mt-0.5">{{ patientName }}</p>
              </div>
              <div>
                <p class="text-xs text-gray-500 dark:text-gray-400">کد ملی بیمار</p>
                <p dir="ltr" class="text-gray-900 dark:text-white mt-0.5 text-start">{{ rx.patientNationalCode }}</p>
              </div>
              <div>
                <p class="text-xs text-gray-500 dark:text-gray-400">پزشک</p>
                <p class="text-gray-900 dark:text-white mt-0.5">{{ rx.doctorName || '—' }}</p>
              </div>
              <div>
                <p class="text-xs text-gray-500 dark:text-gray-400">شماره نظام پزشکی</p>
                <p dir="ltr" class="text-gray-900 dark:text-white mt-0.5 text-start">{{ rx.doctorLicense || '—' }}</p>
              </div>
              <div>
                <p class="text-xs text-gray-500 dark:text-gray-400">تاریخ صدور</p>
                <p class="text-gray-900 dark:text-white mt-0.5">{{ rx.dateIssued ? formatJalali(rx.dateIssued) : '—' }}</p>
              </div>
              <div>
                <p class="text-xs text-gray-500 dark:text-gray-400">بیمه‌ی پایه</p>
                <p class="text-gray-900 dark:text-white mt-0.5">{{ rx.insuranceName || 'آزاد' }}</p>
              </div>
              <div>
                <p class="text-xs text-gray-500 dark:text-gray-400">بیمه‌ی تکمیلی</p>
                <p class="text-gray-900 dark:text-white mt-0.5">{{ rx.supplementaryInsuranceName || 'آزاد' }}</p>
              </div>
            </div>
            <p v-if="rx.notes" class="text-sm text-gray-700 dark:text-gray-300 mt-4 whitespace-pre-line">{{ rx.notes }}</p>
          </UCard>

          <!-- Store response: prices (formatPrice, no conversion) -->
          <UCard v-if="rx.respondedAt">
            <h4 class="text-sm font-bold text-gray-900 dark:text-white mb-3">پاسخ داروخانه</h4>
            <dl class="grid grid-cols-1 sm:grid-cols-3 gap-x-6 gap-y-3 text-sm">
              <div>
                <dt class="text-xs text-gray-500 dark:text-gray-400">قیمت دارو</dt>
                <dd class="text-gray-900 dark:text-white mt-0.5">{{ money(rx.drugPrice) }}</dd>
              </div>
              <div>
                <dt class="text-xs text-gray-500 dark:text-gray-400">هزینه‌ی پیک</dt>
                <dd class="text-gray-900 dark:text-white mt-0.5">{{ money(rx.courierFee) }}</dd>
              </div>
              <div>
                <dt class="text-xs text-gray-500 dark:text-gray-400">مبلغ قابل پرداخت</dt>
                <dd class="text-gray-900 dark:text-white font-bold mt-0.5">{{ money(rx.payableAmount) }}</dd>
              </div>
            </dl>
            <p v-if="rx.responseNote" class="text-sm text-gray-700 dark:text-gray-300 mt-4 whitespace-pre-line">
              {{ rx.responseNote }}
            </p>
          </UCard>

          <!-- Confirmed choices -->
          <UCard v-if="rx.deliveryMethod">
            <h4 class="text-sm font-bold text-gray-900 dark:text-white mb-3">انتخاب شما</h4>
            <dl class="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
              <div>
                <dt class="text-xs text-gray-500 dark:text-gray-400">روش تحویل</dt>
                <dd class="text-gray-900 dark:text-white mt-0.5">{{ deliveryMethodLabel(rx.deliveryMethod) }}</dd>
              </div>
              <div>
                <dt class="text-xs text-gray-500 dark:text-gray-400">روش پرداخت</dt>
                <dd class="text-gray-900 dark:text-white mt-0.5">{{ paymentMethodLabel(rx.paymentMethod) }}</dd>
              </div>
              <div v-if="rx.shippingAddress?.fullAddress" class="sm:col-span-2">
                <dt class="text-xs text-gray-500 dark:text-gray-400">آدرس تحویل</dt>
                <dd class="text-gray-900 dark:text-white mt-0.5">{{ rx.shippingAddress.fullAddress }}</dd>
              </div>
              <div v-if="rx.courierName">
                <dt class="text-xs text-gray-500 dark:text-gray-400">نام پیک</dt>
                <dd class="text-gray-900 dark:text-white mt-0.5">{{ rx.courierName }}</dd>
              </div>
              <div v-if="rx.courierPhone">
                <dt class="text-xs text-gray-500 dark:text-gray-400">موبایل پیک</dt>
                <dd dir="ltr" class="text-gray-900 dark:text-white mt-0.5 text-start">{{ rx.courierPhone }}</dd>
              </div>
            </dl>
          </UCard>

          <!-- Card-to-card receipt (AWAITING_RECEIPT or RECEIPT_REJECTED: send one; RECEIPT_SUBMITTED: wait; PAID: done) -->
          <UCard v-if="canUploadReceipt || rx.hasReceipt">
            <h4 class="text-sm font-bold text-gray-900 dark:text-white mb-3">رسید کارت به کارت</h4>
            <div
              v-if="rx.paymentStatus === 'RECEIPT_REJECTED'"
              class="rounded-xl bg-error/10 dark:bg-error/20 p-3 mb-3 space-y-1"
            >
              <p class="text-xs font-bold text-error">رسید قبلی رد شد</p>
              <p v-if="rx.receiptRejectReason" class="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line">
                {{ rx.receiptRejectReason }}
              </p>
            </div>
            <p v-if="canUploadReceipt" class="text-sm text-gray-600 dark:text-gray-300 mb-3">
              مبلغ قابل پرداخت را به شماره کارت زیر واریز کنید و عکس رسید را بفرستید.
            </p>
            <div v-if="options?.cardNumber" class="rounded-xl bg-gray-50 dark:bg-gray-800/50 p-3 mb-3 space-y-1">
              <p dir="ltr" class="font-mono text-sm font-bold text-gray-900 dark:text-white text-start">{{ options.cardNumber }}</p>
              <p v-if="options.cardHolder" class="text-xs text-gray-700 dark:text-gray-300">به نام: {{ options.cardHolder }}</p>
            </div>
            <p v-if="rx.paymentStatus === 'RECEIPT_SUBMITTED'" class="text-sm text-gray-600 dark:text-gray-300 mb-3">
              رسید شما دریافت شد و در انتظار بررسی فروشگاه است.
            </p>
            <div class="flex items-center gap-2 flex-wrap">
              <UButton v-if="canUploadReceipt" color="primary" icon="i-heroicons-arrow-up-tray" @click="showReceiptUpload = true">
                ارسال رسید
              </UButton>
              <UButton
                v-if="rx.hasReceipt"
                color="neutral"
                variant="outline"
                icon="i-heroicons-eye"
                @click="receiptOpen = !receiptOpen"
              >
                {{ receiptOpen ? 'پنهان کردن رسید' : 'مشاهده رسید' }}
              </UButton>
            </div>
            <div v-if="receiptOpen" class="mt-4">
              <PrescriptionFileView :loader="() => app.$api.prescription.receiptRequest(false, rx.id)" alt="رسید کارت به کارت" />
            </div>
          </UCard>

          <!-- Prescription image or PDF -->
          <UCard v-if="rx.hasImage">
            <h4 class="text-sm font-bold text-gray-900 dark:text-white mb-3">فایل نسخه</h4>
            <PrescriptionFileView :loader="() => app.$api.prescription.imageRequest(false, rx.id)" alt="عکس نسخه" />
          </UCard>

          <!-- Confirm delivery and payment (AVAILABLE or PARTIALLY_AVAILABLE) -->
          <UCard v-if="canConfirm">
            <div class="flex items-center justify-between gap-3 flex-wrap">
              <div class="min-w-0">
                <h4 class="text-sm font-bold text-gray-900 dark:text-white">انتخاب تحویل و پرداخت</h4>
                <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  داروخانه جواب داده است. روش تحویل و پرداخت را انتخاب و تأیید کنید.
                </p>
              </div>
              <UButton color="primary" icon="i-heroicons-check-circle" @click="showConfirm = true">
                تأیید تحویل و پرداخت
              </UButton>
            </div>
          </UCard>

          <!-- Cancel (before the store confirms delivery and payment) -->
          <div v-if="canCancel" class="flex justify-end">
            <UButton color="error" variant="soft" icon="i-heroicons-x-circle" @click="showCancel = true">
              لغو نسخه
            </UButton>
          </div>
        </div>

        <PanelEmptyState
          v-else-if="forbidden"
          key="forbidden"
          variant="forbidden"
          title="دسترسی به این نسخه ندارید"
        />
        <PanelEmptyState
          v-else-if="notFound"
          key="not-found"
          icon="i-heroicons-document-text"
          title="نسخه یافت نشد"
          text="این نسخه وجود ندارد یا به شما تعلق ندارد"
        >
          <template #action>
            <UButton to="/panel/prescriptions" color="primary" icon="i-heroicons-arrow-right">
              بازگشت به نسخه‌ها
            </UButton>
          </template>
        </PanelEmptyState>
        <PanelEmptyState v-else key="error" variant="error" title="دریافت نسخه ناموفق بود">
          <template #action>
            <UButton color="neutral" variant="soft" icon="i-heroicons-arrow-path" @click="retry">
              تلاش دوباره
            </UButton>
          </template>
        </PanelEmptyState>
      </Transition>
    </div>

    <PanelConfirmDialog
      v-model:open="showCancel"
      title="لغو نسخه"
      message="آیا از لغو این نسخه مطمئن هستید؟ بعد از لغو، برای ارسال دوباره باید نسخه‌ی تازه ثبت کنید."
      confirm-label="لغو نسخه"
      confirm-color="error"
      :loading="cancelling"
      @confirm="confirmCancel"
    />

    <template v-if="rx">
      <PrescriptionConfirmModal
        v-model:open="showConfirm"
        :prescription="rx"
        :options="options"
        @done="load"
      />

      <ReceiptUploadModal
        v-model:open="showReceiptUpload"
        :prescription-id="rx.id"
        :reject-reason="rx.paymentStatus === 'RECEIPT_REJECTED' ? rx.receiptRejectReason || '' : ''"
        @done="load"
      />
    </template>
  </div>
</template>

<script setup>
import PanelEmptyState from '@/components/panel/PanelEmptyState.vue'
import PanelConfirmDialog from '@/components/panel/PanelConfirmDialog.vue'
import StatusBadge from '@/components/panel/StatusBadge.vue'
import PrescriptionConfirmModal from '@/components/panel/prescriptions/PrescriptionConfirmModal.vue'
import PrescriptionFileView from '@/components/panel/prescriptions/PrescriptionFileView.vue'
import ReceiptUploadModal from '@/components/panel/prescriptions/ReceiptUploadModal.vue'
import { formatJalali } from '@/utils/jalali.js'
import { apiErrorMessage } from '~/utils/apiError.js'
import {
  CUSTOMER_CANCELLABLE,
  deliveryMethodLabel,
  paymentMethodLabel,
  paymentStatusMeta,
  prescriptionStatusMeta,
} from '~/utils/prescriptionMeta.js'

// Customer view of one prescription (GET api/prescriptions/my/{id}). Loads its own data and the store options.
// Actions (cancel, and the confirm and receipt steps added later) reload this view after they finish.
const props = defineProps({
  id: { type: [Number, String], required: true },
})

const app = useNuxtApp()
const toast = useAppToast()
const { formatPrice } = useFormat()

// Progress steps. The payment state is shown in the header; the steps follow the prescription status
const STEPS = [
  { label: 'ثبت نسخه', statuses: ['SUBMITTED'] },
  { label: 'پاسخ داروخانه', statuses: ['AVAILABLE', 'PARTIALLY_AVAILABLE'] },
  { label: 'تأیید و پرداخت', statuses: ['CONFIRMED'] },
  { label: 'آماده‌سازی و ارسال', statuses: ['READY', 'SHIPPED'] },
  { label: 'تحویل', statuses: ['DELIVERED'] },
]
const TERMINAL_TITLES = {
  CANCELLED: 'این نسخه لغو شده است',
  UNAVAILABLE: 'داروهای این نسخه در داروخانه موجود نیست',
  INVALID: 'این نسخه نامعتبر است',
}

const loading = ref(true)
const rx = ref(null)
const loadError = ref(null) // { status, message } when the load failed or the prescription is missing
const notFound = computed(() => loadError.value?.status === 404)
const forbidden = computed(() => loadError.value?.status === 403)

const money = (value) => (value === null || value === undefined ? '—' : formatPrice(value))
const patientName = computed(() => {
  if (!rx.value) return ''
  return `${rx.value.patientFirstName ?? ''} ${rx.value.patientLastName ?? ''}`.trim() || '—'
})

const status = computed(() => rx.value?.status)
const terminal = computed(() => Object.keys(TERMINAL_TITLES).includes(status.value))
const terminalTitle = computed(() => TERMINAL_TITLES[status.value] ?? '')
const terminalText = computed(() => {
  if (status.value === 'CANCELLED') return rx.value?.cancelReason || ''
  return rx.value?.responseNote || ''
})
const currentStep = computed(() => STEPS.findIndex((step) => step.statuses.includes(status.value)))
const canCancel = computed(() => CUSTOMER_CANCELLABLE.includes(status.value))
const canConfirm = computed(() => ['AVAILABLE', 'PARTIALLY_AVAILABLE'].includes(status.value))
const canUploadReceipt = computed(() =>
  ['AWAITING_RECEIPT', 'RECEIPT_REJECTED'].includes(rx.value?.paymentStatus)
)

// Store options (courier and card-to-card switches, card number). A failed call only hides the optional choices
const options = ref(null)
async function loadOptions() {
  try {
    const response = await app.$api.prescription.getPrescriptionOptions()
    options.value = response.data.data ?? null
  } catch {
    options.value = null
  }
}

const showConfirm = ref(false)
const showReceiptUpload = ref(false)
const receiptOpen = ref(false)

async function load() {
  try {
    const response = await app.$api.prescription.getPrescription(false, props.id)
    rx.value = response.data.data ?? null
    loadError.value = rx.value ? null : { status: 404 }
  } catch (error) {
    rx.value = null
    loadError.value = { status: error?.response?.status ?? 0, message: error?.response?.data?.message }
  } finally {
    loading.value = false
  }
}

const retry = () => {
  loading.value = true
  load()
}

onMounted(() => {
  load()
  loadOptions()
})

// ---------- cancel (SUBMITTED, AVAILABLE, PARTIALLY_AVAILABLE; BACK answers 409 otherwise) ----------
const showCancel = ref(false)
const cancelling = ref(false)

async function confirmCancel() {
  cancelling.value = true
  try {
    await app.$api.prescription.cancelPrescription(false, rx.value.id)
    showCancel.value = false
    toast.success('نسخه لغو شد')
  } catch (error) {
    showCancel.value = false
    toast.error(apiErrorMessage(error, 'لغو نسخه ناموفق بود'))
  } finally {
    cancelling.value = false
    await load()
  }
}

useHead({ title: 'جزئیات نسخه | پنل کاربری' })
</script>

<style scoped>
.sk-enter-active { transition: opacity 0.25s ease; }
.sk-leave-active { transition: opacity 0.25s ease; position: absolute; inset: 0; }
.sk-enter-from, .sk-leave-to { opacity: 0; }
</style>
