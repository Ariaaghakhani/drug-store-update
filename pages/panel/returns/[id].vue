<!-- pages/panel/returns/[id].vue -->
<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between gap-3">
      <h3 class="text-xl font-black text-gray-900 dark:text-white">
        جزئیات <span class="text-brand-500">مرجوعی</span>
      </h3>
      <UButton to="/panel/returns" color="neutral" variant="outline" icon="i-heroicons-arrow-right">
        بازگشت به مرجوعی‌ها
      </UButton>
    </div>

    <div class="relative">
      <Transition name="sk">
        <div v-if="loading" key="skeleton" class="space-y-4">
          <USkeleton class="h-24 w-full rounded-xl" />
          <USkeleton class="h-40 w-full rounded-xl" />
          <USkeleton class="h-20 w-3/4 rounded-xl" />
        </div>

        <div v-else-if="ret" key="content" class="space-y-4">
          <!-- Header -->
          <UCard>
            <div class="flex items-center gap-2 flex-wrap">
              <span class="text-base font-bold text-gray-900 dark:text-white">
                درخواست #{{ ret.id.toLocaleString('fa-IR') }}
              </span>
              <UBadge :color="returnStatusMeta(ret.status).color" variant="subtle" size="xs">
                {{ returnStatusMeta(ret.status).label }}
              </UBadge>
              <UBadge v-if="ret.workflow?.pending" color="warning" variant="subtle" size="xs">
                در انتظار تأیید
              </UBadge>
            </div>
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
              <NuxtLink
                :to="`/panel/orders/${ret.orderId}`"
                class="hover:text-brand-500 dark:hover:text-brand-400 underline-offset-2 hover:underline"
              >
                سفارش #{{ ret.orderId.toLocaleString('fa-IR') }}
              </NuxtLink>
              · ثبت شده در {{ formatDateTime(ret.createdAt) }}
            </p>

            <dl class="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 mt-4 text-sm">
              <div>
                <dt class="text-xs text-gray-500 dark:text-gray-400">دلیل مرجوعی</dt>
                <dd class="text-gray-900 dark:text-white mt-0.5">{{ ret.reasonLabel || returnReasonLabel(ret.reason) }}</dd>
              </div>
              <div v-if="ret.returnMethod">
                <dt class="text-xs text-gray-500 dark:text-gray-400">نحوه بازگرداندن کالا</dt>
                <dd class="text-gray-900 dark:text-white mt-0.5">
                  {{ ret.returnMethodLabel || returnMethodLabel(ret.returnMethod) }}
                </dd>
              </div>
              <div v-if="ret.decidedAt">
                <dt class="text-xs text-gray-500 dark:text-gray-400">تاریخ تصمیم فروشگاه</dt>
                <dd class="text-gray-900 dark:text-white mt-0.5">{{ formatDateTime(ret.decidedAt) }}</dd>
              </div>
              <div v-if="ret.receivedAt">
                <dt class="text-xs text-gray-500 dark:text-gray-400">تاریخ دریافت کالا</dt>
                <dd class="text-gray-900 dark:text-white mt-0.5">{{ formatDateTime(ret.receivedAt) }}</dd>
              </div>
            </dl>

            <p v-if="ret.details" class="text-sm text-gray-700 dark:text-gray-300 mt-4 whitespace-pre-line">
              {{ ret.details }}
            </p>
          </UCard>

          <!-- Store decision (approval note, rejection or cancellation reason) -->
          <UCard v-if="ret.decisionNote">
            <div class="rounded-xl bg-brand-50 dark:bg-brand-900/20 p-3">
              <p class="text-xs font-bold text-brand-600 dark:text-brand-400 mb-1">پاسخ فروشگاه</p>
              <p class="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line">{{ ret.decisionNote }}</p>
            </div>
          </UCard>

          <!-- Items -->
          <UCard :ui="{ body: 'p-0' }">
            <div class="overflow-x-auto">
              <table class="w-full text-sm">
                <thead class="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800">
                  <tr>
                    <th class="text-xs font-medium text-gray-500 dark:text-gray-400 px-6 py-3 text-start">کالا</th>
                    <th class="text-xs font-medium text-gray-500 dark:text-gray-400 px-6 py-3 text-start">تعداد</th>
                    <th class="text-xs font-medium text-gray-500 dark:text-gray-400 px-6 py-3 text-start">قیمت واحد</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-100 dark:divide-gray-800">
                  <tr v-for="line in ret.items ?? []" :key="line.id">
                    <td class="px-6 py-3 text-gray-900 dark:text-white">{{ line.goodsName }}</td>
                    <td class="px-6 py-3 text-gray-700 dark:text-gray-300">
                      {{ (line.quantity ?? 0).toLocaleString('fa-IR') }}
                    </td>
                    <td class="px-6 py-3 text-gray-700 dark:text-gray-300">{{ formatToman(line.unitPrice) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </UCard>

          <!-- Amounts (the suggested amount is staff-only, so it is usually absent here) -->
          <UCard v-if="ret.refundAmount != null || ret.suggestedRefund != null">
            <dl class="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
              <div v-if="ret.suggestedRefund != null">
                <dt class="text-xs text-gray-500 dark:text-gray-400">مبلغ پیشنهادی بازپرداخت</dt>
                <dd class="text-gray-900 dark:text-white mt-0.5">{{ formatToman(ret.suggestedRefund) }}</dd>
              </div>
              <div v-if="ret.refundAmount != null">
                <dt class="text-xs text-gray-500 dark:text-gray-400">مبلغ بازپرداخت</dt>
                <dd class="text-gray-900 dark:text-white mt-0.5">{{ formatToman(ret.refundAmount) }}</dd>
              </div>
            </dl>
          </UCard>

          <!-- Photos (binary files: each one is fetched as a blob and shown through an object URL) -->
          <UCard v-if="ret.photos?.length">
            <h4 class="text-sm font-bold text-gray-900 dark:text-white mb-3">عکس‌های کالا</h4>
            <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div
                v-for="photo in ret.photos"
                :key="photo.id"
                class="aspect-square rounded-xl overflow-hidden border border-gray-100 dark:border-gray-800 bg-gray-100 dark:bg-gray-800"
              >
                <USkeleton v-if="photoUrls.get(String(photo.id)) === undefined" class="w-full h-full rounded-none" />
                <img
                  v-else-if="photoUrls.get(String(photo.id))"
                  :src="photoUrls.get(String(photo.id))"
                  :alt="photo.fileName || 'عکس کالای مرجوعی'"
                  class="w-full h-full object-cover"
                >
                <div v-else class="w-full h-full flex items-center justify-center">
                  <UIcon name="i-heroicons-photo" class="w-8 h-8 text-gray-400 dark:text-gray-600" />
                </div>
              </div>
            </div>
          </UCard>

          <!-- Tracking code (customer sends the parcel back) -->
          <UCard v-if="showTracking">
            <h4 class="text-sm font-bold text-gray-900 dark:text-white mb-1">کد رهگیری مرسوله</h4>
            <p class="text-xs text-gray-500 dark:text-gray-400 mb-3">
              پس از ارسال کالا، کد رهگیری مرسوله را برای فروشگاه ثبت کنید
            </p>
            <form class="flex items-start gap-3 flex-wrap" dir="rtl" @submit.prevent="submitTracking">
              <UFormField :error="trackingError" class="flex-1 min-w-48">
                <UInput
                  v-model="trackingCode"
                  maxlength="100"
                  dir="ltr"
                  placeholder="کد رهگیری"
                  class="w-full"
                  @blur="trackingError = validateTracking()"
                />
              </UFormField>
              <UButton type="submit" color="primary" :loading="savingTracking">ثبت کد رهگیری</UButton>
            </form>
          </UCard>

          <!-- Cancel (before the store receives the goods) -->
          <div v-if="canCancel" class="flex justify-end">
            <UButton color="error" variant="soft" icon="i-heroicons-x-circle" @click="showCancel = true">
              لغو درخواست مرجوعی
            </UButton>
          </div>
        </div>

        <!-- Not found / forbidden / failed load: never shown as an empty success -->
        <PanelEmptyState
          v-else-if="forbidden"
          key="forbidden"
          variant="forbidden"
          title="دسترسی به این مرجوعی ندارید"
        />
        <PanelEmptyState
          v-else-if="notFound"
          key="not-found"
          icon="i-heroicons-arrow-uturn-left"
          title="مرجوعی یافت نشد"
          :text="loadError?.message || 'این درخواست وجود ندارد یا به شما تعلق ندارد'"
        >
          <template #action>
            <UButton to="/panel/returns" color="primary" icon="i-heroicons-arrow-right">
              بازگشت به مرجوعی‌ها
            </UButton>
          </template>
        </PanelEmptyState>
        <PanelEmptyState v-else key="error" variant="error" title="دریافت مرجوعی ناموفق بود">
          <template #action>
            <UButton color="neutral" variant="soft" icon="i-heroicons-arrow-path" @click="retryLoad">
              تلاش دوباره
            </UButton>
          </template>
        </PanelEmptyState>
      </Transition>
    </div>

    <DeleteConfirmDialog
      v-model:open="showCancel"
      title="لغو درخواست مرجوعی"
      message="آیا از لغو این درخواست مرجوعی مطمئن هستید؟ پس از لغو، برای برگرداندن این کالا باید درخواست تازه ثبت کنید."
      :item-name="ret ? `درخواست #${ret.id.toLocaleString('fa-IR')}` : ''"
      confirm-label="لغو درخواست"
      @confirm="confirmCancel"
    />
  </div>
</template>

<script setup>
import DeleteConfirmDialog from '@/components/panel/DeleteConfirmDialog.vue'
import PanelEmptyState from '@/components/panel/PanelEmptyState.vue'

// Staff branch (BACKEND_SYNC_PLAN C1b) goes here: `isStaff` switches STAFF to true (admin routes), adds the
// approve/reject/receive/refund actions, shows suggestedRefund and the workflow gate. Until then every role uses the
// customer endpoints (`STAFF` = false).
const STAFF = false

const route = useRoute()
const app = useNuxtApp()
const toast = useAppToast()
const { previewUrl } = useFileDownload()

const loading = ref(true)
const ret = ref(null)
const loadError = ref(null) // { status, message } when the load failed or the return is missing

const notFound = computed(() => loadError.value?.status === 404)
const forbidden = computed(() => loadError.value?.status === 403)

const formatDateTime = (value) => {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '' : date.toLocaleString('fa-IR')
}

const formatToman = (value) => `${Number(value ?? 0).toLocaleString('fa-IR')} تومان`

// ---------- load ----------
// `photoUrls` maps photo id (string) -> object URL. undefined = loading, null = failed, string = ready.
const photoUrls = reactive(new Map())
let unmounted = false

const revokePhoto = (key) => {
  const url = photoUrls.get(key)
  if (typeof url === 'string') URL.revokeObjectURL(url)
  photoUrls.delete(key)
}

// Fetches only photos not shown yet and drops the ones that are gone, so a refresh does not re-download everything
async function syncPhotos(photos) {
  const keep = new Set(photos.map((photo) => String(photo.id)))
  ;[...photoUrls.keys()].forEach((key) => {
    if (!keep.has(key)) revokePhoto(key)
  })
  await Promise.all(
    photos
      .filter((photo) => !photoUrls.has(String(photo.id)))
      .map(async (photo) => {
        const key = String(photo.id)
        photoUrls.set(key, undefined)
        const path = app.$api.returns.photoPath(STAFF, ret.value.id, photo.id)
        const url = await previewUrl(app.$api.instances.default(path, { responseType: 'blob' }))
        // The page left while the file was loading: nothing will revoke this URL later
        if (unmounted) {
          if (url) URL.revokeObjectURL(url)
          return
        }
        photoUrls.set(key, url)
      })
  )
}

async function fetchReturn() {
  try {
    const response = await app.$api.returns.getReturn(STAFF, route.params.id)
    ret.value = response.data.data ?? null
    if (!ret.value) {
      loadError.value = { status: 404 }
      return
    }
    loadError.value = null
    trackingCode.value = ret.value.customerTrackingCode ?? ''
    await syncPhotos(ret.value.photos ?? [])
  } catch (error) {
    ret.value = null
    loadError.value = {
      status: error?.response?.status ?? 0,
      message: error?.response?.data?.message,
    }
  } finally {
    loading.value = false
  }
}

const retryLoad = () => {
  loading.value = true
  fetchReturn()
}

onMounted(fetchReturn)

onBeforeUnmount(() => {
  unmounted = true
  ;[...photoUrls.keys()].forEach(revokePhoto)
})

// ---------- tracking code (customer, APPROVED + CUSTOMER_SENDS; BACK replaces an earlier code) ----------
const showTracking = computed(
  () => ret.value?.status === 'APPROVED' && ret.value?.returnMethod === 'CUSTOMER_SENDS'
)
const trackingCode = ref('')
const trackingError = ref('')
const savingTracking = ref(false)

const validateTracking = () => {
  const value = trackingCode.value.trim()
  if (!value) return 'کد رهگیری را وارد کنید'
  if (value.length > 100) return `کد رهگیری حداکثر ${(100).toLocaleString('fa-IR')} نویسه است`
  return ''
}

async function submitTracking() {
  trackingError.value = validateTracking()
  if (trackingError.value) return
  savingTracking.value = true
  try {
    await app.$api.returns.setReturnTracking(ret.value.id, {
      data: { trackingCode: trackingCode.value.trim() },
    })
    toast.success('کد رهگیری ثبت شد')
    await fetchReturn()
  } catch (error) {
    toast.error('ثبت کد رهگیری ناموفق بود', error?.response?.data?.message)
  } finally {
    savingTracking.value = false
  }
}

// ---------- cancel (REQUESTED or APPROVED only) ----------
const canCancel = computed(() => ['REQUESTED', 'APPROVED'].includes(ret.value?.status))
const showCancel = ref(false)

async function confirmCancel() {
  try {
    await app.$api.returns.cancelReturn(STAFF, ret.value.id)
    showCancel.value = false
    toast.success('درخواست مرجوعی لغو شد')
  } catch (error) {
    // 409: the status moved on (e.g. the store already received the goods). Show BACK's reason, then reload
    showCancel.value = false
    toast.error('لغو درخواست ناموفق بود', error?.response?.data?.message)
  }
  await fetchReturn()
}

useHead({ title: 'جزئیات مرجوعی | پنل کاربری' })
</script>

<style scoped>
.sk-enter-active { transition: opacity 0.25s ease; }
.sk-leave-active { transition: opacity 0.25s ease; position: absolute; inset: 0; }
.sk-enter-from, .sk-leave-to { opacity: 0; }
</style>
