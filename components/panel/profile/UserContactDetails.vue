<template>
  <UCard :ui="{ body: 'p-0' }">
    <div class="flex items-center gap-2 px-4 sm:px-6 py-4 border-b border-gray-100 dark:border-gray-800">
      <UIcon name="i-heroicons-shield-check" class="w-4 h-4 text-brand-500 flex-shrink-0" />
      <h3 class="text-sm font-medium text-gray-900 dark:text-white">اطلاعات تماس و تأیید</h3>
    </div>

    <!-- Phone -->
    <div class="flex items-center gap-3 px-4 sm:px-6 py-4 border-b border-gray-100 dark:border-gray-800">
      <div class="w-9 h-9 rounded-lg bg-brand-500/15 flex items-center justify-center flex-shrink-0">
        <UIcon name="i-heroicons-device-phone-mobile" class="w-5 h-5 text-brand-500" />
      </div>
      <div class="flex-1 min-w-0">
        <p class="text-sm font-medium text-gray-900 dark:text-white">شماره موبایل</p>
        <p dir="ltr" class="text-xs text-gray-400 dark:text-gray-500 mt-0.5 text-right">{{ phone }}</p>
      </div>
      <UButton variant="soft" color="neutral" size="lg" icon="i-heroicons-pencil-square" class="flex-shrink-0" @click="emit('change-phone')">
        ویرایش
      </UButton>
    </div>

    <!-- Email -->
    <div class="flex items-center gap-3 px-4 sm:px-6 py-4 border-b border-gray-100 dark:border-gray-800">
      <div :class="['w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0', emailVerified ? 'bg-brand-500/15' : 'bg-warning/10']">
        <UIcon name="i-heroicons-envelope" :class="['w-5 h-5', emailVerified ? 'text-brand-500' : 'text-warning']" />
      </div>
      <div class="flex-1 min-w-0">
        <div class="flex items-center gap-2">
          <p class="text-sm font-medium text-gray-900 dark:text-white">ایمیل</p>
          <UBadge :color="emailVerified ? 'success' : 'warning'" variant="subtle" size="sm">
            {{ emailVerified ? 'تأیید شده' : 'تأیید نشده' }}
          </UBadge>
        </div>
        <p dir="ltr" class="text-xs text-gray-400 dark:text-gray-500 mt-0.5 text-right">{{ email || '—' }}</p>
      </div>
      <UButton
        :color="emailVerified ? 'neutral' : 'primary'"
        :variant="emailVerified ? 'soft' : undefined"
        size="lg"
        icon="i-heroicons-envelope"
        class="flex-shrink-0"
        @click="emit('change-email')"
      >
        {{ emailVerified ? 'تغییر ایمیل' : 'ارسال لینک' }}
      </UButton>
    </div>

    <!-- SMS Notifications -->
    <div class="flex items-center justify-between px-4 sm:px-6 py-4">
      <div class="flex items-center gap-3">
        <div :class="['w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors duration-300', smsNotifications ? 'bg-brand-500/15' : 'bg-gray-100 dark:bg-gray-800']">
          <UIcon
            name="i-heroicons-chat-bubble-left-ellipsis"
            :class="['w-5 h-5 transition-colors duration-300', smsNotifications ? 'text-brand-500' : 'text-gray-500 dark:text-gray-400']"
          />
        </div>
        <div>
          <p class="text-sm font-medium text-gray-900 dark:text-white">اعلان‌های پیامکی</p>
          <p class="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">وضعیت سفارش، تخفیف‌ها</p>
        </div>
      </div>
      <USwitch
        :model-value="smsNotifications"
        size="lg"
        :ui="{ base: 'data-[state=checked]:bg-brand-500 dark:data-[state=checked]:bg-brand-400 data-[state=unchecked]:bg-gray-300 dark:data-[state=unchecked]:bg-gray-600' }"
        @update:model-value="emit('update:smsNotifications', $event)"
      />
    </div>
  </UCard>
</template>

<script setup lang="ts">
defineProps<{
  phone: string
  email: string
  emailVerified: boolean
  smsNotifications: boolean
}>()

const emit = defineEmits<{
  'change-phone': []
  'change-email': []
  'update:smsNotifications': [value: boolean]
}>()
</script>
