<template>
  <UPopover v-model:open="open" :content="{ align: 'end', sideOffset: 8 }">
    <UChip :show="unread > 0" :text="badgeText" color="error" size="3xl" inset>
      <UButton
        color="neutral"
        variant="ghost"
        square
        size="lg"
        icon="i-heroicons-bell"
        aria-label="اعلان‌ها"
        class="w-10 h-10 justify-center"
      />
    </UChip>

    <template #content>
      <div dir="rtl" class="w-80 font-dana">
        <div class="flex items-center justify-between gap-2 px-4 py-3 border-b border-gray-100 dark:border-gray-800">
          <h3 class="text-sm font-bold text-gray-900 dark:text-white">اعلان‌ها</h3>
          <UButton
            v-if="unread > 0"
            color="neutral"
            variant="soft"
            size="xs"
            :loading="markingAll"
            @click="readAll"
          >
            خواندن همه
          </UButton>
        </div>

        <div class="relative max-h-96 overflow-y-auto">
          <Transition name="sk">
            <div v-if="recentLoading && !recent.length" key="skeleton" class="divide-y divide-gray-100 dark:divide-gray-800">
              <div v-for="i in 3" :key="i" class="flex items-start gap-3 px-4 py-3">
                <USkeleton class="w-9 h-9 rounded-xl flex-shrink-0" />
                <div class="flex-1 space-y-2">
                  <USkeleton class="h-4 w-40" />
                  <USkeleton class="h-3 w-24" />
                </div>
              </div>
            </div>

            <div v-else-if="recent.length" key="list" class="divide-y divide-gray-100 dark:divide-gray-800">
              <NotificationItem
                v-for="item in recent"
                :key="item.id"
                :notification="item"
                compact
                @select="openNotification"
              />
            </div>

            <div v-else key="empty" class="text-center py-10 px-4">
              <UIcon name="i-heroicons-bell-slash" class="w-10 h-10 mx-auto text-gray-300 dark:text-gray-600 mb-2" />
              <p class="text-sm font-bold text-gray-900 dark:text-white">اعلانی ندارید</p>
              <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">خبرهای سفارش و پشتیبانی اینجا نمایش داده می‌شود</p>
            </div>
          </Transition>
        </div>

        <NuxtLink
          to="/panel/notifications"
          class="block text-center text-sm font-medium text-brand-500 dark:text-brand-400 py-3 border-t border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
          @click="open = false"
        >
          مشاهده همه اعلان‌ها
        </NuxtLink>
      </div>
    </template>
  </UPopover>
</template>

<script setup>
// Self-contained header widget: reads the shared inbox state (useNotifications) itself, like the panel's other
// app-state-owning widgets, so pages/panel.vue only has to place it.
import NotificationItem from '@/components/panel/notifications/NotificationItem.vue'

const toast = useAppToast()
const { unread, recent, recentLoading, loadRecent, markRead, markAllRead } = useNotifications()

const open = ref(false)
const markingAll = ref(false)

const badgeText = computed(() => (unread.value > 99 ? '۹۹+' : unread.value.toLocaleString('fa-IR')))

watch(open, (isOpen) => {
  if (isOpen) loadRecent()
})

async function openNotification(notification) {
  open.value = false
  markRead(notification)
  if (notification.link) await navigateTo(notification.link)
}

async function readAll() {
  markingAll.value = true
  try {
    await markAllRead()
  } catch {
    toast.error('علامت‌گذاری اعلان‌ها ناموفق بود')
  } finally {
    markingAll.value = false
  }
}
</script>

<style scoped>
.sk-enter-active { transition: opacity 0.25s ease; }
.sk-leave-active { transition: opacity 0.25s ease; position: absolute; inset: 0; }
.sk-enter-from, .sk-leave-to { opacity: 0; }
</style>
