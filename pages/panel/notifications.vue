<!-- pages/panel/notifications.vue -->
<template>
  <div class="space-y-6">
    <PushPermissionCard />

    <UCard>
      <div class="flex items-center justify-between mb-6 gap-3 flex-wrap">
        <h3 class="text-xl font-black text-gray-900 dark:text-white">
          اعلان‌های <span class="text-brand-500">من</span>
        </h3>
        <div class="flex items-center gap-2">
          <USelect v-model="filter" :items="filterOptions" size="sm" class="w-36" />
          <UButton
            color="neutral"
            variant="soft"
            icon="i-heroicons-check"
            :disabled="unread === 0"
            :loading="markingAll"
            @click="readAll"
          >
            خواندن همه
          </UButton>
        </div>
      </div>

      <div class="relative">
        <Transition name="sk">
          <div v-if="loading" key="skeleton" class="space-y-3">
            <div
              v-for="i in 4"
              :key="i"
              class="flex items-start gap-3 px-4 py-4 rounded-xl border border-gray-100 dark:border-gray-800"
            >
              <USkeleton class="w-11 h-11 rounded-xl flex-shrink-0" />
              <div class="flex-1 space-y-2">
                <USkeleton class="h-4 w-48" />
                <USkeleton class="h-3 w-64" />
                <USkeleton class="h-3 w-20" />
              </div>
            </div>
          </div>

          <div v-else-if="notifications.length" key="content" class="space-y-3">
            <NotificationItem
              v-for="item in notifications"
              :key="item.id"
              :notification="item"
              @select="openNotification"
            />

            <div v-if="totalPages > 1" class="flex justify-center pt-2">
              <UPagination v-model:page="pageNumber" :total="totalElements" :items-per-page="PAGE_SIZE" />
            </div>
          </div>

          <div v-else key="empty" class="text-center py-16">
            <div
              class="w-20 h-20 mx-auto bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4"
            >
              <UIcon name="i-heroicons-bell-slash" class="w-10 h-10 text-gray-400 dark:text-gray-600" />
            </div>
            <h4 class="text-base font-bold text-gray-900 dark:text-white mb-2">
              {{ filter === 'unread' ? 'اعلان خوانده‌نشده‌ای ندارید' : 'هنوز اعلانی ندارید' }}
            </h4>
            <p class="text-sm text-gray-500 dark:text-gray-400 mb-6">
              خبرهای سفارش، پشتیبانی و موجود شدن کالا اینجا جمع می‌شود
            </p>
            <UButton v-if="filter === 'unread'" color="neutral" variant="soft" @click="filter = 'all'">
              نمایش همه اعلان‌ها
            </UButton>
          </div>
        </Transition>
      </div>
    </UCard>
  </div>
</template>

<script setup>
import NotificationItem from '@/components/panel/notifications/NotificationItem.vue'
import PushPermissionCard from '@/components/panel/notifications/PushPermissionCard.vue'

const PAGE_SIZE = 20

const app = useNuxtApp()
const toast = useAppToast()
const { unread, refreshUnread, markRead, markAllRead } = useNotifications()

const loading = ref(true)
const notifications = ref([])
const totalElements = ref(0)
const totalPages = ref(0)
const pageNumber = ref(1) // UPagination is 1-based; BACK is 0-based
const filter = ref('all')
const markingAll = ref(false)

const filterOptions = [
  { value: 'all', label: 'همه' },
  { value: 'unread', label: 'خوانده‌نشده' },
]

async function fetchNotifications() {
  loading.value = true
  try {
    const params = { page: pageNumber.value - 1, size: PAGE_SIZE }
    if (filter.value === 'unread') params.unreadOnly = true
    const response = await app.$api.notification.listNotifications({ params })
    const page = response.data.data
    notifications.value = page?.content ?? []
    totalElements.value = page?.totalElements ?? 0
    totalPages.value = page?.totalPages ?? 0
  } catch {
    notifications.value = []
    totalElements.value = 0
    totalPages.value = 0
  } finally {
    loading.value = false
  }
}

watch(filter, () => {
  if (pageNumber.value === 1) fetchNotifications()
  else pageNumber.value = 1
})
watch(pageNumber, fetchNotifications)
onMounted(() => {
  fetchNotifications()
  refreshUnread()
})

async function openNotification(notification) {
  markRead(notification)
  if (notification.link) await navigateTo(notification.link)
}

async function readAll() {
  markingAll.value = true
  try {
    await markAllRead()
    const readAt = new Date().toISOString()
    notifications.value.forEach((item) => {
      item.readAt ??= readAt
    })
    if (filter.value === 'unread') await fetchNotifications()
  } catch {
    toast.error('علامت‌گذاری اعلان‌ها ناموفق بود')
  } finally {
    markingAll.value = false
  }
}

useHead({ title: 'اعلان‌ها | پنل کاربری' })
</script>

<style scoped>
.sk-enter-active { transition: opacity 0.25s ease; }
.sk-leave-active { transition: opacity 0.25s ease; position: absolute; inset: 0; }
.sk-enter-from, .sk-leave-to { opacity: 0; }
</style>
