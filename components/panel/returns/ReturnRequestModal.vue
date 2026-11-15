<template>
  <UModal
    :open="open"
    :title="staff ? 'ثبت مرجوعی برای مشتری' : 'درخواست مرجوعی'"
    :description="orderId ? `سفارش #${Number(orderId).toLocaleString('fa-IR')}` : ''"
    @update:open="emit('update:open', $event)"
  >
    <template #body>
      <div dir="rtl" class="relative">
        <Transition name="sk">
          <div v-if="loading" key="skeleton" class="space-y-3">
            <USkeleton class="h-16 w-full rounded-xl" />
            <USkeleton class="h-9 w-full rounded-lg" />
            <USkeleton class="h-24 w-full rounded-lg" />
          </div>

          <div v-else-if="loadError" key="error" class="text-center py-6 space-y-4">
            <UIcon name="i-heroicons-exclamation-triangle" class="w-10 h-10 mx-auto text-gray-400 dark:text-gray-500" />
            <p class="text-sm text-gray-700 dark:text-gray-300">{{ loadError }}</p>
            <UButton color="neutral" variant="soft" icon="i-heroicons-arrow-path" @click="load">تلاش دوباره</UButton>
          </div>

          <div v-else-if="returnable && !returnable.open && !staff" key="closed" class="space-y-4">
            <div class="flex items-start gap-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 p-4">
              <UIcon name="i-heroicons-information-circle" class="w-5 h-5 mt-0.5 flex-shrink-0 text-info" />
              <p class="text-sm text-gray-700 dark:text-gray-300">{{ closedMessage }}</p>
            </div>
            <UButton color="neutral" variant="soft" block @click="close">بستن</UButton>
          </div>

          <div v-else-if="returnable && !lines.length" key="all-returned" class="space-y-4">
            <div class="flex items-start gap-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 p-4">
              <UIcon name="i-heroicons-information-circle" class="w-5 h-5 mt-0.5 flex-shrink-0 text-info" />
              <p class="text-sm text-gray-700 dark:text-gray-300">
                همه اقلام این سفارش قبلاً برای مرجوعی ثبت شده‌اند
              </p>
            </div>
            <UButton color="neutral" variant="soft" block @click="close">بستن</UButton>
          </div>

          <form v-else-if="returnable" key="form" class="space-y-4" @submit.prevent="submit">
            <div class="space-y-3">
              <p class="text-sm font-medium text-gray-900 dark:text-white">اقلام مرجوعی</p>
              <div
                v-for="line in lines"
                :key="line.orderItemId"
                class="rounded-xl border border-gray-200 dark:border-gray-700 p-3 space-y-3"
              >
                <UCheckbox v-model="line.checked" :label="line.goodsName" />
                <p class="text-xs text-gray-500 dark:text-gray-400 ps-6">
                  خریداری‌شده {{ Number(line.purchased ?? 0).toLocaleString('fa-IR') }} ·
                  قبلاً مرجوع‌شده {{ Number(line.alreadyReturned).toLocaleString('fa-IR') }} ·
                  قابل مرجوع {{ Number(line.remaining).toLocaleString('fa-IR') }}
                </p>
                <p v-if="!line.returnable && !staff" class="text-xs text-gray-500 dark:text-gray-400 ps-6">
                  این کالا فقط با دلیل عیب یا مغایرت قابل مرجوع است
                </p>
                <UFormField
                  v-if="line.checked"
                  label="تعداد مرجوعی"
                  :help="`حداکثر ${Number(line.remaining).toLocaleString('fa-IR')} عدد`"
                  :error="quantityError(line) || undefined"
                  class="ps-6"
                >
                  <UInput
                    v-model="line.quantityInput"
                    inputmode="numeric"
                    dir="ltr"
                    autocomplete="off"
                    class="w-32"
                    @blur="clampLine(line)"
                  />
                </UFormField>
              </div>
            </div>

            <UFormField label="دلیل مرجوعی">
              <USelect v-model="reason" :items="reasonOptions" placeholder="انتخاب دلیل" class="w-full" />
            </UFormField>

            <UFormField
              label="توضیحات (اختیاری)"
              :help="`${details.length.toLocaleString('fa-IR')} از ${MAX_DETAILS.toLocaleString('fa-IR')} کاراکتر`"
            >
              <UTextarea v-model="details" :rows="3" :maxlength="MAX_DETAILS" class="w-full" />
            </UFormField>

            <!-- Photos come from the customer; a staff-created return has none -->
            <ReturnPhotosField v-if="!staff" v-model="photos" :max="MAX_PHOTOS" />

            <p v-if="formError" role="alert" class="text-sm text-error">{{ formError }}</p>

            <div class="flex gap-3">
              <UButton color="neutral" variant="soft" class="flex-1 justify-center" @click="close">انصراف</UButton>
              <UButton
                type="submit"
                color="primary"
                class="flex-1 justify-center"
                :loading="submitting"
                :disabled="!canSubmit"
              >
                ثبت درخواست
              </UButton>
            </div>
          </form>
        </Transition>
      </div>
    </template>
  </UModal>
</template>

<script setup>
import ReturnPhotosField from '@/components/panel/returns/ReturnPhotosField.vue'

// Request form for a return on a delivered, paid order. Loads what is still returnable (GET .../orders/{id}), then
// creates the return (POST api/returns/my, or POST api/admin/returns in staff mode) and uploads each photo one by one.
// Photos are sent after the return exists, so a failed photo keeps the return and only warns.
const MAX_PHOTOS = 5
const MAX_DETAILS = 1000

const props = defineProps({
  open: { type: Boolean, required: true },
  orderId: { type: [Number, String], default: null },
  // Staff mode: a return created for the customer (phone or in person). Ignores the window, delivery and
  // change-of-mind rules, offers CHANGE_OF_MIND, has no photos, and posts to the admin endpoint.
  staff: { type: Boolean, default: false },
})
const emit = defineEmits(['update:open', 'created'])

const app = useNuxtApp()
const toast = useAppToast()

const loading = ref(false)
const loadError = ref('')
const returnable = ref(null)
const lines = ref([]) // one per item with remaining > 0
const reason = ref(null)
const details = ref('')
const photos = ref([])
const formError = ref('')
const submitting = ref(false)

const buildLines = (data) =>
  (data?.items ?? [])
    .filter((item) => Number(item.remaining) > 0)
    .map((item) => ({
      orderItemId: item.orderItemId,
      goodsName: item.goodsName || `کالا #${item.goodsId}`,
      purchased: item.purchased,
      alreadyReturned: item.alreadyReturned ?? 0,
      remaining: Number(item.remaining),
      returnable: Boolean(item.returnable),
      checked: false,
      quantityInput: String(item.remaining),
    }))

// Clamped to 1..remaining; null when the typed value is not a whole number
const lineQuantity = (line) => {
  const value = parseQuantity(line.quantityInput)
  if (value === null) return null
  return Math.min(Math.max(value, 1), line.remaining)
}
const clampLine = (line) => {
  const quantity = lineQuantity(line)
  if (quantity !== null) line.quantityInput = String(quantity)
}
const quantityError = (line) => (lineQuantity(line) === null ? 'یک عدد صحیح وارد کنید' : '')

const selectedLines = computed(() => lines.value.filter((line) => line.checked))
const hasInvalidQuantity = computed(() => selectedLines.value.some((line) => lineQuantity(line) === null))

// Change of mind needs the store's switch on and every selected item marked returnable (BACK checks the same)
const canChooseChangeOfMind = computed(
  () =>
    props.staff ||
    (Boolean(returnable.value?.changeOfMindAllowed) &&
    selectedLines.value.length > 0 &&
    selectedLines.value.every((line) => line.returnable))
)
const reasonOptions = computed(() =>
  Object.entries(RETURN_REASON_LABELS)
    .filter(([value]) => value !== 'CHANGE_OF_MIND' || canChooseChangeOfMind.value)
    .map(([value, label]) => ({ value, label }))
)
watch(canChooseChangeOfMind, (allowed) => {
  if (!allowed && reason.value === 'CHANGE_OF_MIND') reason.value = null
})

const closedMessage = computed(() => {
  const deadline = returnable.value?.deadline ? new Date(returnable.value.deadline) : null
  if (deadline && !Number.isNaN(deadline.getTime()) && deadline.getTime() < Date.now()) {
    return `مهلت ثبت درخواست مرجوعی این سفارش ${deadline.toLocaleDateString('fa-IR')} به پایان رسیده است.`
  }
  return 'این سفارش هنوز برای ثبت درخواست مرجوعی آماده نیست. پس از پرداخت و تحویل کامل سفارش می‌توانید درخواست دهید.'
})

const canSubmit = computed(
  () =>
    !submitting.value &&
    selectedLines.value.length > 0 &&
    !hasInvalidQuantity.value &&
    Boolean(reason.value) &&
    details.value.trim().length <= MAX_DETAILS
)

const close = () => emit('update:open', false)

async function load() {
  loading.value = true
  loadError.value = ''
  returnable.value = null
  lines.value = []
  try {
    const response = await app.$api.returns.getReturnable(props.staff, props.orderId)
    returnable.value = response.data.data ?? null
    lines.value = buildLines(returnable.value)
  } catch (error) {
    loadError.value = error?.response?.data?.message || 'دریافت اطلاعات مرجوعی ناموفق بود'
  } finally {
    loading.value = false
  }
}

const resetForm = () => {
  reason.value = null
  details.value = ''
  photos.value = []
  formError.value = ''
}

watch(
  () => props.open,
  (open) => {
    if (!open) return
    resetForm()
    load()
  },
  { immediate: true }
)

async function submit() {
  if (!canSubmit.value) return
  submitting.value = true
  formError.value = ''

  let created
  const body = {
    orderId: returnable.value.orderId,
    reason: reason.value,
    details: details.value.trim() || null,
    items: selectedLines.value.map((line) => ({
      orderItemId: line.orderItemId,
      quantity: lineQuantity(line),
    })),
  }
  try {
    const response = props.staff
      ? await app.$api.returns.createReturnForCustomer({ data: body })
      : await app.$api.returns.submitReturn({ data: body })
    created = response.data.data
  } catch (error) {
    formError.value = error?.response?.data?.message || 'ثبت درخواست مرجوعی ناموفق بود'
    submitting.value = false
    return
  }

  let failedPhotos = 0
  for (const photo of props.staff ? [] : photos.value) {
    try {
      const formData = new FormData()
      formData.append('file', photo)
      await app.$api.returns.uploadReturnPhoto(created.id, { data: formData })
    } catch {
      failedPhotos += 1
    }
  }
  submitting.value = false

  if (props.staff) {
    toast.success('مرجوعی برای مشتری ثبت شد', `شماره درخواست ${Number(created.id).toLocaleString('fa-IR')}`)
  } else if (failedPhotos) {
    toast.warning(
      'درخواست ثبت شد، اما برخی عکس‌ها ارسال نشد',
      `${failedPhotos.toLocaleString('fa-IR')} عکس ارسال نشد`
    )
  } else {
    toast.success('درخواست مرجوعی ثبت شد', `شماره درخواست ${Number(created.id).toLocaleString('fa-IR')}`)
  }

  emit('created', created)
  emit('update:open', false)
  await navigateTo(`/panel/returns/${created.id}`)
}
</script>

<style scoped>
.sk-enter-active { transition: opacity 0.25s ease; }
.sk-leave-active { transition: opacity 0.25s ease; position: absolute; inset: 0; }
.sk-enter-from, .sk-leave-to { opacity: 0; }
</style>
