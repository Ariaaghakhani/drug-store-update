<!-- components/panel/sms/CampaignForm.vue -->
<template>
  <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
    <UCard class="lg:col-span-2">
      <form id="sms-campaign-form" dir="rtl" class="space-y-4 font-dana" @submit.prevent="submit">
        <UAlert
          v-if="campaignsOff"
          color="warning"
          variant="soft"
          icon="i-heroicons-exclamation-triangle"
          title="کمپین پیامک برای این فروشگاه فعال نیست"
          description="سهمیه‌ی ماهانه تعیین نشده است. برای فعال‌سازی با پشتیبانی پلتفرم تماس بگیرید یا حساب کاوه‌نگار خودتان را ثبت کنید."
        />

        <p v-if="submitError" class="text-sm text-error" role="alert">{{ submitError }}</p>

        <UFormField label="عنوان کمپین" required :error="errors.title" help="فقط برای خودتان است و به مشتری نشان داده نمی‌شود">
          <UInput v-model="form.title" :maxlength="SMS_TITLE_MAX" placeholder="مثلاً تخفیف نوروزی" class="w-full" />
        </UFormField>

        <UFormField
          label="متن پیامک"
          required
          :error="errors.message"
          :help="`${form.message.length.toLocaleString('fa-IR')} از ${SMS_MESSAGE_MAX.toLocaleString('fa-IR')} نویسه`"
        >
          <UTextarea v-model="form.message" :rows="5" :maxlength="SMS_MESSAGE_MAX" class="w-full" />
        </UFormField>
        <p class="text-xs text-gray-500 dark:text-gray-400 -mt-2 leading-6">
          پایان پیامک (نام فروشگاه و راه لغو دریافت) خودکار به متن اضافه می‌شود. جای کد تخفیف را با
          <bdi dir="ltr" class="font-mono">{{ DISCOUNT_PLACEHOLDER }}</bdi>
          در متن مشخص کنید.
        </p>

        <UFormField label="گیرنده‌ها" help="فقط کسانی که پیامک تبلیغاتی را پذیرفته‌اند پیامک می‌گیرند">
          <USelect v-model="form.audience" :items="audienceOptions" class="w-full" />
        </UFormField>

        <UFormField
          v-if="discountOptions.length > 1"
          label="کد تخفیف"
          help="فقط اگر تنظیم «کد تخفیف در کمپین پیامک» در تنظیمات فروشگاه روشن باشد"
          :error="errors.discountCodeId"
        >
          <USelect v-model="form.discountCodeId" :items="discountOptions" class="w-full" />
        </UFormField>

        <div>
          <JalaliDateInput v-model="form.scheduledAt" label="زمان ارسال (اختیاری)" with-time clearable />
          <p v-if="errors.scheduledAt" class="text-xs text-error mt-1.5">{{ errors.scheduledAt }}</p>
          <p class="text-xs text-gray-500 dark:text-gray-400 mt-1.5 leading-6">
            خالی یعنی همین حالا. حداکثر {{ MAX_SCHEDULE_DAYS.toLocaleString('fa-IR') }} روز بعد؛ در ساعت سکوت
            (به‌طور پیش‌فرض {{ QUIET_START.toLocaleString('fa-IR') }} تا {{ QUIET_END.toLocaleString('fa-IR') }}) پیامکی
            فرستاده نمی‌شود.
          </p>
        </div>

        <div class="flex items-center gap-2 flex-wrap pt-2">
          <UButton
            type="button"
            color="neutral"
            variant="soft"
            icon="i-heroicons-paper-airplane"
            :loading="testing"
            :disabled="busy"
            @click="sendTest"
          >
            ارسال آزمایشی به خودم
          </UButton>
          <UButton
            type="submit"
            color="primary"
            size="lg"
            class="ms-auto"
            icon="i-heroicons-check"
            :loading="checking"
            :disabled="busy || campaignsOff"
          >
            {{ form.scheduledAt ? 'زمان‌بندی کمپین' : 'ارسال کمپین' }}
          </UButton>
        </div>
        <p class="text-xs text-gray-500 dark:text-gray-400 leading-6">
          پیامک آزمایشی فقط به موبایل خودتان (نام کاربری) می‌رود و از سهمیه کم می‌شود.
        </p>
      </form>
    </UCard>

    <!-- Preview -->
    <UCard :ui="{ body: 'p-0' }" class="lg:col-span-1 self-start">
      <div class="flex items-center gap-2 px-4 sm:px-6 py-4 border-b border-gray-100 dark:border-gray-800">
        <UIcon name="i-heroicons-eye" class="w-4 h-4 text-brand-500 dark:text-brand-400" />
        <h2 class="text-sm font-medium text-gray-900 dark:text-white">پیش‌نمایش</h2>
      </div>

      <div class="relative">
        <Transition name="sk">
          <div v-if="previewLoading && !preview" key="skeleton" class="space-y-3 px-4 sm:px-6 py-4">
            <USkeleton class="h-24 w-full rounded-xl" />
            <USkeleton class="h-4 w-40" />
            <USkeleton class="h-4 w-32" />
          </div>

          <div v-else-if="previewError" key="error" class="px-4 sm:px-6 py-4">
            <p class="text-sm text-error" role="alert">{{ previewError }}</p>
          </div>

          <div v-else-if="preview" key="preview" class="space-y-3 px-4 sm:px-6 py-4">
            <p
              class="rounded-xl bg-gray-50 dark:bg-gray-800/50 p-3 text-sm text-gray-800 dark:text-gray-200 whitespace-pre-line leading-7"
            >
              {{ preview.fullText }}
            </p>
            <dl class="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
              <div>
                <dt class="text-xs text-gray-500 dark:text-gray-400">نویسه</dt>
                <dd class="text-gray-900 dark:text-white mt-0.5">{{ preview.characters.toLocaleString('fa-IR') }}</dd>
              </div>
              <div>
                <dt class="text-xs text-gray-500 dark:text-gray-400">بخش هر پیامک</dt>
                <dd class="text-gray-900 dark:text-white mt-0.5">{{ preview.parts.toLocaleString('fa-IR') }}</dd>
              </div>
              <div>
                <dt class="text-xs text-gray-500 dark:text-gray-400">گیرنده‌ها</dt>
                <dd class="text-gray-900 dark:text-white mt-0.5">{{ preview.recipientCount.toLocaleString('fa-IR') }}</dd>
              </div>
              <div>
                <dt class="text-xs text-gray-500 dark:text-gray-400">مجموع پیامک</dt>
                <dd class="text-gray-900 dark:text-white mt-0.5">{{ preview.totalParts.toLocaleString('fa-IR') }}</dd>
              </div>
            </dl>

            <UAlert
              v-if="preview.recipientCount === 0"
              color="warning"
              variant="soft"
              icon="i-heroicons-exclamation-triangle"
              title="گیرنده‌ای پیدا نشد"
              description="در این گروه کسی پیامک تبلیغاتی دریافت نمی‌کند."
            />
            <UAlert
              v-else-if="overQuota"
              color="warning"
              variant="soft"
              icon="i-heroicons-exclamation-triangle"
              title="سهمیه‌ی این ماه کافی نیست"
              :description="`این ارسال ${preview.totalParts.toLocaleString('fa-IR')} پیامک می‌خواهد ولی فقط ${usage.remaining.toLocaleString('fa-IR')} پیامک از سهمیه‌ی این ماه مانده است.`"
            />
          </div>

          <p v-else key="hint" class="px-4 sm:px-6 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
            با نوشتن متن، پیش‌نمایش و تعداد گیرنده‌ها اینجا می‌آید
          </p>
        </Transition>
      </div>
    </UCard>

    <PanelConfirmDialog
      v-model:open="showConfirm"
      title="ارسال کمپین"
      :message="confirmMessage"
      :confirm-label="form.scheduledAt ? 'زمان‌بندی کمپین' : 'ارسال کمپین'"
      :loading="creating"
      @confirm="create"
    />
  </div>
</template>

<script setup>
// New SMS campaign (module SMS_CAMPAIGN). The preview (full text, parts, recipients) refreshes 600 ms after the last
// change; «ارسال آزمایشی» texts only the logged-in user; the real send asks for confirmation with the totals first.
import PanelConfirmDialog from '@/components/panel/PanelConfirmDialog.vue'
import JalaliDateInput from '@/components/panel/JalaliDateInput.vue'
import { apiErrorMessage, isPending } from '~/utils/apiError.js'
import { discountValueText } from '~/utils/discountMeta.js'
import { selectItems } from '~/utils/enumMeta.js'
import { formatJalali } from '~/utils/jalali.js'
import {
  DISCOUNT_PLACEHOLDER,
  SMS_AUDIENCE_LABELS,
  SMS_MESSAGE_MAX,
  SMS_TITLE_MAX,
} from '~/utils/smsMeta.js'

const PREVIEW_DEBOUNCE_MS = 600
const MAX_SCHEDULE_DAYS = 90
const DAY_MS = 24 * 60 * 60 * 1000
// Platform defaults of sms.campaign.quiet-start / quiet-end; BACK still has the last word on the chosen time
const QUIET_START = 22
const QUIET_END = 8

const app = useNuxtApp()
const toast = useAppToast()

const form = reactive({
  title: '',
  message: '',
  audience: 'STORE_CUSTOMERS',
  discountCodeId: 'none',
  scheduledAt: '',
})
const errors = ref({})
const submitError = ref('')

const audienceOptions = selectItems(SMS_AUDIENCE_LABELS)

// ---------- quota (for the warning) and discount codes ----------
const usage = ref(null)
const discountCodes = ref([])

const campaignsOff = computed(() => Boolean(usage.value && !usage.value.unlimited && usage.value.monthlyQuota === 0))

const loadUsage = async () => {
  try {
    const res = await app.$api.crm.getCampaignUsage()
    usage.value = res.data.data ?? null
  } catch {
    // No quota info: no warning, and BACK still enforces the quota on send
    usage.value = null
  }
}

// Only codes that can still be used. A 403 or an empty list hides the field
const loadDiscountCodes = async () => {
  try {
    const res = await app.$api.commerceAdmin.listDiscountCodes({ params: { page: 0, size: 100 } })
    const now = new Date()
    discountCodes.value = (res.data.data?.content ?? []).filter(
      (code) => code.active && !(code.endsAt && new Date(code.endsAt) <= now)
    )
  } catch {
    discountCodes.value = []
  }
}

const discountOptions = computed(() => [
  { value: 'none', label: 'بدون کد تخفیف' },
  ...discountCodes.value.map((code) => ({ value: code.id, label: `${code.code} · ${discountValueText(code)}` })),
])

const hasDiscount = computed(() => form.discountCodeId !== 'none' && form.discountCodeId !== null)

onMounted(() => {
  loadUsage()
  loadDiscountCodes()
})

// ---------- preview ----------
const preview = ref(null)
const previewError = ref('')
const previewLoading = ref(false)
// True from the first change until a preview of the current inputs has arrived
const previewStale = ref(false)
let previewTimer = null
let previewSeq = 0

// The body shared by preview and test: message, audience and the chosen code
const messageBody = () => ({
  message: form.message.trim(),
  audience: form.audience,
  discountCodeId: hasDiscount.value ? Number(form.discountCodeId) : undefined,
})

// Answers of older requests are dropped through the sequence number
const runPreview = async () => {
  const seq = ++previewSeq
  previewLoading.value = true
  try {
    const res = await app.$api.crm.previewCampaign({ data: messageBody() })
    if (seq !== previewSeq) return null
    preview.value = res.data.data ?? null
    previewError.value = ''
    previewStale.value = false
    return preview.value
  } catch (e) {
    if (seq !== previewSeq) return null
    preview.value = null
    previewError.value = apiErrorMessage(e, 'دریافت پیش‌نمایش ناموفق بود')
    return null
  } finally {
    if (seq === previewSeq) previewLoading.value = false
  }
}

const schedulePreview = () => {
  clearTimeout(previewTimer)
  previewStale.value = true
  if (!form.message.trim()) {
    previewSeq++
    preview.value = null
    previewError.value = ''
    previewLoading.value = false
    return
  }
  previewTimer = setTimeout(runPreview, PREVIEW_DEBOUNCE_MS)
}

watch(() => [form.message, form.audience, form.discountCodeId], schedulePreview)

onBeforeUnmount(() => {
  clearTimeout(previewTimer)
  previewSeq++
})

// The quota check only covers this month; a campaign scheduled for another month is checked by BACK on send
const overQuota = computed(
  () =>
    Boolean(preview.value && usage.value && !usage.value.unlimited && !form.scheduledAt) &&
    preview.value.totalParts > usage.value.remaining
)

// ---------- validation ----------
const validate = () => {
  const next = {}
  const message = form.message.trim()
  if (!form.title.trim()) next.title = 'عنوان کمپین را وارد کنید'
  else if (form.title.trim().length > SMS_TITLE_MAX) next.title = `عنوان حداکثر ${SMS_TITLE_MAX.toLocaleString('fa-IR')} نویسه است`

  if (!message) next.message = 'متن پیامک را وارد کنید'
  else if (message.length > SMS_MESSAGE_MAX) next.message = `متن حداکثر ${SMS_MESSAGE_MAX.toLocaleString('fa-IR')} نویسه است`

  // BACK refuses a code without its placeholder and a placeholder without a code
  if (message && hasDiscount.value && !message.includes(DISCOUNT_PLACEHOLDER)) {
    next.discountCodeId = `جای کد تخفیف را در متن با ${DISCOUNT_PLACEHOLDER} مشخص کنید`
  } else if (message.includes(DISCOUNT_PLACEHOLDER) && !hasDiscount.value) {
    next.discountCodeId = 'متن جای کد تخفیف دارد ولی کدی انتخاب نشده است'
  }

  if (form.scheduledAt) {
    const time = new Date(form.scheduledAt).getTime()
    if (Number.isNaN(time) || time <= Date.now()) next.scheduledAt = 'زمان ارسال باید در آینده باشد'
    else if (time > Date.now() + MAX_SCHEDULE_DAYS * DAY_MS) {
      next.scheduledAt = `زمان ارسال حداکثر ${MAX_SCHEDULE_DAYS.toLocaleString('fa-IR')} روز بعد می‌تواند باشد`
    }
  }

  errors.value = next
  return Object.keys(next).length === 0
}

// ---------- test send ----------
const testing = ref(false)

const sendTest = async () => {
  if (busy.value) return
  submitError.value = ''
  if (!form.message.trim()) {
    errors.value = { ...errors.value, message: 'متن پیامک را وارد کنید' }
    return
  }
  testing.value = true
  try {
    const res = await app.$api.crm.testCampaign({ data: messageBody() })
    // BACK answers with a sentence that names the phone («پیام به ۰۹… ارسال شد»)
    const sentence = typeof res.data.data === 'string' ? res.data.data : undefined
    toast.success('پیامک آزمایشی ارسال شد', sentence)
  } catch (e) {
    toast.error(apiErrorMessage(e, 'ارسال پیامک آزمایشی ناموفق بود'))
  } finally {
    testing.value = false
  }
}

// ---------- submit: preview of the final inputs, confirm with the totals, create ----------
const checking = ref(false)
const creating = ref(false)
const showConfirm = ref(false)
const busy = computed(() => testing.value || checking.value || creating.value)

const confirmMessage = computed(() => {
  const dto = preview.value
  if (!dto) return ''
  const people = dto.recipientCount.toLocaleString('fa-IR')
  const parts = dto.parts.toLocaleString('fa-IR')
  const total = dto.totalParts.toLocaleString('fa-IR')
  const cost = usage.value?.unlimited
    ? 'با حساب کاوه‌نگار خودتان ارسال می‌شود و هزینه‌ی آن با شماست.'
    : 'از سهمیه‌ی ماهانه‌ی کمپین کم می‌شود.'
  const when = form.scheduledAt
    ? `زمان ارسال: ${formatJalali(form.scheduledAt, { withTime: true })}.`
    : 'ارسال همین حالا شروع می‌شود.'
  return `این کمپین برای ${people} نفر ارسال می‌شود؛ هر پیامک ${parts} بخش است و در مجموع ${total} پیامک حساب می‌شود. ${cost} ${when} پیامک‌هایی که رفته‌اند برنمی‌گردند؛ فقط می‌توانید ارسال به باقی‌مانده را لغو کنید.`
})

const submit = async () => {
  if (busy.value) return
  submitError.value = ''
  if (!validate()) return

  // Totals in the confirm dialog must belong to the current inputs, so a pending or stale preview is refreshed first
  checking.value = true
  clearTimeout(previewTimer)
  const current = previewStale.value || !preview.value ? await runPreview() : preview.value
  checking.value = false
  if (!current) {
    submitError.value = previewError.value || 'دریافت پیش‌نمایش ناموفق بود'
    return
  }
  if (current.recipientCount === 0) {
    submitError.value = 'در این گروه کسی پیامک تبلیغاتی دریافت نمی‌کند'
    return
  }
  showConfirm.value = true
}

const create = async () => {
  if (creating.value) return
  creating.value = true
  try {
    const res = await app.$api.crm.createCampaign({
      data: {
        ...messageBody(),
        title: form.title.trim(),
        scheduledAt: form.scheduledAt || undefined,
      },
    })
    showConfirm.value = false
    // A workflow-gated create has no id yet: go back to the list instead
    if (isPending(res)) {
      await navigateTo('/panel/sms')
      return
    }
    toast.success(form.scheduledAt ? 'کمپین زمان‌بندی شد' : 'کمپین در صف ارسال قرار گرفت')
    await navigateTo(`/panel/sms/${res.data.data.id}`)
  } catch (e) {
    // 400: no recipients, quota too small, bad time or a discount-code mismatch. BACK's message stays on the form
    showConfirm.value = false
    submitError.value = apiErrorMessage(e, 'ساخت کمپین ناموفق بود')
  } finally {
    creating.value = false
  }
}
</script>

<style scoped>
.sk-enter-active { transition: opacity 0.25s ease; }
.sk-leave-active { transition: opacity 0.25s ease; position: absolute; inset: 0; }
.sk-enter-from, .sk-leave-to { opacity: 0; }
</style>
