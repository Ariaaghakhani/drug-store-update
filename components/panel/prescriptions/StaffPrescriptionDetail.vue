<!-- components/panel/prescriptions/StaffPrescriptionDetail.vue -->
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
            <div
              v-if="rx.status === 'CANCELLED'"
              class="mt-4 rounded-xl bg-error/10 dark:bg-error/20 p-4 space-y-1"
            >
              <p class="text-sm font-bold text-error">این نسخه لغو شده است</p>
              <p v-if="rx.cancelReason" class="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line">
                {{ rx.cancelReason }}
              </p>
            </div>
          </UCard>

          <!-- Actions for the current state. One primary per state; the rest are outline or ghost -->
          <UCard>
            <h4 class="text-sm font-bold text-gray-900 dark:text-white mb-3">اقدامات</h4>
            <div class="flex items-center gap-2 flex-wrap">
              <UButton
                v-if="canRespond"
                color="primary"
                icon="i-heroicons-chat-bubble-left-ellipsis"
                :disabled="Boolean(busy)"
                @click="showRespond = true"
              >
                پاسخ به نسخه
              </UButton>

              <template v-if="receiptReview">
                <UButton
                  color="primary"
                  icon="i-heroicons-check-circle"
                  :loading="busy === 'approve'"
                  :disabled="Boolean(busy)"
                  @click="approveReceipt"
                >
                  تأیید رسید
                </UButton>
                <UButton
                  color="error"
                  variant="outline"
                  icon="i-heroicons-x-circle"
                  :disabled="Boolean(busy)"
                  @click="rejectOpen = true"
                >
                  رد رسید
                </UButton>
              </template>

              <UButton
                v-if="canReady"
                :color="paymentOk ? 'primary' : 'neutral'"
                :variant="paymentOk ? 'solid' : 'outline'"
                icon="i-heroicons-archive-box"
                :loading="busy === 'ready'"
                :disabled="Boolean(busy) || !paymentOk"
                @click="runAction('ready', () => app.$api.prescription.markReady(rx.id), 'نسخه آماده‌ی تحویل شد')"
              >
                آماده‌ی تحویل
              </UButton>

              <UButton
                v-if="canShip"
                :color="paymentOk ? 'primary' : 'neutral'"
                :variant="paymentOk ? 'solid' : 'outline'"
                icon="i-heroicons-truck"
                :loading="busy === 'ship'"
                :disabled="Boolean(busy) || !paymentOk"
                @click="runAction('ship', () => app.$api.prescription.markShipped(rx.id), 'نسخه با پیک ارسال شد')"
              >
                ارسال با پیک
              </UButton>

              <UButton
                v-if="canDeliver"
                color="primary"
                icon="i-heroicons-hand-raised"
                :loading="busy === 'deliver'"
                :disabled="Boolean(busy)"
                @click="runAction('deliver', () => app.$api.prescription.markDelivered(rx.id), 'نسخه تحویل شد')"
              >
                تحویل شد
              </UButton>

              <UButton
                v-if="canStaffCancel"
                color="error"
                variant="outline"
                icon="i-heroicons-x-mark"
                :disabled="Boolean(busy)"
                @click="cancelOpen = true"
              >
                لغو
              </UButton>

              <UButton
                color="error"
                variant="ghost"
                icon="i-heroicons-trash"
                :disabled="Boolean(busy)"
                @click="deleteOpen = true"
              >
                حذف
              </UButton>
            </div>
            <p v-if="(canReady || canShip) && !paymentOk" class="text-xs text-warning mt-3">
              پرداخت کارت به کارت هنوز تأیید نشده است. ابتدا رسید را بررسی و تأیید کنید.
            </p>
          </UCard>

          <!-- Sender and patient -->
          <UCard>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-sm">
              <div>
                <p class="text-xs text-gray-500 dark:text-gray-400">فرستنده</p>
                <p class="text-gray-900 dark:text-white mt-0.5">{{ rx.personName || '—' }}</p>
              </div>
              <div>
                <p class="text-xs text-gray-500 dark:text-gray-400">موبایل فرستنده</p>
                <p dir="ltr" class="text-gray-900 dark:text-white mt-0.5 text-start">{{ rx.personPhone || '—' }}</p>
              </div>
              <div>
                <p class="text-xs text-gray-500 dark:text-gray-400">بیمار</p>
                <p class="text-gray-900 dark:text-white mt-0.5">{{ patientName }}</p>
              </div>
              <div>
                <p class="text-xs text-gray-500 dark:text-gray-400">کد ملی بیمار</p>
                <p dir="ltr" class="text-gray-900 dark:text-white mt-0.5 text-start">{{ rx.patientNationalCode || '—' }}</p>
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

          <!-- Prescription image or PDF -->
          <UCard v-if="rx.hasImage">
            <h4 class="text-sm font-bold text-gray-900 dark:text-white mb-3">فایل نسخه</h4>
            <PrescriptionFileView :loader="() => app.$api.prescription.imageRequest(true, rx.id)" alt="عکس نسخه" />
          </UCard>

          <!-- Our answer -->
          <UCard v-if="rx.respondedAt">
            <h4 class="text-sm font-bold text-gray-900 dark:text-white mb-3">پاسخ داروخانه</h4>
            <dl class="grid grid-cols-1 sm:grid-cols-3 gap-x-6 gap-y-3 text-sm">
              <div>
                <dt class="text-xs text-gray-500 dark:text-gray-400">قیمت داروها</dt>
                <dd class="text-gray-900 dark:text-white mt-0.5">{{ formatMoney(rx.drugPrice) }}</dd>
              </div>
              <div>
                <dt class="text-xs text-gray-500 dark:text-gray-400">هزینه‌ی پیک داروخانه</dt>
                <dd class="text-gray-900 dark:text-white mt-0.5">{{ formatMoney(rx.courierFee) }}</dd>
              </div>
              <div>
                <dt class="text-xs text-gray-500 dark:text-gray-400">مبلغ قابل پرداخت</dt>
                <dd class="text-gray-900 dark:text-white font-bold mt-0.5">{{ formatMoney(rx.payableAmount) }}</dd>
              </div>
              <div>
                <dt class="text-xs text-gray-500 dark:text-gray-400">پاسخ دهنده</dt>
                <dd class="text-gray-900 dark:text-white mt-0.5">{{ rx.respondedByName || '—' }}</dd>
              </div>
              <div>
                <dt class="text-xs text-gray-500 dark:text-gray-400">زمان پاسخ</dt>
                <dd class="text-gray-900 dark:text-white mt-0.5">{{ formatJalali(rx.respondedAt, { withTime: true }) }}</dd>
              </div>
            </dl>
            <p v-if="rx.responseNote" class="text-sm text-gray-700 dark:text-gray-300 mt-4 whitespace-pre-line">
              {{ rx.responseNote }}
            </p>
          </UCard>

          <!-- Customer choices after the answer -->
          <UCard v-if="rx.deliveryMethod">
            <h4 class="text-sm font-bold text-gray-900 dark:text-white mb-3">انتخاب مشتری</h4>
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

          <!-- Card-to-card receipt: review when RECEIPT_SUBMITTED, history once there is one -->
          <UCard v-if="rx.hasReceipt">
            <h4 class="text-sm font-bold text-gray-900 dark:text-white mb-3">رسید کارت به کارت</h4>
            <div
              v-if="rx.paymentStatus === 'RECEIPT_SUBMITTED'"
              class="rounded-xl bg-info/10 dark:bg-info/20 p-3 mb-3"
            >
              <p class="text-sm text-gray-700 dark:text-gray-300">رسید منتظر بررسی شماست.</p>
            </div>
            <p v-if="rx.paymentStatus === 'RECEIPT_REJECTED' && rx.receiptRejectReason" class="text-sm text-error mb-3 whitespace-pre-line">
              رد شده: {{ rx.receiptRejectReason }}
            </p>
            <UButton
              color="neutral"
              variant="outline"
              icon="i-heroicons-eye"
              @click="receiptOpen = !receiptOpen"
            >
              {{ receiptOpen ? 'پنهان کردن رسید' : 'مشاهده رسید' }}
            </UButton>
            <div v-if="receiptOpen" class="mt-4">
              <PrescriptionFileView :loader="() => app.$api.prescription.receiptRequest(true, rx.id)" alt="رسید کارت به کارت" />
            </div>
          </UCard>
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
          text="این نسخه وجود ندارد یا حذف شده است"
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

    <template v-if="rx">
      <PrescriptionRespondModal
        v-model:open="showRespond"
        :prescription="rx"
        @done="onAnswered"
      />
    </template>

    <PanelConfirmDialog
      v-model:open="rejectOpen"
      title="رد رسید"
      message="رسید کارت به کارت رد می‌شود و مشتری باید رسید دیگری بفرستد. دلیل را بنویسید؛ مشتری آن را می‌بیند."
      confirm-label="رد رسید"
      confirm-color="error"
      note-label="دلیل رد رسید"
      :note-required="true"
      :loading="busy === 'reject'"
      @confirm="rejectReceipt"
    />

    <PanelConfirmDialog
      v-model:open="cancelOpen"
      title="لغو نسخه"
      message="نسخه لغو می‌شود. اگر دلیلی دارید بنویسید تا مشتری ببیند."
      confirm-label="لغو نسخه"
      confirm-color="error"
      note-label="دلیل لغو (اختیاری)"
      :loading="busy === 'cancel'"
      @confirm="cancelPrescription"
    />

    <PanelConfirmDialog
      v-model:open="deleteOpen"
      title="حذف نسخه"
      message="نسخه همراه با عکس و رسیدهایش حذف می‌شود و قابل بازگشت نیست."
      confirm-label="حذف"
      confirm-color="error"
      :loading="busy === 'delete'"
      @confirm="deletePrescription"
    />
  </div>
</template>

<script setup>
// Staff view of one prescription (module PRESCRIPTION): the sender, the patient, the file, our answer, the customer's
// choices, the card-to-card receipt, and the lifecycle actions. Every write reloads the prescription from the server.
import PanelEmptyState from '@/components/panel/PanelEmptyState.vue'
import PanelConfirmDialog from '@/components/panel/PanelConfirmDialog.vue'
import StatusBadge from '@/components/panel/StatusBadge.vue'
import PrescriptionFileView from '@/components/panel/prescriptions/PrescriptionFileView.vue'
import PrescriptionRespondModal from '@/components/panel/prescriptions/PrescriptionRespondModal.vue'
import { formatJalali } from '@/utils/jalali.js'
import { formatMoney } from '~/utils/money.js'
import { apiErrorMessage, isPending } from '~/utils/apiError.js'
import {
  deliveryMethodLabel,
  paymentMethodLabel,
  paymentStatusMeta,
  prescriptionStatusMeta,
} from '~/utils/prescriptionMeta.js'

// Staff detail (GET api/admin/prescriptions/{id}). Loads its own data; every action reloads it afterwards.
const props = defineProps({
  id: { type: [Number, String], required: true },
})

const app = useNuxtApp()
const toast = useAppToast()

const loading = ref(true)
const rx = ref(null)
const loadError = ref(null) // { status } when the load failed or the prescription is missing
const notFound = computed(() => loadError.value?.status === 404)
const forbidden = computed(() => loadError.value?.status === 403)

const patientName = computed(() => {
  if (!rx.value) return ''
  return `${rx.value.patientFirstName ?? ''} ${rx.value.patientLastName ?? ''}`.trim() || '—'
})

// ---- state rules (mirror BACK's PrescriptionStatus / fulfillment checks; BACK still decides with 409) ----
const status = computed(() => rx.value?.status)
const RESPONSE_STATUSES = ['AVAILABLE', 'PARTIALLY_AVAILABLE', 'UNAVAILABLE', 'INVALID']
const canRespond = computed(() => status.value === 'SUBMITTED' || RESPONSE_STATUSES.includes(status.value))
const receiptReview = computed(() => rx.value?.paymentStatus === 'RECEIPT_SUBMITTED')
const canReady = computed(() =>
  status.value === 'CONFIRMED' && ['PICKUP', 'CUSTOMER_COURIER'].includes(rx.value?.deliveryMethod)
)
const canShip = computed(() => status.value === 'CONFIRMED' && rx.value?.deliveryMethod === 'STORE_COURIER')
const canDeliver = computed(() => ['READY', 'SHIPPED'].includes(status.value))
const canStaffCancel = computed(() => !['DELIVERED', 'CANCELLED'].includes(status.value))
// Card-to-card waits for a PAID payment before it can be packed or sent; cash on delivery does not
const paymentOk = computed(() => rx.value?.paymentMethod !== 'CARD_TO_CARD' || rx.value?.paymentStatus === 'PAID')

// ---- loading ----
async function load(silent = false) {
  if (!silent) loading.value = true
  try {
    const response = await app.$api.prescription.getPrescription(true, props.id)
    rx.value = response.data.data ?? null
    loadError.value = rx.value ? null : { status: 404 }
  } catch (error) {
    rx.value = null
    loadError.value = { status: error?.response?.status ?? 0 }
  } finally {
    loading.value = false
  }
}

const retry = () => {
  loading.value = true
  load()
}

onMounted(() => load())

// ---- actions ----
const busy = ref('') // the running action's key; every action button is disabled while it is set
const showRespond = ref(false)
const receiptOpen = ref(false)
const rejectOpen = ref(false)
const cancelOpen = ref(false)
const deleteOpen = ref(false)

// One write: success toasts and reloads; a workflow-pending answer only reloads (the plugin already toasted);
// an error toasts and reloads too, because a 409 means the prescription moved on.
async function runAction(key, request, successText) {
  busy.value = key
  try {
    const res = await request()
    if (!isPending(res) && successText) toast.success(successText)
    await load(true)
    return true
  } catch (e) {
    toast.error(apiErrorMessage(e, 'عملیات ناموفق بود'))
    await load(true)
    return false
  } finally {
    busy.value = ''
  }
}

const approveReceipt = () =>
  runAction('approve', () => app.$api.prescription.approveReceipt(rx.value.id), 'رسید تأیید شد')

async function rejectReceipt(reason) {
  const done = await runAction(
    'reject',
    () => app.$api.prescription.rejectReceipt(rx.value.id, { data: { reason } }),
    'رسید رد شد'
  )
  if (done) rejectOpen.value = false
}

async function cancelPrescription(reason) {
  const done = await runAction(
    'cancel',
    () => app.$api.prescription.cancelPrescription(true, rx.value.id, reason ? { data: { reason } } : undefined),
    'نسخه لغو شد'
  )
  if (done) cancelOpen.value = false
}

async function deletePrescription() {
  busy.value = 'delete'
  try {
    await app.$api.prescription.deletePrescription(rx.value.id)
    toast.success('نسخه حذف شد')
    deleteOpen.value = false
    await navigateTo('/panel/prescriptions')
  } catch (e) {
    deleteOpen.value = false
    toast.error(apiErrorMessage(e, 'حذف نسخه ناموفق بود'))
    await load(true)
  } finally {
    busy.value = ''
  }
}

// The respond modal hands back the saved DTO, or a pending marker: reloading covers both
const onAnswered = () => load(true)
</script>

<style scoped>
.sk-enter-active { transition: opacity 0.25s ease; }
.sk-leave-active { transition: opacity 0.25s ease; position: absolute; inset: 0; }
.sk-enter-from, .sk-leave-to { opacity: 0; }
</style>
