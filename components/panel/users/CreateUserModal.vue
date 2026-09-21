<template>
  <UModal :open="open" :ui="{ content: 'sm:max-w-md p-0 gap-0 overflow-hidden' }" @update:open="emit('update:open', $event)">
    <template #content>
      <div class="flex flex-col font-dana" dir="rtl">
        <div class="flex items-center gap-3 px-5 py-4 border-b border-gray-100 dark:border-gray-800">
          <div class="w-8 h-8 rounded-lg bg-brand-500/15 flex items-center justify-center flex-shrink-0">
            <UIcon name="i-heroicons-user-plus" class="w-4 h-4 text-brand-500" />
          </div>
          <h3 class="flex-1 text-sm font-semibold text-gray-900 dark:text-white">افزودن کاربر جدید</h3>
          <button
            class="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            @click="emit('update:open', false)"
          >
            <UIcon name="i-heroicons-x-mark" class="w-4 h-4" />
          </button>
        </div>

        <div class="px-5 py-5 space-y-4">
          <div class="space-y-1.5">
            <label class="text-xs font-medium text-gray-700 dark:text-gray-300">نام و نام خانوادگی</label>
            <UInput v-model="form.fullName" placeholder="مثال: علی محمدی" class="w-full" />
          </div>
          <div class="space-y-1.5">
            <label class="text-xs font-medium text-gray-700 dark:text-gray-300">شماره موبایل</label>
            <UInput v-model="form.phone" placeholder="09XXXXXXXXX" dir="ltr" inputmode="tel" class="w-full" />
          </div>
          <div class="space-y-1.5">
            <label class="text-xs font-medium text-gray-700 dark:text-gray-300">نقش</label>
            <USelect v-model="form.roleId" :items="roleSelectItems" class="w-full" />
          </div>
          <div class="flex items-center justify-between py-1">
            <span class="text-xs font-medium text-gray-700 dark:text-gray-300">حساب فعال</span>
            <USwitch
              v-model="form.isActive"
              size="lg"
              :ui="{
                base: 'data-[state=checked]:bg-brand-500 dark:data-[state=checked]:bg-brand-400 data-[state=unchecked]:bg-gray-300 dark:data-[state=unchecked]:bg-gray-600',
              }"
            />
          </div>
        </div>

        <div class="flex gap-3 px-5 pb-5">
          <UButton variant="soft" color="neutral" class="flex-1 justify-center" @click="emit('update:open', false)">انصراف</UButton>
          <UButton
            color="primary"
            class="flex-1 justify-center"
            :disabled="!form.fullName.trim() || !form.phone.trim()"
            @click="handleSubmit"
          >
            ذخیره
          </UButton>
        </div>
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
import type { CreateUserForm } from '@/types/panel-users'

interface SelectItem {
  label: string
  value: string
}

defineProps<{
  open: boolean
  roleSelectItems: SelectItem[]
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  create: [form: CreateUserForm]
}>()

const form = reactive<CreateUserForm>({
  fullName: '',
  phone: '',
  roleId: 'customer',
  isActive: true,
})

const handleSubmit = () => {
  emit('create', { ...form })
  Object.assign(form, { fullName: '', phone: '', roleId: 'customer', isActive: true })
}
</script>