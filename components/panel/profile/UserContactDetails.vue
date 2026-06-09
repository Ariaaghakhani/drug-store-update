<template>
  <div class="relative">
    <Transition name="sk">
      <UCard v-if="loading" key="sk" :ui="{ body: 'p-0' }">
        <div class="flex items-center gap-2 px-4 sm:px-6 py-4 border-b border-gray-100 dark:border-gray-800">
          <USkeleton class="w-4 h-4 rounded flex-shrink-0" />
          <USkeleton class="h-4 w-32" />
        </div>
        <div class="divide-y divide-gray-100 dark:divide-gray-800">
          <div v-for="i in 2" :key="i" class="flex items-center gap-3 px-4 sm:px-6 py-4">
            <USkeleton class="w-9 h-9 rounded-lg flex-shrink-0" />
            <div class="flex-1 space-y-1.5">
              <USkeleton class="h-3.5 w-20" />
              <USkeleton class="h-3 w-28" />
            </div>
            <div class="flex items-center gap-2 flex-shrink-0">
              <USkeleton class="h-5 w-16 rounded-full" />
              <USkeleton class="h-7 w-12 rounded-lg" />
            </div>
          </div>
          <div class="flex items-center justify-between px-4 sm:px-6 py-4">
            <div class="flex items-center gap-3">
              <USkeleton class="w-9 h-9 rounded-lg flex-shrink-0" />
              <div class="space-y-1.5">
                <USkeleton class="h-3.5 w-28" />
                <USkeleton class="h-3 w-36" />
              </div>
            </div>
            <USkeleton class="h-6 w-11 rounded-full" />
          </div>
        </div>
      </UCard>

      <UCard v-else key="content" :ui="{ body: 'p-0' }">
        <div class="flex items-center gap-2 px-4 sm:px-6 py-4 border-b border-gray-100 dark:border-gray-800">
          <UIcon name="i-heroicons-shield-check" class="w-4 h-4 text-brand-500 flex-shrink-0" />
          <h3 class="text-sm font-medium text-gray-900 dark:text-white">اطلاعات تماس و تأیید</h3>
        </div>

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
    </Transition>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  loading?: boolean
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

<style scoped>
.sk-enter-active { transition: opacity 0.25s ease; }
.sk-leave-active { transition: opacity 0.25s ease; position: absolute; inset: 0; }
.sk-enter-from, .sk-leave-to { opacity: 0; }
</style>
