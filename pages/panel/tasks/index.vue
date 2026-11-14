<!-- pages/panel/tasks/index.vue -->
<template>
  <div class="space-y-5">
    <PanelPageHeader
      icon="i-heroicons-inbox-stack"
      title="کارتابل"
      accent="گردش کار"
      subtitle="کارهای تأیید سپرده‌شده به شما یا قابل برداشت"
    >
      <template #actions>
        <UButton
          color="neutral"
          variant="soft"
          size="lg"
          icon="i-heroicons-arrow-path"
          :loading="loading"
          @click="refreshAll"
        >
          به‌روزرسانی
        </UButton>
      </template>
    </PanelPageHeader>

    <UCard>
      <div v-if="!unavailable" class="flex flex-wrap items-center justify-between gap-3 mb-5">
        <UTabs v-model="filters.scope" :items="tabItems" :content="false" variant="link" color="primary" />
        <label class="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
          <USwitch
            v-model="overdueOnly"
            size="lg"
            :ui="{
              base: 'data-[state=checked]:bg-brand-500 dark:data-[state=checked]:bg-brand-400 data-[state=unchecked]:bg-gray-300 dark:data-[state=unchecked]:bg-gray-600',
            }"
          />
          فقط دیرشده‌ها
        </label>
      </div>

      <div class="relative">
        <Transition name="sk">
          <div v-if="loading" key="skeleton" class="space-y-3">
            <div
              v-for="i in 3"
              :key="i"
              class="flex items-start gap-4 px-4 py-4 rounded-xl border border-gray-100 dark:border-gray-800"
            >
              <div class="flex-1 space-y-2">
                <USkeleton class="h-4 w-64" />
                <USkeleton class="h-3 w-48" />
                <USkeleton class="h-3 w-40" />
              </div>
              <USkeleton class="h-5 w-16 rounded-full" />
            </div>
          </div>

          <PanelEmptyState
            v-else-if="unavailable"
            key="forbidden"
            variant="forbidden"
            title="گردش کار در دسترس نیست"
            text="یا دسترسی ندارید یا گردش کار برای این فروشگاه روشن نیست"
          />

          <PanelEmptyState
            v-else-if="error"
            key="error"
            variant="error"
            title="دریافت کارتابل ناموفق بود"
          >
            <template #action>
              <UButton color="neutral" variant="soft" icon="i-heroicons-arrow-path" @click="refreshAll">
                تلاش دوباره
              </UButton>
            </template>
          </PanelEmptyState>

          <div v-else-if="visibleItems.length" key="content" class="space-y-3">
            <p v-if="overdueOnly" class="text-xs text-gray-500 dark:text-gray-400">
              این فیلتر فقط کارهای دیرشده‌ی همین صفحه از فهرست را نشان می‌دهد
            </p>

            <NuxtLink
              v-for="item in visibleItems"
              :key="item.taskId"
              :to="`/panel/tasks/${encodeURIComponent(item.taskId)}`"
              class="block px-4 py-4 rounded-xl border border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors"
            >
              <div class="flex items-start gap-4">
                <div class="flex-1 min-w-0 space-y-2">
                  <div class="flex items-center gap-2 flex-wrap">
                    <span class="text-sm font-semibold text-gray-900 dark:text-white">{{ taskTitle(item) }}</span>
                    <UBadge v-if="item.overdue" color="error" variant="subtle" size="xs">دیرشده</UBadge>
                  </div>

                  <ul v-if="item.summary?.lines?.length" class="space-y-0.5">
                    <li
                      v-for="(line, index) in item.summary.lines.slice(0, MAX_LINES)"
                      :key="index"
                      class="text-xs text-gray-600 dark:text-gray-300"
                    >
                      <span class="text-gray-500 dark:text-gray-400">{{ line.label }}:</span>
                      {{ line.value }}
                    </li>
                  </ul>

                  <div class="flex items-center gap-2 flex-wrap">
                    <UBadge color="neutral" variant="subtle" size="xs">{{ item.stepTitle }}</UBadge>
                    <UBadge color="neutral" variant="outline" size="xs">{{ item.subjectTitle }}</UBadge>
                    <UBadge :color="item.status === 'CLAIMED' ? 'info' : 'neutral'" variant="subtle" size="xs">
                      {{ item.status === 'CLAIMED' ? 'برداشته‌شده' : 'برداشته‌نشده' }}
                    </UBadge>
                  </div>

                  <p class="text-xs text-gray-500 dark:text-gray-400">
                    ثبت‌کننده:
                    <template v-if="item.startedByName">{{ item.startedByName }}</template>
                    <span v-else-if="item.startedBy" dir="ltr">{{ item.startedBy }}</span>
                    <template v-else>سیستم</template>
                    · {{ formatJalali(item.createdAt, { withTime: true }) }}
                    <template v-if="item.assigneeName"> · برداشته‌شده توسط {{ item.assigneeName }}</template>
                  </p>
                  <p
                    v-if="item.dueAt"
                    class="text-xs"
                    :class="item.overdue ? 'text-error' : 'text-gray-500 dark:text-gray-400'"
                  >
                    مهلت: {{ formatJalali(item.dueAt, { withTime: true }) }}
                  </p>
                </div>
                <UIcon name="i-heroicons-chevron-left" class="w-5 h-5 mt-1 flex-shrink-0 text-gray-400 dark:text-gray-600" />
              </div>
            </NuxtLink>

            <div v-if="totalPages > 1" class="flex justify-center pt-2">
              <UPagination v-model:page="page" :total="total" :items-per-page="PAGE_SIZE" />
            </div>
          </div>

          <PanelEmptyState
            v-else
            key="empty"
            icon="i-heroicons-inbox-stack"
            title="کاری در کارتابل شما نیست"
            :text="emptyText"
          />
        </Transition>
      </div>
    </UCard>
  </div>
</template>

<script setup>
import PanelPageHeader from '@/components/panel/PanelPageHeader.vue'
import PanelEmptyState from '@/components/panel/PanelEmptyState.vue'
import { formatJalali } from '~/utils/jalali.js'
import { isWorkflowUnavailable, taskTitle } from '~/utils/workflowMeta.js'

const PAGE_SIZE = 20
const MAX_LINES = 3

const app = useNuxtApp()
const { count, refresh: refreshCount } = useWorkflowTaskCount()

// MINE = held by or assigned to me, CLAIMABLE = unclaimed and I (or my role) am a candidate. A scope change returns to page 1
const filters = reactive({ scope: 'MINE' })
// BACK has no overdue filter on the inbox, so this one only hides rows of the loaded page
const overdueOnly = ref(false)

const { items, total, totalPages, page, loading, error, reload } = usePagedList(
  ({ page: backendPage, size }) =>
    app.$api.workflow.listTasks({ params: { scope: filters.scope, page: backendPage, size } }),
  { size: PAGE_SIZE, filters }
)

// 403 (no grant) or 404 (workflow not switched on for this store) = unavailable, not an error to retry
const unavailable = computed(() => isWorkflowUnavailable(error.value))

const visibleItems = computed(() => (overdueOnly.value ? items.value.filter((item) => item.overdue) : items.value))

const countLabel = (label, value) =>
  value === undefined || value === null ? label : `${label} (${Number(value).toLocaleString('fa-IR')})`

const tabItems = computed(() => [
  { label: countLabel('کارهای من', count.value?.mine), value: 'MINE' },
  { label: countLabel('قابل برداشت', count.value?.claimable), value: 'CLAIMABLE' },
])

const emptyText = computed(() => {
  if (overdueOnly.value && items.value.length) return 'در این صفحه کار دیرشده‌ای نیست'
  return filters.scope === 'MINE'
    ? 'کاری به شما سپرده نشده و کاری را برنداشته‌اید'
    : 'کار برداشته‌نشده‌ای که شما یا نقشتان گیرنده‌ی آن باشید وجود ندارد'
})

// The tab counts and the sidebar badge share one source (useWorkflowTaskCount); `force` retries after an unavailable answer
const refreshAll = () => {
  refreshCount({ force: true })
  reload()
}

onMounted(() => refreshCount({ force: true }))

useHead({ title: 'کارتابل | پنل مدیریت' })
</script>

<style scoped>
.sk-enter-active { transition: opacity 0.25s ease; }
.sk-leave-active { transition: opacity 0.25s ease; position: absolute; inset: 0; }
.sk-enter-from, .sk-leave-to { opacity: 0; }
</style>
