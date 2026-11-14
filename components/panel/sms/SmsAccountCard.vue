<!-- components/panel/sms/SmsAccountCard.vue -->
<template>
  <div class="relative">
    <Transition name="sk">
      <div v-if="loading" key="skeleton" class="space-y-4">
        <USkeleton class="h-48 w-full rounded-xl" />
        <USkeleton class="h-72 w-full rounded-xl" />
      </div>

      <PanelEmptyState
        v-else-if="forbidden"
        key="forbidden"
        variant="forbidden"
        title="دسترسی به حساب پیامک ندارید"
      />

      <PanelEmptyState
        v-else-if="!account"
        key="error"
        variant="error"
        title="دریافت حساب پیامک ناموفق بود"
      >
        <template #action>
          <UButton color="neutral" variant="soft" icon="i-heroicons-arrow-path" @click="load">
            تلاش دوباره
          </UButton>
        </template>
      </PanelEmptyState>

      <div v-else key="content" class="space-y-4">
        <!-- Status -->
        <UCard :ui="{ body: 'p-0' }">
          <div class="flex items-center gap-2 px-4 sm:px-6 py-4 border-b border-gray-100 dark:border-gray-800">
            <UIcon name="i-heroicons-signal" class="w-4 h-4 text-brand-500 dark:text-brand-400" />
            <h2 class="text-sm font-medium text-gray-900 dark:text-white">وضعیت حساب پیامک</h2>
            <div class="ms-auto flex items-center gap-2 flex-wrap">
              <StatusBadge :meta="configuredMeta" />
              <StatusBadge :meta="usageMeta" />
            </div>
          </div>

          <div class="space-y-4 px-4 sm:px-6 py-4">
            <UAlert
              v-if="account.inUse && account.problem"
              :color="problemColor(account.problem)"
              variant="soft"
              icon="i-heroicons-exclamation-triangle"
              title="مشکل در ارسال پیامک"
              :description="problemText"
            />

            <p class="text-sm text-gray-600 dark:text-gray-300 leading-6">
              <template v-if="account.inUse">
                پیامک‌های فروشگاه (کد ورود، اعلان‌ها و کمپین‌ها) با حساب کاوه‌نگار خودتان می‌روند و هزینه‌ی آن با شماست.
                سهمیه‌ی ماهانه‌ی کمپین برای شما اعمال نمی‌شود.
              </template>
              <template v-else>
                پیامک‌های فروشگاه با حساب پلتفرم ارسال می‌شوند و کمپین‌ها از سهمیه‌ی ماهانه‌ی فروشگاه کم می‌کنند.
              </template>
            </p>

            <dl v-if="account.configured" class="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
              <div>
                <dt class="text-xs text-gray-500 dark:text-gray-400">کلید API</dt>
                <dd class="text-gray-900 dark:text-white mt-0.5" dir="ltr">
                  <span class="font-mono">••••{{ account.apiKeyHint }}</span>
                </dd>
              </div>
              <div>
                <dt class="text-xs text-gray-500 dark:text-gray-400">خط پیامک‌های عادی</dt>
                <dd class="text-gray-900 dark:text-white mt-0.5" dir="ltr">
                  <span class="font-mono">{{ account.senderNumber || '—' }}</span>
                </dd>
              </div>
              <div>
                <dt class="text-xs text-gray-500 dark:text-gray-400">خط کمپین‌ها</dt>
                <dd class="text-gray-900 dark:text-white mt-0.5">
                  <span v-if="account.marketingSenderNumber" class="font-mono" dir="ltr">
                    {{ account.marketingSenderNumber }}
                  </span>
                  <span v-else class="text-gray-500 dark:text-gray-400">همان خط پیامک‌های عادی</span>
                </dd>
              </div>
              <div>
                <dt class="text-xs text-gray-500 dark:text-gray-400">اعتبار باقی‌مانده</dt>
                <dd class="text-gray-900 dark:text-white mt-0.5">
                  <template v-if="credit">{{ formatMoney(credit.remainCredit) }}</template>
                  <span v-else class="text-xs text-gray-500 dark:text-gray-400">
                    با «بررسی اعتبار» از کاوه‌نگار گرفته می‌شود
                  </span>
                </dd>
              </div>
              <div v-if="credit?.expireDate">
                <dt class="text-xs text-gray-500 dark:text-gray-400">انقضای حساب</dt>
                <dd class="text-gray-900 dark:text-white mt-0.5">{{ formatJalali(credit.expireDate) }}</dd>
              </div>
              <div v-if="credit?.type">
                <dt class="text-xs text-gray-500 dark:text-gray-400">نوع حساب</dt>
                <dd class="text-gray-900 dark:text-white mt-0.5" dir="ltr">
                  <span class="font-mono">{{ credit.type }}</span>
                </dd>
              </div>
            </dl>

            <div v-if="account.configured" class="flex items-center gap-2 flex-wrap">
              <UButton
                color="neutral"
                variant="soft"
                icon="i-heroicons-arrow-path"
                :loading="checking"
                :disabled="!account.allowed || busy"
                @click="checkCredit"
              >
                بررسی اعتبار
              </UButton>
              <UButton
                color="neutral"
                variant="soft"
                icon="i-heroicons-paper-airplane"
                :disabled="!account.inUse || busy"
                @click="openTest"
              >
                پیامک آزمایشی
              </UButton>
              <UButton
                color="error"
                variant="soft"
                icon="i-heroicons-arrow-uturn-left"
                class="ms-auto"
                :disabled="busy"
                @click="showRevert = true"
              >
                بازگشت به حساب پلتفرم
              </UButton>
            </div>
            <p v-if="account.configured && !account.inUse" class="text-xs text-gray-500 dark:text-gray-400">
              پیامک آزمایشی فقط وقتی حساب شما در حال استفاده است ارسال می‌شود.
            </p>
          </div>
        </UCard>

        <!-- Form -->
        <UCard :ui="{ body: 'p-0' }">
          <div class="flex items-center gap-2 px-4 sm:px-6 py-4 border-b border-gray-100 dark:border-gray-800">
            <UIcon name="i-heroicons-key" class="w-4 h-4 text-brand-500 dark:text-brand-400" />
            <h2 class="text-sm font-medium text-gray-900 dark:text-white">
              {{ account.configured ? 'ویرایش حساب کاوه‌نگار' : 'ثبت حساب کاوه‌نگار' }}
            </h2>
          </div>

          <form dir="rtl" class="space-y-4 px-4 sm:px-6 py-4 font-dana" @submit.prevent="save">
            <UAlert
              v-if="!account.allowed"
              color="info"
              variant="soft"
              icon="i-heroicons-information-circle"
              title="ثبت حساب اختصاصی برای فروشگاه شما فعال نیست"
              description="این امکان را مدیر کل پلتفرم باید روشن کند. تا آن زمان پیامک‌ها با حساب پلتفرم می‌روند."
            />

            <p v-if="saveError" class="text-sm text-error" role="alert">{{ saveError }}</p>

            <UFormField
              label="کلید API کاوه‌نگار"
              :required="!account.configured"
              :error="errors.apiKey"
              :help="account.configured ? 'برای نگه داشتن کلید فعلی، این بخش را خالی بگذارید' : 'کلید را از پنل کاوه‌نگار (kavenegar.com) بردارید'"
            >
              <UInput
                v-model="form.apiKey"
                type="password"
                dir="ltr"
                autocomplete="new-password"
                :maxlength="200"
                :placeholder="keyPlaceholder"
                :disabled="!account.allowed || saving"
                class="w-full"
              />
            </UFormField>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <UFormField
                label="خط پیامک‌های عادی"
                required
                :error="errors.senderNumber"
                help="کد ورود و اعلان‌ها؛ باید در همین حساب کاوه‌نگار باشد"
              >
                <UInput
                  v-model="form.senderNumber"
                  inputmode="numeric"
                  dir="ltr"
                  :maxlength="20"
                  :disabled="!account.allowed || saving"
                  class="w-full"
                />
              </UFormField>
              <UFormField
                label="خط کمپین‌ها"
                :error="errors.marketingSenderNumber"
                help="اختیاری؛ خالی یعنی کمپین‌ها هم از خط عادی می‌روند"
              >
                <UInput
                  v-model="form.marketingSenderNumber"
                  inputmode="numeric"
                  dir="ltr"
                  :maxlength="20"
                  :disabled="!account.allowed || saving"
                  class="w-full"
                />
              </UFormField>
            </div>

            <label class="flex items-center gap-3 cursor-pointer">
              <USwitch
                v-model="form.active"
                size="lg"
                :disabled="!account.allowed || saving"
                :ui="{
                  base: 'data-[state=checked]:bg-brand-500 dark:data-[state=checked]:bg-brand-400 data-[state=unchecked]:bg-gray-300 dark:data-[state=unchecked]:bg-gray-600',
                }"
              />
              <span class="text-sm text-gray-700 dark:text-gray-300">
                ارسال پیامک‌های فروشگاه با این حساب
                <span class="block text-xs text-gray-500 dark:text-gray-400">
                  خاموش یعنی حساب ثبت می‌ماند ولی پیامک‌ها با حساب پلتفرم می‌روند
                </span>
              </span>
            </label>

            <div class="flex justify-end">
              <UButton
                type="submit"
                color="primary"
                size="lg"
                icon="i-heroicons-check"
                :loading="saving"
                :disabled="!account.allowed || saving"
              >
                ذخیره
              </UButton>
            </div>
          </form>
        </UCard>
      </div>
    </Transition>

    <!-- Test message -->
    <PanelFormModal
      v-model:open="showTest"
      title="پیامک آزمایشی"
      icon="i-heroicons-paper-airplane"
      submit-label="ارسال"
      :loading="testing"
      @submit="sendTest"
    >
      <p class="text-sm text-gray-600 dark:text-gray-300 leading-6">
        یک پیامک کوتاه با حساب خودتان به این شماره می‌رود و از اعتبار شما کم می‌شود.
      </p>
      <p v-if="testError" class="text-sm text-error" role="alert">{{ testError }}</p>
      <UFormField label="شماره‌ی موبایل" required :error="testPhoneError">
        <UInput
          v-model="testPhone"
          inputmode="tel"
          dir="ltr"
          placeholder="09123456789"
          :maxlength="20"
          class="w-full"
        />
      </UFormField>
      <label class="flex items-center gap-3 cursor-pointer">
        <USwitch
          v-model="testMarketing"
          size="lg"
          :ui="{
            base: 'data-[state=checked]:bg-brand-500 dark:data-[state=checked]:bg-brand-400 data-[state=unchecked]:bg-gray-300 dark:data-[state=unchecked]:bg-gray-600',
          }"
        />
        <span class="text-sm text-gray-700 dark:text-gray-300">ارسال از خط کمپین‌ها</span>
      </label>
    </PanelFormModal>

    <!-- Back to the platform account -->
    <PanelConfirmDialog
      v-model:open="showRevert"
      title="بازگشت به حساب پلتفرم"
      message="کلید حساب کاوه‌نگار شما پاک می‌شود و پیامک‌های فروشگاه دوباره با حساب پلتفرم و سهمیه‌ی ماهانه‌ی کمپین می‌روند. این کار قابل بازگشت نیست؛ برای استفاده‌ی دوباره باید کلید را از نو وارد کنید."
      confirm-label="بازگشت به حساب پلتفرم"
      confirm-color="error"
      :loading="reverting"
      @confirm="revert"
    />
  </div>
</template>

<script setup>
// The store's own Kavenegar account (module SMS_ACCOUNT): status, credit, a form to save it, a credit check, a test
// message and the way back to the platform account. Self-contained: it loads and writes through `$api.crm`.
// BACK never returns the API key, only its last four characters, and `credit` only comes back from save and check.
import PanelEmptyState from '@/components/panel/PanelEmptyState.vue'
import PanelFormModal from '@/components/panel/PanelFormModal.vue'
import PanelConfirmDialog from '@/components/panel/PanelConfirmDialog.vue'
import StatusBadge from '@/components/panel/StatusBadge.vue'
import { apiErrorMessage, errorStatus, isPending } from '~/utils/apiError.js'
import { normalizeNotifyPhone } from '~/utils/contactMeta.js'
import { formatJalali, toLatinDigits } from '~/utils/jalali.js'
import { formatMoney } from '~/utils/money.js'
import { problemColor, SMS_PROBLEM_LABELS } from '~/utils/smsMeta.js'

const SENDER_PATTERN = /^\d{4,20}$/
const SENDER_ERROR = `خط فقط عدد است (${(4).toLocaleString('fa-IR')} تا ${(20).toLocaleString('fa-IR')} رقم)`
const API_KEY_MAX = 200

const app = useNuxtApp()
const toast = useAppToast()

const loading = ref(true)
const loadError = ref(null)
const account = ref(null)
const credit = ref(null)

const forbidden = computed(() => errorStatus(loadError.value) === 403)

const form = reactive({ apiKey: '', senderNumber: '', marketingSenderNumber: '', active: true })
const errors = ref({})
const saveError = ref('')
const saving = ref(false)
const checking = ref(false)
const reverting = ref(false)
const showRevert = ref(false)

const busy = computed(() => saving.value || checking.value || reverting.value)

const configuredMeta = computed(() =>
  account.value?.configured ? { label: 'حساب ثبت شده', color: 'success' } : { label: 'حساب ثبت نشده', color: 'neutral' }
)
const usageMeta = computed(() =>
  account.value?.inUse ? { label: 'در حال استفاده', color: 'primary' } : { label: 'حساب پلتفرم', color: 'neutral' }
)

const keyPlaceholder = computed(() => (account.value?.apiKeyHint ? `••••${account.value.apiKeyHint}` : ''))

const problemText = computed(() => {
  const dto = account.value
  if (!dto?.problem) return ''
  const text = dto.problemMessage || SMS_PROBLEM_LABELS[dto.problem] || dto.problem
  const when = dto.problemAt ? formatJalali(dto.problemAt, { withTime: true }) : ''
  return when ? `${text} (${when})` : text
})

// Fills the form from the stored account. The key field always starts empty (empty = keep the saved key).
const applyAccount = (dto) => {
  account.value = dto
  form.apiKey = ''
  form.senderNumber = dto?.senderNumber ?? ''
  form.marketingSenderNumber = dto?.marketingSenderNumber ?? ''
  form.active = dto?.configured ? dto.active !== false : true
  errors.value = {}
}

const load = async () => {
  loading.value = true
  try {
    const res = await app.$api.crm.getSmsAccount()
    applyAccount(res.data.data ?? null)
    loadError.value = null
  } catch (e) {
    account.value = null
    loadError.value = e
  } finally {
    loading.value = false
  }
}

onMounted(load)

// ---------- save ----------
const validate = () => {
  const next = {}
  const apiKey = form.apiKey.trim()
  if (!account.value.configured && !apiKey) next.apiKey = 'کلید API را وارد کنید'
  else if (apiKey.length > API_KEY_MAX) next.apiKey = `کلید حداکثر ${API_KEY_MAX.toLocaleString('fa-IR')} نویسه است`

  const sender = toLatinDigits(form.senderNumber).trim()
  if (!sender) next.senderNumber = 'خط پیامک‌های عادی را وارد کنید'
  else if (!SENDER_PATTERN.test(sender)) next.senderNumber = SENDER_ERROR

  const marketing = toLatinDigits(form.marketingSenderNumber).trim()
  if (marketing && !SENDER_PATTERN.test(marketing)) next.marketingSenderNumber = SENDER_ERROR

  errors.value = next
  return Object.keys(next).length === 0
}

const save = async () => {
  if (busy.value || !account.value?.allowed) return
  saveError.value = ''
  if (!validate()) return
  saving.value = true
  try {
    const res = await app.$api.crm.saveSmsAccount({
      data: {
        apiKey: form.apiKey.trim() || undefined,
        senderNumber: toLatinDigits(form.senderNumber).trim(),
        marketingSenderNumber: toLatinDigits(form.marketingSenderNumber).trim() || undefined,
        active: form.active,
      },
    })
    if (isPending(res)) {
      await load()
      return
    }
    const dto = res.data.data
    credit.value = dto?.credit ?? null
    applyAccount(dto)
    toast.success('حساب پیامک ذخیره شد')
  } catch (e) {
    // BACK checks the key with Kavenegar first: a bad key or line comes back translated, so it stays inline
    saveError.value = apiErrorMessage(e, 'ذخیره‌ی حساب پیامک ناموفق بود')
  } finally {
    saving.value = false
  }
}

// ---------- credit ----------
const checkCredit = async () => {
  if (busy.value) return
  checking.value = true
  try {
    const res = await app.$api.crm.checkSmsAccount()
    credit.value = res.data.data ?? null
    toast.success('اعتبار حساب به‌روز شد')
  } catch (e) {
    toast.error(apiErrorMessage(e, 'دریافت اعتبار حساب ناموفق بود'))
  } finally {
    checking.value = false
  }
}

// ---------- test message ----------
const showTest = ref(false)
const testPhone = ref('')
const testMarketing = ref(false)
const testPhoneError = ref('')
const testError = ref('')
const testing = ref(false)

const openTest = () => {
  testPhone.value = ''
  testMarketing.value = false
  testPhoneError.value = ''
  testError.value = ''
  showTest.value = true
}

const sendTest = async () => {
  testError.value = ''
  const phone = normalizeNotifyPhone(testPhone.value)
  testPhoneError.value = phone ? '' : 'شماره‌ی موبایل معتبر نیست'
  if (!phone) return
  testing.value = true
  try {
    await app.$api.crm.testSmsAccount({ data: { phone, marketing: testMarketing.value } })
    toast.success('پیامک آزمایشی ارسال شد')
    showTest.value = false
  } catch (e) {
    // A Kavenegar account problem (key, credit, line) comes back as its translated message; the form stays open
    testError.value = apiErrorMessage(e, 'ارسال پیامک آزمایشی ناموفق بود')
  } finally {
    testing.value = false
  }
}

// ---------- back to the platform account ----------
const revert = async () => {
  if (reverting.value) return
  reverting.value = true
  try {
    const res = await app.$api.crm.deleteSmsAccount()
    showRevert.value = false
    credit.value = null
    if (!isPending(res)) toast.success('پیامک‌ها دوباره با حساب پلتفرم ارسال می‌شوند')
    await load()
  } catch (e) {
    showRevert.value = false
    toast.error(apiErrorMessage(e, 'بازگشت به حساب پلتفرم ناموفق بود'))
  } finally {
    reverting.value = false
  }
}
</script>

<style scoped>
.sk-enter-active { transition: opacity 0.25s ease; }
.sk-leave-active { transition: opacity 0.25s ease; position: absolute; inset: 0; }
.sk-enter-from, .sk-leave-to { opacity: 0; }
</style>
