<template>
  <UModal :open="open" :ui="{ content: 'sm:max-w-xl p-0 gap-0 overflow-hidden' }" @update:open="emit('update:open', $event)">
    <template #content>
      <div class="flex flex-col font-dana" dir="rtl">
        <div class="flex items-center gap-3 px-5 py-4 border-b border-gray-100 dark:border-gray-800">
          <div class="w-8 h-8 rounded-lg bg-brand-500/15 flex items-center justify-center flex-shrink-0">
            <UIcon name="i-heroicons-pencil-square" class="w-4 h-4 text-brand-500" />
          </div>
          <h3 class="flex-1 text-sm font-semibold text-gray-900 dark:text-white">ویرایش کاربر</h3>
          <button
            class="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            @click="emit('update:open', false)"
          >
            <UIcon name="i-heroicons-x-mark" class="w-4 h-4" />
          </button>
        </div>

        <div class="px-5 py-5 space-y-5 overflow-y-auto max-h-[70vh]">
          <div class="grid grid-cols-2 gap-3">
            <div class="space-y-1.5">
              <label class="text-xs font-medium text-gray-700 dark:text-gray-300">نام و نام خانوادگی</label>
              <UInput v-model="draft.fullName" class="w-full" />
            </div>
            <div class="space-y-1.5">
              <label class="text-xs font-medium text-gray-700 dark:text-gray-300">شماره موبایل</label>
              <UInput v-model="draft.phone" dir="ltr" inputmode="tel" class="w-full" />
            </div>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div class="space-y-1.5">
              <label class="text-xs font-medium text-gray-700 dark:text-gray-300">نقش</label>
              <USelect v-model="draft.roleId" :items="roleSelectItems" class="w-full" @update:model-value="onRoleChange" />
            </div>
            <div class="flex items-center justify-between pt-6">
              <span class="text-xs font-medium text-gray-700 dark:text-gray-300">حساب فعال</span>
              <USwitch
                v-model="draft.isActive"
                size="lg"
                :ui="{
                  base: 'data-[state=checked]:bg-brand-500 dark:data-[state=checked]:bg-brand-400 data-[state=unchecked]:bg-gray-300 dark:data-[state=unchecked]:bg-gray-600',
                }"
              />
            </div>
          </div>

          <div class="border-t border-gray-100 dark:border-gray-800 pt-4">
            <p class="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-3">دسترسی‌ها</p>
            <UserPermissionsPanel
              :permissions="draft.permissions"
              :can-update="true"
              @change="onPermissionChange"
            />
          </div>
        </div>

        <div class="flex gap-3 px-5 py-4 border-t border-gray-100 dark:border-gray-800">
          <UButton variant="soft" color="neutral" class="flex-1 justify-center" @click="emit('update:open', false)">انصراف</UButton>
          <UButton color="primary" class="flex-1 justify-center" @click="handleSave">ذخیره تغییرات</UButton>
        </div>
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
import type { PanelUser } from '@/types/panel-users'
import type { RolePermissions, Permission } from '@/stores/roles'
import UserPermissionsPanel from '@/components/panel/users/UserPermissionsPanel.vue'

type PermissionDomain = keyof RolePermissions
type PermissionAction = keyof Permission

interface SelectItem {
  label: string
  value: string
}

const props = defineProps<{
  open: boolean
  user: PanelUser | null
  roleSelectItems: SelectItem[]
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  save: [user: PanelUser]
}>()

const rolesStore = useRolesStore()

const draft = ref<PanelUser>({
  id: 0,
  fullName: '',
  phone: '',
  roleId: 'customer',
  roleFa: '',
  isActive: true,
  lastLoginFa: '',
  permissions: {
    users: { create: false, read: true, update: false, delete: false },
    products: { create: false, read: true, update: false, delete: false },
    orders: { create: false, read: true, update: false, delete: false },
  },
})

watch(
  () => props.user,
  (user) => {
    if (user) {
      draft.value = {
        ...user,
        permissions: {
          users: { ...user.permissions.users },
          products: { ...user.permissions.products },
          orders: { ...user.permissions.orders },
        },
      }
    }
  },
  { immediate: true },
)

const onRoleChange = (roleId: string) => {
  const role = rolesStore.roles.find((r) => r.id === roleId)
  if (role) {
    draft.value.roleFa = role.labelFa
  }
}

const onPermissionChange = (domain: PermissionDomain, action: PermissionAction, value: boolean) => {
  draft.value.permissions[domain][action] = value
}

const handleSave = () => {
  emit('save', { ...draft.value })
  emit('update:open', false)
}
</script>