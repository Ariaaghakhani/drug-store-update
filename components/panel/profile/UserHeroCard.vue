<template>
  <div class="relative">
    <Transition name="sk">
      <UCard v-if="loading" key="sk">
        <div class="flex items-center gap-5 pb-5 border-b border-gray-100 dark:border-gray-800">
          <USkeleton class="w-[72px] h-[72px] rounded-full flex-shrink-0" />
          <div class="space-y-2">
            <USkeleton class="h-5 w-32" />
            <USkeleton class="h-3 w-24" />
            <div class="flex gap-1.5 mt-1">
              <USkeleton class="h-5 w-20 rounded-full" />
              <USkeleton class="h-5 w-24 rounded-full" />
            </div>
          </div>
        </div>
        <div class="grid grid-cols-3 pt-5">
          <div class="text-center space-y-2">
            <USkeleton class="h-7 w-8 mx-auto" />
            <USkeleton class="h-3 w-12 mx-auto" />
          </div>
          <div class="text-center border-x border-gray-100 dark:border-gray-800 space-y-2">
            <USkeleton class="h-7 w-8 mx-auto" />
            <USkeleton class="h-3 w-20 mx-auto" />
          </div>
          <div class="text-center space-y-2">
            <USkeleton class="h-7 w-8 mx-auto" />
            <USkeleton class="h-3 w-20 mx-auto" />
          </div>
        </div>
      </UCard>

      <UCard v-else key="content">
        <div class="flex items-center gap-5 pb-5 border-b border-gray-100 dark:border-gray-800">
          <div class="relative flex-shrink-0">
            <div class="w-[72px] h-[72px] rounded-full bg-brand-500/15 border-2 border-brand-500/30 flex items-center justify-center">
              <span class="text-2xl font-semibold text-brand-500">{{ initials }}</span>
            </div>
            <button
              class="absolute bottom-0 end-0 w-[22px] h-[22px] rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center shadow-sm hover:border-brand-500 dark:hover:border-brand-400 group transition-colors"
              @click="fileInput?.click()"
            >
              <UIcon name="i-heroicons-camera" class="w-3 h-3 text-gray-400 group-hover:text-brand-500 dark:group-hover:text-brand-400 transition-colors" />
            </button>
            <input ref="fileInput" type="file" accept="image/*" class="hidden" @change="onAvatarChange" />
          </div>

          <div>
            <h2 class="text-lg font-semibold text-gray-900 dark:text-white">{{ fullName }}</h2>
            <p class="text-xs text-gray-400 dark:text-gray-500 mt-0.5">عضو از {{ memberSince }}</p>
            <div class="flex gap-1.5 mt-2.5 flex-wrap">
              <UBadge color="success" variant="subtle" size="sm">حساب تأیید شده</UBadge>
              <UBadge color="warning" variant="subtle" size="sm">کد ملی تأیید نشده</UBadge>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-3 pt-5">
          <div class="text-center">
            <p class="text-xl font-semibold text-brand-500">{{ stats.orders.toLocaleString('fa-IR') }}</p>
            <p class="text-[11px] text-gray-400 dark:text-gray-500 mt-1">سفارش‌ها</p>
          </div>
          <div class="text-center border-x border-gray-100 dark:border-gray-800">
            <p class="text-xl font-semibold text-brand-500">{{ stats.addresses.toLocaleString('fa-IR') }}</p>
            <p class="text-[11px] text-gray-400 dark:text-gray-500 mt-1">آدرس‌های ذخیره‌شده</p>
          </div>
          <div class="text-center">
            <p class="text-xl font-semibold text-brand-500">{{ stats.prescriptions.toLocaleString('fa-IR') }}</p>
            <p class="text-[11px] text-gray-400 dark:text-gray-500 mt-1">داروهای نسخه‌ای</p>
          </div>
        </div>
      </UCard>
    </Transition>
  </div>
</template>

<script setup lang="ts">
interface Stats {
  orders: number
  addresses: number
  prescriptions: number
}

defineProps<{
  loading?: boolean
  fullName: string
  initials: string
  memberSince: string
  stats: Stats
}>()

const emit = defineEmits<{
  'avatar-change': [file: File]
}>()

const fileInput = ref<HTMLInputElement | null>(null)

const onAvatarChange = (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (file) emit('avatar-change', file)
}
</script>

<style scoped>
.sk-enter-active { transition: opacity 0.25s ease; }
.sk-leave-active { transition: opacity 0.25s ease; position: absolute; inset: 0; }
.sk-enter-from, .sk-leave-to { opacity: 0; }
</style>
