<!-- pages/panel/audit/index.vue -->
<template>
  <div class="space-y-5">
    <PanelPageHeader
      icon="i-heroicons-clipboard-document-check"
      title="لاگ"
      accent="ممیزی"
      subtitle="چه کسی، چه زمانی و چه چیزی را تغییر داده است"
    />

    <UCard :ui="{ body: 'p-0' }">
      <form
        class="flex flex-wrap items-start gap-3 border-b border-gray-100 px-4 py-4 sm:px-6 dark:border-gray-800"
        @submit.prevent="search"
      >
        <UFormField label="موجودیت" help="مثل Order یا Goods">
          <UInput v-model="draft.entityName" dir="ltr" size="sm" autocomplete="off" class="w-36" />
        </UFormField>
        <UFormField label="شناسه رکورد">
          <UInput v-model="draft.entityId" dir="ltr" size="sm" autocomplete="off" class="w-32" />
        </UFormField>
        <UFormField label="عملیات">
          <UInput v-model="draft.action" dir="ltr" size="sm" autocomplete="off" class="w-32" />
        </UFormField>
        <UFormField label="نتیجه">
          <USelect v-model="draft.outcome" :items="outcomeOptions" size="sm" class="w-32" />
        </UFormField>
        <UFormField label="شناسه کاربر" :error="userIdError || undefined">
          <UInput v-model="draft.userId" inputmode="numeric" dir="ltr" size="sm" autocomplete="off" class="w-28" />
        </UFormField>
        <UFormField label="نام کاربری (موبایل)">
          <UInput v-model="draft.performedBy" dir="ltr" size="sm" autocomplete="off" class="w-36" />
        </UFormField>
        <JalaliDateInput v-model="draft.from" label="از تاریخ و ساعت" with-time clearable />
        <JalaliDateInput v-model="draft.to" label="تا تاریخ و ساعت" with-time clearable />
        <div class="flex items-center gap-2 self-end">
          <UButton type="submit" color="primary" icon="i-heroicons-magnifying-glass" size="sm">جستجو</UButton>
          <UButton color="neutral" variant="ghost" size="sm" @click="clearFilters">پاک کردن</UButton>
        </div>
        <p class="w-full text-xs text-gray-500 dark:text-gray-400">
          فیلترها دقیق (نه شبیه) جستجو می‌شوند. اگر برای «تا» ساعت وارد نکنید، تا پایان همان روز جستجو می‌شود.
        </p>
      </form>

      <div class="relative">
        <Transition name="sk">
          <div v-if="loading" key="skeleton" class="divide-y divide-gray-100 dark:divide-gray-800">
            <div v-for="i in 5" :key="i" class="flex items-center gap-4 px-4 py-4 sm:px-6">
              <div class="flex-1 space-y-2">
                <USkeleton class="h-4 w-40" />
                <USkeleton class="h-3 w-64" />
              </div>
              <USkeleton class="h-5 w-16 rounded-full" />
            </div>
          </div>

          <PanelEmptyState
            v-else-if="forbidden"
            key="forbidden"
            variant="forbidden"
            title="دسترسی به لاگ ممیزی ندارید"
          />

          <PanelEmptyState
            v-else-if="error"
            key="error"
            variant="error"
            title="دریافت لاگ ممیزی ناموفق بود"
          >
            <template #action>
              <UButton color="neutral" variant="soft" icon="i-heroicons-arrow-path" @click="reload">
                تلاش دوباره
              </UButton>
            </template>
          </PanelEmptyState>

          <div v-else-if="items.length" key="content">
            <div class="overflow-x-auto">
              <table class="w-full">
                <thead>
                  <tr class="border-b border-gray-100 bg-gray-50 dark:border-gray-800 dark:bg-gray-800/50">
                    <th class="w-10 px-3 py-3" />
                    <th class="px-6 py-3 text-start text-xs font-medium text-gray-500 dark:text-gray-400">زمان</th>
                    <th class="px-6 py-3 text-start text-xs font-medium text-gray-500 dark:text-gray-400">موجودیت</th>
                    <th class="px-6 py-3 text-start text-xs font-medium text-gray-500 dark:text-gray-400">عملیات</th>
                    <th class="px-6 py-3 text-start text-xs font-medium text-gray-500 dark:text-gray-400">نتیجه</th>
                    <th class="px-6 py-3 text-start text-xs font-medium text-gray-500 dark:text-gray-400">کاربر</th>
                  </tr>
                </thead>
                <tbody>
                  <template v-for="row in items" :key="row.id">
                    <tr
                      class="cursor-pointer border-b border-gray-100 transition-colors hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800/40"
                      @click="toggle(row.id)"
                    >
                      <td class="px-3 py-3 align-top">
                        <UButton
                          color="neutral"
                          variant="ghost"
                          square
                          size="xs"
                          :icon="isOpen(row.id) ? 'i-heroicons-chevron-up' : 'i-heroicons-chevron-down'"
                          :aria-label="isOpen(row.id) ? 'بستن جزئیات' : 'نمایش جزئیات'"
                          :aria-expanded="isOpen(row.id)"
                          @click.stop="toggle(row.id)"
                        />
                      </td>
                      <td class="px-6 py-3 align-top text-xs whitespace-nowrap text-gray-600 dark:text-gray-400">
                        {{ formatJalali(row.performedAt, { withTime: true }) || '—' }}
                      </td>
                      <td class="px-6 py-3 align-top">
                        <p dir="ltr" class="text-start text-sm font-semibold text-gray-900 dark:text-white">{{ row.entityName || '—' }}</p>
                        <p v-if="row.entityId" dir="ltr" class="text-start font-mono text-xs text-gray-500 dark:text-gray-400">{{ row.entityId }}</p>
                      </td>
                      <td dir="ltr" class="px-6 py-3 text-start align-top font-mono text-xs text-gray-700 dark:text-gray-300">
                        {{ row.action || '—' }}
                      </td>
                      <td class="px-6 py-3 align-top">
                        <StatusBadge :meta="metaOf(OUTCOME_META, row.outcome)" />
                      </td>
                      <td class="px-6 py-3 align-top text-xs text-gray-700 dark:text-gray-300">
                        <p v-if="row.performedBy" dir="ltr" class="text-start">{{ row.performedBy }}</p>
                        <p v-if="row.userId != null" class="text-gray-500 dark:text-gray-400">
                          کاربر #{{ Number(row.userId).toLocaleString('fa-IR') }}
                        </p>
                        <p v-if="!row.performedBy && row.userId == null">—</p>
                      </td>
                    </tr>

                    <tr v-if="isOpen(row.id)" class="border-b border-gray-100 bg-gray-50/50 dark:border-gray-800 dark:bg-gray-800/20">
                      <td colspan="6" class="space-y-4 px-4 py-4 sm:px-6">
                        <p v-if="row.errorMessage" role="alert" class="rounded-xl bg-error/10 p-3 text-sm text-error dark:bg-error/20">
                          {{ row.errorMessage }}
                        </p>

                        <dl class="grid gap-3 text-xs sm:grid-cols-2">
                          <div>
                            <dt class="font-medium text-gray-500 dark:text-gray-400">نشانی IP</dt>
                            <dd dir="ltr" class="mt-1 text-start font-mono text-gray-800 dark:text-gray-200">{{ row.ipAddress || '—' }}</dd>
                          </div>
                          <div>
                            <dt class="font-medium text-gray-500 dark:text-gray-400">مرورگر (User-Agent)</dt>
                            <dd dir="ltr" class="mt-1 text-start font-mono break-all text-gray-800 dark:text-gray-200">{{ row.userAgent || '—' }}</dd>
                          </div>
                        </dl>

                        <div class="grid gap-4 lg:grid-cols-2">
                          <div class="space-y-1">
                            <p class="text-xs font-medium text-gray-500 dark:text-gray-400">مقدار قبلی</p>
                            <pre
                              v-if="row.oldValue"
                              dir="ltr"
                              class="max-h-64 overflow-auto rounded-xl border border-gray-200 bg-white p-3 text-start font-mono text-xs whitespace-pre-wrap text-gray-800 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
                            >{{ prettyValue(row.oldValue) }}</pre>
                            <p v-else class="text-xs text-gray-500 dark:text-gray-400">—</p>
                          </div>
                          <div class="space-y-1">
                            <p class="text-xs font-medium text-gray-500 dark:text-gray-400">مقدار جدید</p>
                            <pre
                              v-if="row.newValue"
                              dir="ltr"
                              class="max-h-64 overflow-auto rounded-xl border border-gray-200 bg-white p-3 text-start font-mono text-xs whitespace-pre-wrap text-gray-800 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
                            >{{ prettyValue(row.newValue) }}</pre>
                            <p v-else class="text-xs text-gray-500 dark:text-gray-400">—</p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  </template>
                </tbody>
              </table>
            </div>

            <div v-if="totalPages > 1" class="flex justify-center py-4">
              <UPagination v-model:page="page" :total="total" :items-per-page="PAGE_SIZE" />
            </div>
          </div>

          <PanelEmptyState
            v-else
            key="empty"
            icon="i-heroicons-clipboard-document-check"
            title="لاگی پیدا نشد"
            text="با این فیلترها رکوردی در لاگ ممیزی نیست"
          />
        </Transition>
      </div>
    </UCard>
  </div>
</template>

<script setup>
import PanelPageHeader from '@/components/panel/PanelPageHeader.vue'
import PanelEmptyState from '@/components/panel/PanelEmptyState.vue'
import StatusBadge from '@/components/panel/StatusBadge.vue'
import JalaliDateInput from '@/components/panel/JalaliDateInput.vue'
import { formatJalali } from '~/utils/jalali.js'
import { metaOf } from '~/utils/enumMeta.js'

// «لاگ ممیزی» (module AUDIT) from POST api/admin/audit/search through usePagedList. BACK pages this 1-based, so the
// 1-based UPagination goes straight through (backendBase: 1). Filters are exact matches. They are edited in `draft` and
// copied into `applied` by «جستجو», and only `applied` is watched by usePagedList (typing alone never reloads).
const app = useNuxtApp()

const PAGE_SIZE = 20

const OUTCOME_META = {
  SUCCESS: { label: 'موفق', color: 'success' },
  FAILED: { label: 'ناموفق', color: 'error' },
}
const outcomeOptions = [
  { value: 'all', label: 'همه' },
  { value: 'SUCCESS', label: OUTCOME_META.SUCCESS.label },
  { value: 'FAILED', label: OUTCOME_META.FAILED.label },
]

const emptyFilters = () => ({
  entityName: '',
  entityId: '',
  action: '',
  outcome: 'all',
  userId: '',
  performedBy: '',
  from: '',
  to: '',
})
const draft = reactive(emptyFilters())
const applied = reactive(emptyFilters())
const userIdError = ref('')

// `to` without a time (00:00) means "through the end of that day"; BACK treats both ends as inclusive
const endOfDay = (value) => (value.endsWith('T00:00:00') ? `${value.slice(0, 10)}T23:59:59` : value)

const { items, total, totalPages, page, loading, error, forbidden, reload } = usePagedList(
  ({ page: backendPage, size }) => {
    const data = { page: backendPage, size }
    const text = (key) => String(applied[key]).trim()
    for (const key of ['entityName', 'entityId', 'action', 'performedBy']) {
      if (text(key)) data[key] = text(key)
    }
    if (applied.outcome !== 'all') data.outcome = applied.outcome
    if (text('userId')) data.userId = Number(text('userId'))
    if (applied.from) data.from = applied.from
    if (applied.to) data.to = endOfDay(applied.to)
    return app.$api.audit.searchAudit({ data })
  },
  { size: PAGE_SIZE, filters: applied, backendBase: 1 }
)

const search = () => {
  const userId = parseQuantity(draft.userId)
  if (String(draft.userId).trim() && userId === null) {
    userIdError.value = 'یک عدد صحیح وارد کنید'
    return
  }
  userIdError.value = ''
  const before = JSON.stringify(applied)
  Object.assign(applied, draft, { userId: userId === null ? '' : String(userId) })
  // Same filters again: the watcher stays quiet, so «جستجو» refreshes the list itself
  if (JSON.stringify(applied) === before) reload()
}

const clearFilters = () => {
  Object.assign(draft, emptyFilters())
  userIdError.value = ''
  search()
}

// ---- Expandable rows ----
const openIds = ref(new Set())
const isOpen = (id) => openIds.value.has(id)
const toggle = (id) => {
  const next = new Set(openIds.value)
  if (next.has(id)) next.delete(id)
  else next.add(id)
  openIds.value = next
}

// Old and new values are JSON text: pretty-print when it parses, otherwise show it as is. Always rendered as text.
const prettyValue = (text) => {
  try {
    return JSON.stringify(JSON.parse(text), null, 2)
  } catch {
    return text
  }
}

useHead({ title: 'لاگ ممیزی | پنل مدیریت' })
</script>

<style scoped>
.sk-enter-active { transition: opacity 0.25s ease; }
.sk-leave-active { transition: opacity 0.25s ease; position: absolute; inset: 0; }
.sk-enter-from, .sk-leave-to { opacity: 0; }
</style>
