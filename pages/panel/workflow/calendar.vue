<!-- pages/panel/workflow/calendar.vue -->
<template>
  <div class="space-y-5">
    <PanelPageHeader
      icon="i-heroicons-calendar-days"
      title="تقویم"
      accent="کاری"
      subtitle="روزها و ساعت کاری فروشگاه برای محاسبه‌ی مهلت مرحله‌ها"
    />

    <WorkflowTabs />

    <PanelEmptyState
      v-if="unavailable"
      variant="forbidden"
      title="گردش کار در دسترس نیست"
      text="یا دسترسی ندارید یا گردش کار برای این فروشگاه روشن نیست"
    />

    <template v-else>
      <!-- ===== Card 1: working week and hours ===== -->
      <UCard>
        <template #header>
          <h2 class="text-sm font-bold text-gray-900 dark:text-white">هفته‌ی کاری</h2>
        </template>

        <div class="relative">
          <Transition name="sk">
            <div v-if="calendarLoading" key="skeleton" class="space-y-4">
              <USkeleton class="h-5 w-full max-w-lg" />
              <USkeleton class="h-9 w-full max-w-lg rounded-lg" />
              <USkeleton class="h-9 w-full max-w-sm rounded-lg" />
            </div>

            <PanelEmptyState v-else-if="calendarError" key="error" variant="error" title="دریافت تقویم ناموفق بود">
              <template #action>
                <UButton color="neutral" variant="soft" icon="i-heroicons-arrow-path" @click="loadCalendar">
                  تلاش دوباره
                </UButton>
              </template>
            </PanelEmptyState>

            <form v-else key="form" class="space-y-5" @submit.prevent="saveCalendar">
              <UAlert
                v-if="isDefault"
                color="info"
                variant="soft"
                icon="i-heroicons-information-circle"
                title="این فروشگاه هنوز تقویمی ذخیره نکرده است"
                description="مقدارهای زیر پیش‌فرض سیستم است و برای محاسبه‌ی مهلت‌ها هم همین‌ها به کار می‌رود. برای ثابت‌کردن آن‌ها ذخیره کنید."
              />

              <UFormField label="روزهای کاری" required :error="weekError || undefined">
                <div class="flex flex-wrap gap-x-5 gap-y-3">
                  <UCheckbox
                    v-for="day in WEEKDAYS"
                    :key="day.value"
                    :model-value="form.workingDays.includes(day.value)"
                    :label="day.label"
                    :disabled="savingCalendar"
                    @update:model-value="toggleDay(day.value, $event)"
                  />
                </div>
              </UFormField>

              <div class="grid gap-4 sm:grid-cols-2 max-w-md">
                <UFormField label="شروع کار" required>
                  <UInput v-model="form.startTime" type="time" dir="ltr" :disabled="savingCalendar" class="w-full" />
                </UFormField>
                <UFormField label="پایان کار" required :error="timeError || undefined">
                  <UInput v-model="form.endTime" type="time" dir="ltr" :disabled="savingCalendar" class="w-full" />
                </UFormField>
              </div>

              <p class="text-xs text-gray-500 dark:text-gray-400 leading-5">
                مهلت بر حسب «روز کاری» به پایان ساعت کاری آخرین روز کاری محاسبه می‌شود؛ روز شروع شمرده نمی‌شود.
              </p>

              <UButton
                type="submit"
                color="primary"
                icon="i-heroicons-check"
                :loading="savingCalendar"
                :disabled="savingCalendar || !canSave"
              >
                ذخیره‌ی تقویم
              </UButton>
            </form>
          </Transition>
        </div>
      </UCard>

      <!-- ===== Card 2: special days of a Jalali year ===== -->
      <UCard :ui="{ body: 'p-0' }">
        <div class="flex flex-wrap items-center gap-3 px-4 sm:px-6 py-4 border-b border-gray-100 dark:border-gray-800">
          <h2 class="text-sm font-bold text-gray-900 dark:text-white me-auto">روزهای خاص</h2>
          <USelect v-model="year" :items="yearItems" size="sm" class="w-32" aria-label="سال" />
          <UButton color="neutral" variant="outline" size="sm" icon="i-heroicons-plus" @click="dayModalOpen = true">
            افزودن روز
          </UButton>
        </div>

        <div class="relative">
          <Transition name="sk">
            <div v-if="daysLoading" key="skeleton" class="divide-y divide-gray-100 dark:divide-gray-800">
              <div v-for="i in 4" :key="i" class="flex items-center gap-4 px-4 sm:px-6 py-4">
                <USkeleton class="h-4 w-32" />
                <USkeleton class="h-5 w-20 rounded-full" />
                <USkeleton class="h-4 w-40" />
              </div>
            </div>

            <PanelEmptyState v-else-if="daysLoadError" key="error" variant="error" title="دریافت روزهای خاص ناموفق بود">
              <template #action>
                <UButton color="neutral" variant="soft" icon="i-heroicons-arrow-path" @click="loadDays">
                  تلاش دوباره
                </UButton>
              </template>
            </PanelEmptyState>

            <div v-else-if="days.length" key="content" class="overflow-x-auto">
              <table class="w-full">
                <thead>
                  <tr class="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                    <th class="text-start text-xs font-medium text-gray-500 dark:text-gray-400 px-4 sm:px-6 py-3">تاریخ</th>
                    <th class="text-start text-xs font-medium text-gray-500 dark:text-gray-400 px-4 py-3">نوع</th>
                    <th class="text-start text-xs font-medium text-gray-500 dark:text-gray-400 px-4 py-3">عنوان</th>
                    <th class="px-4 sm:px-6 py-3 w-16"><span class="sr-only">عملیات</span></th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="day in days"
                    :key="`${day.type}-${day.id}-${day.date}`"
                    class="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors"
                  >
                    <td class="px-4 sm:px-6 py-3 whitespace-nowrap">
                      <p class="text-sm text-gray-900 dark:text-white">{{ formatJalali(day.date) || day.date }}</p>
                      <p class="text-xs text-gray-500 dark:text-gray-400">{{ weekdayOf(day.date) }}</p>
                    </td>
                    <td class="px-4 py-3">
                      <StatusBadge :meta="metaOf(DAY_TYPE_META, day.type)" />
                    </td>
                    <td class="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{{ day.title || '—' }}</td>
                    <td class="px-4 sm:px-6 py-3 text-end">
                      <!-- Official holidays belong to the platform: read-only here -->
                      <UButton
                        v-if="day.store"
                        color="error"
                        variant="ghost"
                        square
                        icon="i-heroicons-trash"
                        aria-label="حذف این روز"
                        @click="deleteTarget = day"
                      />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <PanelEmptyState
              v-else
              key="empty"
              icon="i-heroicons-calendar-days"
              title="روز خاصی ثبت نشده است"
              text="تعطیلی فروشگاه یا کار در روز تعطیل را اینجا اضافه کنید"
            />
          </Transition>
        </div>
      </UCard>
    </template>

    <CalendarDayModal v-model:open="dayModalOpen" @done="onDayAdded" />

    <PanelConfirmDialog
      :open="deleteTarget !== null"
      title="حذف روز خاص"
      :message="deleteMessage"
      confirm-label="حذف"
      confirm-color="error"
      :loading="deleting"
      @update:open="(value) => { if (!value) deleteTarget = null }"
      @confirm="confirmDelete"
    />
  </div>
</template>

<script setup>
import PanelPageHeader from '@/components/panel/PanelPageHeader.vue'
import PanelEmptyState from '@/components/panel/PanelEmptyState.vue'
import PanelConfirmDialog from '@/components/panel/PanelConfirmDialog.vue'
import StatusBadge from '@/components/panel/StatusBadge.vue'
import WorkflowTabs from '@/components/panel/workflow/WorkflowTabs.vue'
import CalendarDayModal from '@/components/panel/workflow/CalendarDayModal.vue'
import { apiErrorMessage } from '~/utils/apiError.js'
import { metaOf } from '~/utils/enumMeta.js'
import { currentJalaliYear, formatJalali, isoToJalali } from '~/utils/jalali.js'
import { DAY_TYPE_META, isWorkflowUnavailable } from '~/utils/workflowMeta.js'
import { WEEKDAYS } from '~/utils/weekdays.js'

// Store calendar (C21b, module WORKFLOW_CALENDAR): the working week and hours used for «روز کاری» deadlines, and the special days
// of one Jalali year. The list also carries the platform's official holidays (`store: false`, read-only); they are only shown.
const YEAR_SPAN = 2

const app = useNuxtApp()
const toast = useAppToast()

// ---------- card 1: working week and hours ----------
const form = reactive({ workingDays: [], startTime: '', endTime: '' })
const saved = ref(null) // the last loaded or saved WorkflowStoreCalendarDTO, to tell whether the form changed
const isDefault = ref(false)
const calendarLoading = ref(true)
const calendarError = ref(null)
const savingCalendar = ref(false)

const applyCalendar = (calendar) => {
  form.workingDays = WEEKDAYS.map((day) => day.value).filter((value) => (calendar.workingDays ?? []).includes(value))
  form.startTime = calendar.startTime ?? ''
  form.endTime = calendar.endTime ?? ''
  isDefault.value = Boolean(calendar.defaults)
  saved.value = { workingDays: [...form.workingDays], startTime: form.startTime, endTime: form.endTime }
}

async function loadCalendar() {
  calendarLoading.value = true
  try {
    const res = await app.$api.workflow.getCalendar()
    applyCalendar(res.data.data)
    calendarError.value = null
  } catch (e) {
    calendarError.value = e
  } finally {
    calendarLoading.value = false
  }
}

const toggleDay = (value, checked) => {
  const next = new Set(form.workingDays)
  if (checked) next.add(value)
  else next.delete(value)
  form.workingDays = WEEKDAYS.map((day) => day.value).filter((item) => next.has(item))
}

// HH:mm strings compare correctly as text. Start must be strictly before end (BACK: `workflow.calendar.invalid`)
const weekError = computed(() => (form.workingDays.length ? '' : 'دست‌کم یک روز کاری انتخاب کنید'))
const timeError = computed(() =>
  form.startTime && form.endTime && form.startTime >= form.endTime ? 'ساعت شروع باید پیش از ساعت پایان باشد' : ''
)
const dirty = computed(
  () =>
    !saved.value ||
    form.startTime !== saved.value.startTime ||
    form.endTime !== saved.value.endTime ||
    form.workingDays.join() !== saved.value.workingDays.join()
)
// A calendar that is still the default can be saved as it is, to make it the store's own
const canSave = computed(
  () => !weekError.value && !timeError.value && form.startTime && form.endTime && (dirty.value || isDefault.value)
)

async function saveCalendar() {
  if (savingCalendar.value || !canSave.value) return
  savingCalendar.value = true
  try {
    const res = await app.$api.workflow.saveCalendar({
      data: { workingDays: form.workingDays, startTime: form.startTime, endTime: form.endTime },
    })
    applyCalendar(res.data.data)
    toast.success('تقویم ذخیره شد')
  } catch (e) {
    toast.error(apiErrorMessage(e, 'ذخیره‌ی تقویم ناموفق بود'))
  } finally {
    savingCalendar.value = false
  }
}

// ---------- card 2: special days ----------
const thisYear = currentJalaliYear()
const year = ref(thisYear)
// Years are plain numbers: no thousands separator (useGrouping false)
const yearItems = Array.from({ length: YEAR_SPAN * 2 + 1 }, (_, index) => {
  const value = thisYear - YEAR_SPAN + index
  return { value, label: value.toLocaleString('fa-IR', { useGrouping: false }) }
})

const days = ref([])
const daysLoading = ref(true)
const daysLoadError = ref(null)

// 403 (no grant) or 404 (workflow not switched on) on either read = the whole page is unavailable, not a retryable error
const unavailable = computed(() => isWorkflowUnavailable(calendarError.value) || isWorkflowUnavailable(daysLoadError.value))

// Only the latest year's answer may land (a quick change of year must not show the older year's rows)
let latestDays = 0
async function loadDays() {
  const request = ++latestDays
  daysLoading.value = true
  try {
    const res = await app.$api.workflow.listCalendarDays({ params: { year: year.value } })
    if (request !== latestDays) return
    days.value = res.data.data ?? []
    daysLoadError.value = null
  } catch (e) {
    if (request !== latestDays) return
    days.value = []
    daysLoadError.value = e
  } finally {
    if (request === latestDays) daysLoading.value = false
  }
}

watch(year, loadDays)

onMounted(() => {
  loadCalendar()
  loadDays()
})

// Weekday name of an ISO date (`yyyy-MM-dd` is read as a calendar day, UTC, so the time zone cannot move it)
const weekdayOf = (iso) => {
  const time = Date.parse(`${iso}T00:00:00Z`)
  return Number.isNaN(time) ? '' : new Date(time).toLocaleDateString('fa-IR', { weekday: 'long', timeZone: 'UTC' })
}

// ---------- add ----------
const dayModalOpen = ref(false)

// A day in another year of the list moves the list there; the same year just reloads
const onDayAdded = (day) => {
  const jalaliYear = isoToJalali(day?.date)?.jy
  if (jalaliYear && jalaliYear !== year.value && yearItems.some((item) => item.value === jalaliYear)) year.value = jalaliYear
  else loadDays()
}

// ---------- delete (the store's own days only) ----------
const deleteTarget = ref(null)
const deleting = ref(false)

const deleteMessage = computed(() => {
  const day = deleteTarget.value
  if (!day) return ''
  return `${metaOf(DAY_TYPE_META, day.type).label} در ${formatJalali(day.date) || day.date} از تقویم حذف شود؟`
})

async function confirmDelete() {
  const day = deleteTarget.value
  if (!day) return
  deleting.value = true
  try {
    await app.$api.workflow.deleteCalendarDay(day.id)
    deleteTarget.value = null
    toast.success('روز از تقویم حذف شد')
    loadDays()
  } catch (e) {
    toast.error(apiErrorMessage(e, 'حذف روز ناموفق بود'))
  } finally {
    deleting.value = false
  }
}

useHead({ title: 'تقویم کاری | پنل مدیریت' })
</script>

<style scoped>
.sk-enter-active { transition: opacity 0.25s ease; }
.sk-leave-active { transition: opacity 0.25s ease; position: absolute; inset: 0; }
.sk-enter-from, .sk-leave-to { opacity: 0; }
</style>
