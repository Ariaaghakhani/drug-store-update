<template>
  <div class="relative">
    <Transition name="sk">
      <div v-if="pending" key="sk">
        <div class="border-b border-gray-100 dark:border-gray-800 px-6 py-3 bg-gray-50 dark:bg-gray-800/50 flex gap-6">
          <USkeleton class="h-4 w-24 rounded" />
          <USkeleton class="h-4 w-20 rounded" />
          <USkeleton class="h-4 w-14 rounded" />
          <USkeleton class="h-4 w-14 rounded" />
          <USkeleton class="h-4 w-20 rounded" />
        </div>
        <div
          v-for="i in pageSize"
          :key="i"
          class="flex items-center gap-5 px-6 py-4 border-b border-gray-100 dark:border-gray-800 last:border-0"
        >
          <USkeleton class="w-8 h-8 rounded-full flex-shrink-0" />
          <USkeleton class="h-4 w-28 rounded" />
          <USkeleton class="h-4 w-28 rounded ms-auto" />
          <USkeleton class="h-5 w-16 rounded-full" />
          <USkeleton class="h-3 w-3 rounded-full" />
          <USkeleton class="h-4 w-20 rounded" />
          <USkeleton class="h-8 w-8 rounded-lg" />
        </div>
      </div>

      <div v-else key="data">
        <div v-if="users.length > 0" class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                <th class="text-start text-xs font-medium text-gray-500 dark:text-gray-400 px-6 py-3">نام کاربر</th>
                <th class="text-start text-xs font-medium text-gray-500 dark:text-gray-400 px-6 py-3">شماره موبایل</th>
                <th class="text-start text-xs font-medium text-gray-500 dark:text-gray-400 px-6 py-3">نقش</th>
                <th class="text-start text-xs font-medium text-gray-500 dark:text-gray-400 px-6 py-3">وضعیت</th>
                <th class="text-start text-xs font-medium text-gray-500 dark:text-gray-400 px-6 py-3">آخرین ورود</th>
                <th class="px-6 py-3" />
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="user in users"
                :key="user.id"
                class="border-b border-gray-100 dark:border-gray-800 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors"
              >
                <td class="px-6 py-4">
                  <div class="flex items-center gap-3">
                    <div class="w-8 h-8 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center flex-shrink-0">
                      <span class="text-xs font-bold text-white">{{ user.fullName[0] }}</span>
                    </div>
                    <span class="text-sm font-medium text-gray-900 dark:text-white">{{ user.fullName }}</span>
                  </div>
                </td>
                <td class="px-6 py-4">
                  <span class="text-sm font-mono tabular-nums text-gray-600 dark:text-gray-400" dir="ltr">{{ user.phone }}</span>
                </td>
                <td class="px-6 py-4">
                  <UBadge :color="roleBadgeColor[user.roleId] ?? 'neutral'" variant="subtle" size="sm">
                    {{ user.roleFa }}
                  </UBadge>
                </td>
                <td class="px-6 py-4">
                  <div class="flex items-center gap-2">
                    <span
                      class="w-2 h-2 rounded-full flex-shrink-0"
                      :class="user.isActive ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'"
                    />
                    <span class="text-xs text-gray-600 dark:text-gray-400">
                      {{ user.isActive ? 'فعال' : 'غیرفعال' }}
                    </span>
                  </div>
                </td>
                <td class="px-6 py-4">
                  <span class="text-xs text-gray-500 dark:text-gray-400">{{ user.lastLoginFa }}</span>
                </td>
                <td class="px-6 py-4">
                  <UDropdownMenu
                    v-if="rowActions(user).length > 0"
                    :items="[rowActions(user)]"
                    :ui="{ content: 'font-dana w-44' }"
                  >
                    <UButton
                      variant="ghost"
                      icon="i-heroicons-ellipsis-vertical"
                      size="xs"
                      color="neutral"
                      square
                    />
                  </UDropdownMenu>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-else class="flex flex-col items-center justify-center py-16 gap-3">
          <UIcon name="i-heroicons-users" class="w-16 h-16 text-gray-300 dark:text-gray-700" />
          <p class="text-base font-bold text-gray-900 dark:text-white">کاربری یافت نشد</p>
          <p class="text-sm text-gray-500 dark:text-gray-400">فیلتر را تغییر دهید یا عبارت جستجو را بررسی کنید</p>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import type { PanelUser } from '@/types/panel-users'

const props = defineProps<{
  users: PanelUser[]
  pending: boolean
  pageSize: number
  canUpdate: boolean
  canDelete: boolean
}>()

const emit = defineEmits<{
  edit: [user: PanelUser]
  deactivate: [user: PanelUser]
  delete: [user: PanelUser]
}>()

const roleBadgeColor: Record<string, 'warning' | 'info' | 'primary' | 'neutral' | 'success'> = {
  owner: 'warning',
  admin: 'info',
  pharmacist: 'primary',
  support: 'neutral',
  customer: 'success',
}

const rowActions = (user: PanelUser) => {
  const items: { label: string; icon: string; color?: string; onSelect: () => void }[] = []
  if (props.canUpdate) {
    items.push({
      label: 'ویرایش',
      icon: 'i-heroicons-pencil-square',
      onSelect: () => emit('edit', user),
    })
    items.push({
      label: user.isActive ? 'غیرفعال‌سازی' : 'فعال‌سازی',
      icon: user.isActive ? 'i-heroicons-no-symbol' : 'i-heroicons-check-circle',
      onSelect: () => emit('deactivate', user),
    })
  }
  if (props.canDelete) {
    items.push({
      label: 'حذف',
      icon: 'i-heroicons-trash',
      color: 'error',
      onSelect: () => emit('delete', user),
    })
  }
  return items
}
</script>

<style scoped>
.sk-enter-active,
.sk-leave-active {
  transition: opacity 0.2s ease;
}
.sk-enter-from,
.sk-leave-to {
  opacity: 0;
}
.sk-leave-active {
  position: absolute;
  inset: 0;
}
</style>