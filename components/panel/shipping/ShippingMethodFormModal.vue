<!-- components/panel/shipping/ShippingMethodFormModal.vue -->
<template>
  <PanelFormModal
    :open="open"
    :title="method ? 'ویرایش روش ارسال' : 'روش ارسال جدید'"
    icon="i-heroicons-truck"
    :submit-label="method ? 'ذخیره' : 'ساخت روش ارسال'"
    width="2xl"
    :loading="saving"
    @update:open="emit('update:open', $event)"
    @submit="submit"
  >
    <p v-if="serverError" class="text-sm text-error" role="alert">{{ serverError }}</p>

    <section class="space-y-4">
      <h4 class="text-xs font-medium text-gray-500 dark:text-gray-400">اطلاعات پایه</h4>

      <UFormField label="عنوان" required :error="errors.title">
        <UInput v-model="form.title" class="w-full" :maxlength="100" />
      </UFormField>

      <UFormField label="توضیح برای مشتری" :error="errors.description" help="مثلاً «ارسال ۲ تا ۴ روز کاری»">
        <UTextarea v-model="form.description" :rows="2" :maxlength="500" class="w-full" />
      </UFormField>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <UFormField label="نوع ارسال" required :error="errors.type">
          <USelect v-model="form.type" :items="typeItems" class="w-full" />
        </UFormField>

        <UFormField label="ترتیب نمایش" :error="errors.sortOrder" help="۰ تا ۱۰۰۰؛ عدد کوچک‌تر بالاتر است">
          <UInput v-model="form.sortOrder" inputmode="numeric" dir="ltr" class="w-full" placeholder="۰" />
        </UFormField>
      </div>

      <label class="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
        <USwitch v-model="form.active" size="lg" :ui="SWITCH_UI" />
        فعال باشد
      </label>
    </section>

    <section v-if="typeHasCost(form.type)" class="space-y-4 border-t border-gray-100 dark:border-gray-800 pt-4">
      <h4 class="text-xs font-medium text-gray-500 dark:text-gray-400">هزینه و مهلت</h4>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <MoneyInput v-model="form.cost" label="هزینه ارسال" :error="errors.cost" placeholder="۰" />
        <MoneyInput
          v-model="form.freeShippingThreshold"
          label="ارسال رایگان از مبلغ"
          :error="errors.freeShippingThreshold"
          help="خالی یعنی ارسال رایگان ندارد"
        />
      </div>

      <div class="flex flex-wrap items-center gap-x-6 gap-y-3">
        <label class="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
          <USwitch v-model="form.payOnDeliveryAllowed" size="lg" :ui="SWITCH_UI" />
          پس‌کرایه
        </label>
        <label class="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
          <USwitch v-model="form.trackingRequired" size="lg" :ui="SWITCH_UI" />
          کد رهگیری اجباری
        </label>
      </div>

      <UFormField
        label="الگوی لینک رهگیری"
        :error="errors.trackingUrlTemplate"
        help="با {code} به‌جای کد رهگیری؛ فقط نشانی http یا https"
      >
        <UInput
          v-model="form.trackingUrlTemplate"
          dir="ltr"
          :maxlength="500"
          class="w-full"
          placeholder="https://example.com/track/{code}"
        />
      </UFormField>

      <div class="grid grid-cols-2 gap-4">
        <UFormField label="حداقل روز تحویل" :error="errors.minDeliveryDays">
          <UInput v-model="form.minDeliveryDays" inputmode="numeric" dir="ltr" class="w-full" placeholder="۰" />
        </UFormField>
        <UFormField label="حداکثر روز تحویل" :error="errors.maxDeliveryDays">
          <UInput v-model="form.maxDeliveryDays" inputmode="numeric" dir="ltr" class="w-full" placeholder="۰" />
        </UFormField>
      </div>
    </section>

    <section v-if="typeHasCost(form.type)" class="space-y-4 border-t border-gray-100 dark:border-gray-800 pt-4">
      <h4 class="text-xs font-medium text-gray-500 dark:text-gray-400">مقصدها و تعرفه</h4>

      <UFormField label="پوشش مقصدها" :error="errors.coverage">
        <USelect v-model="form.coverage" :items="coverageItems" class="w-full" />
      </UFormField>

      <ShippingRatesField
        v-model="form.rates"
        :error="errors.rates"
        :row-errors="rateRowErrors"
      />
    </section>

    <section v-if="typeHasSlots(form.type)" class="space-y-4 border-t border-gray-100 dark:border-gray-800 pt-4">
      <h4 class="text-xs font-medium text-gray-500 dark:text-gray-400">بازه‌ی زمانی و ساعت کاری</h4>

      <label class="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
        <USwitch v-model="form.slotsEnabled" size="lg" :disabled="form.expressEnabled" :ui="SWITCH_UI" />
        مشتری بازه‌ی زمانی انتخاب کند
      </label>

      <div v-if="form.slotsEnabled" class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <UFormField label="طول هر بازه (دقیقه)" required :error="errors.slotMinutes" help="۱۵ تا ۷۲۰ دقیقه">
          <UInput v-model="form.slotMinutes" inputmode="numeric" dir="ltr" class="w-full" />
        </UFormField>
        <UFormField label="سقف سفارش در هر بازه" :error="errors.slotCapacity" help="خالی یعنی بدون سقف">
          <UInput v-model="form.slotCapacity" inputmode="numeric" dir="ltr" class="w-full" />
        </UFormField>
        <UFormField label="زمان آماده‌سازی (دقیقه)" :error="errors.slotLeadMinutes" help="پیش از اولین بازه؛ خالی یعنی ۰">
          <UInput v-model="form.slotLeadMinutes" inputmode="numeric" dir="ltr" class="w-full" />
        </UFormField>
        <UFormField label="چند روز آینده نشان داده شود" :error="errors.slotDaysAhead" help="۱ تا ۶۰؛ خالی یعنی ۷">
          <UInput v-model="form.slotDaysAhead" inputmode="numeric" dir="ltr" class="w-full" />
        </UFormField>
      </div>

      <div v-if="form.type === 'STORE_COURIER'" class="space-y-3">
        <label class="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
          <USwitch v-model="form.expressEnabled" size="lg" :disabled="form.slotsEnabled" :ui="SWITCH_UI" />
          ارسال فوری پیک فروشگاه
        </label>
        <UFormField
          v-if="form.expressEnabled"
          label="ارسال فوری تا (دقیقه بعد از ثبت)"
          required
          :error="errors.expressMinutes"
          help="۱۵ تا ۱۴۴۰ دقیقه؛ با زمان‌بندی جمع نمی‌شود"
        >
          <UInput v-model="form.expressMinutes" inputmode="numeric" dir="ltr" class="w-full sm:w-60" />
        </UFormField>
      </div>

      <template v-if="form.slotsEnabled || form.expressEnabled">
        <PickupHoursField
          v-model="form.pickupHours"
          :error="errors.pickupHours"
          :row-errors="hourRowErrors"
        />

        <div class="space-y-2">
          <p class="text-xs font-medium text-gray-500 dark:text-gray-400">روزهای تعطیل</p>
          <div v-for="(_, index) in form.closedDates" :key="index" class="flex items-start gap-2">
            <JalaliDateInput v-model="form.closedDates[index]" label="" class="flex-1 min-w-0" />
            <UButton
              class="mt-1 flex-shrink-0"
              color="error"
              variant="ghost"
              square
              icon="i-heroicons-trash"
              aria-label="حذف این روز تعطیل"
              @click="form.closedDates.splice(index, 1)"
            />
          </div>
          <p v-if="errors.closedDates" class="text-xs text-error">{{ errors.closedDates }}</p>
          <UButton
            color="neutral"
            variant="outline"
            size="sm"
            icon="i-heroicons-plus"
            :disabled="form.closedDates.length >= MAX_CLOSED_DATES"
            @click="form.closedDates.push('')"
          >
            افزودن روز تعطیل
          </UButton>
        </div>
      </template>

      <UFormField
        v-if="isPickupType(form.type)"
        label="مهلت مراجعه (روز)"
        :error="errors.pickupDeadlineDays"
        help="پس از این مدت سفارش «عدم مراجعه» می‌شود؛ خالی یعنی بدون مهلت"
      >
        <UInput v-model="form.pickupDeadlineDays" inputmode="numeric" dir="ltr" class="w-full sm:w-60" />
      </UFormField>
    </section>

    <section class="space-y-2 border-t border-gray-100 dark:border-gray-800 pt-4">
      <label class="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
        <USwitch v-model="form.cashOnDeliveryAllowed" size="lg" :ui="SWITCH_UI" />
        پرداخت در محل
      </label>
      <p class="text-xs text-gray-500 dark:text-gray-400">
        پرداخت در محل فروشگاه هم باید روشن باشد
      </p>
    </section>
  </PanelFormModal>
</template>

<script setup>
// Create or edit one shipping method: basic fields, destination rates, pickup slots, hours and closed dates.
// Writes go through `app.$api.shipping`; the parent reloads on `saved`.
import PanelFormModal from '@/components/panel/PanelFormModal.vue'
import MoneyInput from '@/components/panel/MoneyInput.vue'
import JalaliDateInput from '@/components/panel/JalaliDateInput.vue'
import ShippingRatesField from '@/components/panel/shipping/ShippingRatesField.vue'
import PickupHoursField from '@/components/panel/shipping/PickupHoursField.vue'
import { apiErrorMessage, errorStatus } from '~/utils/apiError.js'
import { parseQuantity } from '~/utils/inventoryMeta.js'
import {
  COVERAGE_LABELS,
  SHIPPING_TYPE_META,
  isPickupType,
  toShippingRequest,
  typeHasCost,
  typeHasSlots,
} from '~/utils/shippingMeta.js'
import { toLatinDigits } from '~/utils/jalali.js'

const props = defineProps({
  open: { type: Boolean, required: true },
  // ShippingMethodDTO to edit, or null to create
  method: { type: Object, default: null },
})

const emit = defineEmits(['update:open', 'saved'])

const app = useNuxtApp()
const toast = useAppToast()

const MAX_MONEY = 1_000_000_000_000
const MAX_RATES = 500
const MAX_HOURS = 50
const MAX_CLOSED_DATES = 366

// Brand teal switch (DESIGN_SYSTEM "USwitch"): never color="teal"
const SWITCH_UI = {
  base: 'data-[state=checked]:bg-brand-500 dark:data-[state=checked]:bg-brand-400 data-[state=unchecked]:bg-gray-300 dark:data-[state=unchecked]:bg-gray-600',
}

// A new method starts with these: no rates, no slots, no hours.
const CREATE_DEFAULTS = {
  coverage: 'ALL',
  rates: [],
  slotsEnabled: false,
  slotMinutes: null,
  slotCapacity: null,
  slotLeadMinutes: null,
  slotDaysAhead: null,
  pickupHours: [],
  closedDates: [],
  expressMinutes: null,
  pickupDeadlineDays: null,
}

const typeItems = Object.entries(SHIPPING_TYPE_META).map(([value, meta]) => ({ value, label: meta.label }))
const coverageItems = Object.entries(COVERAGE_LABELS).map(([value, label]) => ({ value, label }))

const emptyForm = () => ({
  title: '',
  description: '',
  type: 'POST',
  sortOrder: '',
  active: true,
  cost: null,
  freeShippingThreshold: null,
  payOnDeliveryAllowed: false,
  cashOnDeliveryAllowed: false,
  trackingRequired: false,
  trackingUrlTemplate: '',
  minDeliveryDays: '',
  maxDeliveryDays: '',
  coverage: 'ALL',
  rates: [],
  slotsEnabled: false,
  slotMinutes: '',
  slotCapacity: '',
  slotLeadMinutes: '',
  slotDaysAhead: '',
  pickupHours: [],
  expressEnabled: false,
  expressMinutes: '',
  pickupDeadlineDays: '',
  closedDates: [],
})

const form = reactive(emptyForm())
const errors = ref({})
const rateRowErrors = ref([])
const hourRowErrors = ref([])
const serverError = ref('')
const saving = ref(false)

// Whole-number text → number, '' → null (optional), anything else → NaN (invalid).
const parseOptionalWhole = (text) => {
  const trimmed = toLatinDigits(String(text ?? '')).trim()
  if (trimmed === '') return null
  const parsed = parseQuantity(trimmed)
  return parsed === null ? NaN : parsed
}

const numberText = (value) => (value === null || value === undefined ? '' : String(value))

// Stored times may come back as HH:mm:ss; the form and the request both use HH:mm.
const hhmm = (value) => (value ? String(value).slice(0, 5) : '')

// Loads the form from the method being edited (or defaults for create) every time the modal opens.
const initForm = () => {
  const source = props.method
  Object.assign(form, emptyForm())
  if (source) {
    form.title = source.title ?? ''
    form.description = source.description ?? ''
    form.type = source.type ?? 'POST'
    form.sortOrder = numberText(source.sortOrder)
    form.active = source.active !== false
    form.cost = source.cost ?? null
    form.freeShippingThreshold = source.freeShippingThreshold ?? null
    form.payOnDeliveryAllowed = source.payOnDeliveryAllowed === true
    form.cashOnDeliveryAllowed = source.cashOnDeliveryAllowed === true
    form.trackingRequired = source.trackingRequired === true
    form.trackingUrlTemplate = source.trackingUrlTemplate ?? ''
    form.minDeliveryDays = numberText(source.minDeliveryDays)
    form.maxDeliveryDays = numberText(source.maxDeliveryDays)
    form.coverage = source.coverage ?? 'ALL'
    form.rates = (source.rates ?? []).map((rate) => ({
      provinceId: rate.provinceId ?? null,
      provinceName: rate.provinceName ?? '',
      cityId: rate.cityId ?? null,
      cityName: rate.cityName ?? '',
      cost: rate.cost ?? null,
    }))
    form.slotsEnabled = source.slotsEnabled === true
    form.slotMinutes = numberText(source.slotMinutes)
    form.slotCapacity = numberText(source.slotCapacity)
    form.slotLeadMinutes = numberText(source.slotLeadMinutes)
    form.slotDaysAhead = numberText(source.slotDaysAhead)
    form.pickupHours = (source.pickupHours ?? []).map((hours) => ({
      dayOfWeek: hours.dayOfWeek ?? null,
      opensAt: hhmm(hours.opensAt),
      closesAt: hhmm(hours.closesAt),
    }))
    form.expressEnabled = source.expressMinutes !== null && source.expressMinutes !== undefined
    form.expressMinutes = numberText(source.expressMinutes)
    form.pickupDeadlineDays = numberText(source.pickupDeadlineDays)
    form.closedDates = [...(source.closedDates ?? [])]
  }
  errors.value = {}
  rateRowErrors.value = []
  hourRowErrors.value = []
  serverError.value = ''
}

watch(
  () => [props.open, props.method],
  ([isOpen]) => {
    if (isOpen) initForm()
  },
  { immediate: true }
)

// Slots and express are one choice: turning one on turns the other off (BACK rejects both).
watch(
  () => form.slotsEnabled,
  (on) => {
    if (on) form.expressEnabled = false
  }
)
watch(
  () => form.expressEnabled,
  (on) => {
    if (on) form.slotsEnabled = false
  }
)

// Minutes between two HH:mm values (0 when they cannot be read).
const minutesBetween = (from, to) => {
  const [fh, fm] = from.split(':').map(Number)
  const [th, tm] = to.split(':').map(Number)
  return th * 60 + tm - (fh * 60 + fm)
}

const validateRates = () => {
  const rows = form.rates
  rateRowErrors.value = rows.map(() => ({}))
  if (rows.length > MAX_RATES) errors.value.rates = `حداکثر ${MAX_RATES.toLocaleString('fa-IR')} مقصد`
  if (form.coverage === 'LISTED' && rows.length === 0) {
    errors.value.rates = 'برای «فقط مقصدهای تعرفه‌دار» حداقل یک مقصد لازم است'
  }

  const seen = new Set()
  rows.forEach((row, index) => {
    const rowError = rateRowErrors.value[index]
    if (!row.provinceId) rowError.provinceId = 'استان را انتخاب کنید'
    if (row.cost === null || row.cost === undefined) rowError.cost = 'مبلغ را وارد کنید'
    else if (row.cost > MAX_MONEY) rowError.cost = 'مبلغ بیش از حد مجاز است'
    if (row.provinceId) {
      const key = `${row.provinceId}:${row.cityId ?? 'all'}`
      if (seen.has(key)) rowError.cityId = 'این مقصد تکراری است'
      seen.add(key)
    }
  })
}

const validateSlots = () => {
  const minutes = parseOptionalWhole(form.slotMinutes)
  if (minutes === null || Number.isNaN(minutes) || minutes < 15 || minutes > 720) {
    errors.value.slotMinutes = 'بین ۱۵ تا ۷۲۰ دقیقه'
  }
  const capacity = parseOptionalWhole(form.slotCapacity)
  if (Number.isNaN(capacity) || (capacity !== null && (capacity < 1 || capacity > 10000))) {
    errors.value.slotCapacity = 'بین ۱ تا ۱۰٬۰۰۰'
  }
  const lead = parseOptionalWhole(form.slotLeadMinutes)
  if (Number.isNaN(lead) || (lead !== null && lead > 10080)) errors.value.slotLeadMinutes = 'بین ۰ تا ۱۰٬۰۸۰'
  const daysAhead = parseOptionalWhole(form.slotDaysAhead)
  if (Number.isNaN(daysAhead) || (daysAhead !== null && (daysAhead < 1 || daysAhead > 60))) {
    errors.value.slotDaysAhead = 'بین ۱ تا ۶۰'
  }
  return minutes
}

const validateExpress = () => {
  const minutes = parseOptionalWhole(form.expressMinutes)
  if (minutes === null || Number.isNaN(minutes) || minutes < 15 || minutes > 1440) {
    errors.value.expressMinutes = 'بین ۱۵ تا ۱۴۴۰ دقیقه'
  }
}

// Hours are required for slots and for express; each range needs a day, two times and opens before it closes.
const validateHours = (slotMinutes) => {
  const rows = form.pickupHours
  hourRowErrors.value = rows.map(() => ({}))
  if (rows.length > MAX_HOURS) errors.value.pickupHours = `حداکثر ${MAX_HOURS} بازه`
  if (rows.length === 0) errors.value.pickupHours = 'حداقل یک بازه‌ی ساعت کاری لازم است'

  let anyFits = false
  rows.forEach((row, index) => {
    const rowError = hourRowErrors.value[index]
    if (!row.dayOfWeek) rowError.dayOfWeek = 'روز را انتخاب کنید'
    if (!row.opensAt) rowError.opensAt = 'ساعت شروع را وارد کنید'
    if (!row.closesAt) rowError.closesAt = 'ساعت پایان را وارد کنید'
    if (row.opensAt && row.closesAt) {
      const span = minutesBetween(row.opensAt, row.closesAt)
      if (span <= 0) rowError.closesAt = 'ساعت پایان باید بعد از ساعت شروع باشد'
      else if (slotMinutes && span >= slotMinutes) anyFits = true
    }
  })
  if (slotMinutes && !anyFits && rows.length && !errors.value.pickupHours) {
    errors.value.pickupHours = 'هیچ بازه‌ای برای طول هر نوبت کافی نیست'
  }
}

const validateClosedDates = () => {
  const dates = form.closedDates
  if (dates.length > MAX_CLOSED_DATES) errors.value.closedDates = 'حداکثر ۳۶۶ روز'
  else if (dates.some((date) => !date)) errors.value.closedDates = 'تاریخ را کامل کنید یا حذف کنید'
  else if (new Set(dates).size !== dates.length) errors.value.closedDates = 'روز تعطیل تکراری است'
}

// Client checks mirror BACK's ShippingMethodRequest. Each block runs only for the types and modes that show it.
const validate = () => {
  errors.value = {}
  rateRowErrors.value = []
  hourRowErrors.value = []

  const title = form.title.trim()
  if (!title) errors.value.title = 'عنوان را وارد کنید'
  else if (title.length > 100) errors.value.title = 'حداکثر ۱۰۰ نویسه'

  if (form.description.length > 500) errors.value.description = 'حداکثر ۵۰۰ نویسه'
  if (!form.type) errors.value.type = 'نوع ارسال را انتخاب کنید'

  const sortOrder = parseOptionalWhole(form.sortOrder)
  if (Number.isNaN(sortOrder)) errors.value.sortOrder = 'فقط عدد'
  else if (sortOrder !== null && sortOrder > 1000) errors.value.sortOrder = 'بین ۰ تا ۱۰۰۰'

  if (typeHasCost(form.type)) {
    if (form.cost !== null && form.cost > MAX_MONEY) errors.value.cost = 'مبلغ بیش از حد مجاز است'
    if (form.freeShippingThreshold !== null && form.freeShippingThreshold > MAX_MONEY) {
      errors.value.freeShippingThreshold = 'مبلغ بیش از حد مجاز است'
    }

    const tracking = form.trackingUrlTemplate.trim()
    if (tracking) {
      if (tracking.length > 500) errors.value.trackingUrlTemplate = 'حداکثر ۵۰۰ نویسه'
      else if (!/^https?:\/\//i.test(tracking)) errors.value.trackingUrlTemplate = 'باید با http:// یا https:// شروع شود'
      else if (!tracking.includes('{code}')) errors.value.trackingUrlTemplate = 'باید شامل {code} باشد'
    }

    const minDays = parseOptionalWhole(form.minDeliveryDays)
    const maxDays = parseOptionalWhole(form.maxDeliveryDays)
    if (Number.isNaN(minDays)) errors.value.minDeliveryDays = 'فقط عدد'
    else if (minDays !== null && minDays > 365) errors.value.minDeliveryDays = 'بین ۰ تا ۳۶۵'
    if (Number.isNaN(maxDays)) errors.value.maxDeliveryDays = 'فقط عدد'
    else if (maxDays !== null && maxDays > 365) errors.value.maxDeliveryDays = 'بین ۰ تا ۳۶۵'
    else if (minDays !== null && maxDays !== null && !errors.value.minDeliveryDays && minDays > maxDays) {
      errors.value.maxDeliveryDays = 'باید از حداقل بیشتر نباشد'
    }

    validateRates()
  }

  // Slots and express only exist for their own types (see the template); the hours are kept while both are off.
  const slotsOn = typeHasSlots(form.type) && form.slotsEnabled
  const expressOn = form.type === 'STORE_COURIER' && form.expressEnabled
  let slotMinutes = null
  if (slotsOn) slotMinutes = validateSlots()
  if (expressOn) validateExpress()
  if (slotsOn || expressOn) {
    validateHours(slotMinutes)
    validateClosedDates()
  }

  if (isPickupType(form.type)) {
    const deadline = parseOptionalWhole(form.pickupDeadlineDays)
    if (Number.isNaN(deadline) || (deadline !== null && (deadline < 1 || deadline > 60))) {
      errors.value.pickupDeadlineDays = 'بین ۱ تا ۶۰ روز'
    }
  }

  return Object.keys(errors.value).length === 0
}

// Body = the stored method merged with the form. Fields the chosen type does not show go out as null (or []).
// Hours and closed dates of a slot type are kept even while slots are off, as BACK keeps them too.
const buildBody = () => {
  const base = props.method ? toShippingRequest(props.method) : { ...CREATE_DEFAULTS }
  const costType = typeHasCost(form.type)
  const slotType = typeHasSlots(form.type)
  const slotsOn = slotType && form.slotsEnabled
  const expressOn = form.type === 'STORE_COURIER' && form.expressEnabled
  const tracking = form.trackingUrlTemplate.trim()

  return {
    ...base,
    title: form.title.trim(),
    description: form.description.trim() || null,
    type: form.type,
    sortOrder: parseOptionalWhole(form.sortOrder) ?? 0,
    active: form.active,

    cost: costType ? (form.cost ?? 0) : null,
    freeShippingThreshold: costType ? form.freeShippingThreshold : null,
    payOnDeliveryAllowed: costType ? form.payOnDeliveryAllowed : null,
    trackingRequired: costType ? form.trackingRequired : null,
    trackingUrlTemplate: costType ? tracking || null : null,
    minDeliveryDays: costType ? parseOptionalWhole(form.minDeliveryDays) : null,
    maxDeliveryDays: costType ? parseOptionalWhole(form.maxDeliveryDays) : null,
    coverage: costType ? form.coverage : null,
    rates: costType
      ? form.rates.map((rate) => ({ provinceId: rate.provinceId, cityId: rate.cityId ?? null, cost: rate.cost }))
      : [],

    cashOnDeliveryAllowed: form.cashOnDeliveryAllowed,

    slotsEnabled: slotsOn,
    slotMinutes: slotsOn ? parseOptionalWhole(form.slotMinutes) : null,
    slotCapacity: slotsOn ? parseOptionalWhole(form.slotCapacity) : null,
    slotLeadMinutes: slotsOn ? parseOptionalWhole(form.slotLeadMinutes) : null,
    slotDaysAhead: slotsOn ? parseOptionalWhole(form.slotDaysAhead) : null,
    pickupHours: slotType
      ? form.pickupHours.map((hours) => ({ dayOfWeek: hours.dayOfWeek, opensAt: hours.opensAt, closesAt: hours.closesAt }))
      : [],
    closedDates: slotType ? form.closedDates.filter(Boolean) : [],
    expressMinutes: expressOn ? parseOptionalWhole(form.expressMinutes) : null,
    pickupDeadlineDays: isPickupType(form.type) ? parseOptionalWhole(form.pickupDeadlineDays) : null,
  }
}

const submit = async () => {
  if (saving.value || !validate()) return
  saving.value = true
  serverError.value = ''
  try {
    const data = buildBody()
    if (props.method) await app.$api.shipping.adminUpdateMethod(props.method.id, { data })
    else await app.$api.shipping.adminCreateMethod({ data })
    toast.success('روش ارسال ذخیره شد')
    emit('update:open', false)
    emit('saved')
  } catch (e) {
    // 400 messages come from BACK already translated; they stay inside the modal so the user can fix the form.
    if (errorStatus(e) === 400) serverError.value = apiErrorMessage(e, 'اطلاعات روش ارسال نامعتبر است')
    else toast.error(apiErrorMessage(e, 'ذخیره روش ارسال ناموفق بود'))
  } finally {
    saving.value = false
  }
}
</script>
