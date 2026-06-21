<template>
  <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 px-6 py-5 bg-gray-50/50 dark:bg-gray-800/20">
    <div v-for="domain in permissionDomains" :key="domain.key" class="space-y-3">
      <div class="flex items-center gap-2">
        <UIcon :name="domain.icon" class="w-4 h-4 text-brand-500 dark:text-brand-400" />
        <span class="text-xs font-semibold text-gray-700 dark:text-gray-300">{{ domain.label }}</span>
      </div>
      <div class="space-y-2">
        <div
          v-for="action in permissionActions"
          :key="action.key"
          class="flex items-center justify-between"
        >
          <span class="text-xs text-gray-600 dark:text-gray-400">{{ action.label }}</span>
          <USwitch
            size="sm"
            :model-value="permissions[domain.key][action.key]"
            :disabled="!canUpdate"
            :ui="{
              base: 'data-[state=checked]:bg-brand-500 dark:data-[state=checked]:bg-brand-400 data-[state=unchecked]:bg-gray-300 dark:data-[state=unchecked]:bg-gray-600',
            }"
            @update:model-value="(val: boolean) => emit('change', domain.key, action.key, val)"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { RolePermissions, Permission } from '@/stores/roles'

type PermissionDomain = keyof RolePermissions
type PermissionAction = keyof Permission

interface DomainDef {
  key: PermissionDomain
  label: string
  icon: string
}

interface ActionDef {
  key: PermissionAction
  label: string
}

defineProps<{
  permissions: RolePermissions
  canUpdate: boolean
}>()

const emit = defineEmits<{
  change: [domain: PermissionDomain, action: PermissionAction, value: boolean]
}>()

const permissionDomains: DomainDef[] = [
  { key: 'users', label: 'کاربران', icon: 'i-heroicons-users' },
  { key: 'products', label: 'محصولات', icon: 'i-heroicons-cube' },
  { key: 'orders', label: 'سفارش‌ها', icon: 'i-heroicons-banknotes' },
]

const permissionActions: ActionDef[] = [
  { key: 'create', label: 'ایجاد' },
  { key: 'read', label: 'مشاهده' },
  { key: 'update', label: 'ویرایش' },
  { key: 'delete', label: 'حذف' },
]
</script>