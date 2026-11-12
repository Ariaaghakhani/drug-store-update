<template>
  <div class="relative">
    <Transition name="sk">
      <UCard v-if="loading" key="sk">
        <div class="flex items-center gap-5">
          <USkeleton class="w-[72px] h-[72px] rounded-full flex-shrink-0" />
          <div class="space-y-2">
            <USkeleton class="h-5 w-32" />
            <USkeleton class="h-5 w-20 rounded-full" />
            <USkeleton class="h-6 w-24 rounded-lg" />
          </div>
        </div>
        <div
          v-if="stats.length"
          class="grid pt-5 mt-5 border-t border-gray-100 dark:border-gray-800"
          :class="stats.length === 3 ? 'grid-cols-3' : 'grid-cols-2'"
        >
          <div v-for="item in stats" :key="item.label" class="text-center space-y-2">
            <USkeleton class="h-7 w-8 mx-auto" />
            <USkeleton class="h-3 w-16 mx-auto" />
          </div>
        </div>
      </UCard>

      <UCard v-else key="content">
        <div class="flex items-center gap-5">
          <div class="relative flex-shrink-0">
            <!-- the photo itself is the picker -->
            <button
              type="button"
              class="w-[72px] h-[72px] rounded-full overflow-hidden bg-brand-500/15 border-2 border-brand-500/30 flex items-center justify-center hover:border-brand-500 dark:hover:border-brand-400 transition-colors disabled:cursor-wait"
              :disabled="avatarSaving"
              :aria-label="avatarUrl ? 'تغییر عکس پروفایل' : 'افزودن عکس پروفایل'"
              @click="fileInput?.click()"
            >
              <img v-if="avatarUrl" :src="avatarUrl" alt="" class="w-full h-full object-cover" />
              <span v-else class="text-2xl font-semibold text-brand-500 dark:text-brand-400">{{ initials }}</span>
            </button>
            <div
              v-if="avatarSaving"
              class="absolute inset-0 rounded-full bg-white/70 dark:bg-gray-900/70 flex items-center justify-center"
            >
              <UIcon name="i-heroicons-arrow-path" class="w-5 h-5 text-brand-500 dark:text-brand-400 animate-spin" />
            </div>
            <button
              type="button"
              class="absolute bottom-0 end-0 w-[22px] h-[22px] rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center shadow-sm hover:border-brand-500 dark:hover:border-brand-400 group transition-colors"
              :disabled="avatarSaving"
              aria-label="انتخاب عکس پروفایل"
              @click="fileInput?.click()"
            >
              <UIcon name="i-heroicons-camera" class="w-3 h-3 text-gray-400 group-hover:text-brand-500 dark:group-hover:text-brand-400 transition-colors" />
            </button>
            <input ref="fileInput" type="file" accept="image/jpeg,image/png,image/webp" class="hidden" @change="onAvatarChange" />
          </div>

          <div>
            <h2 class="text-lg font-semibold text-gray-900 dark:text-white">{{ fullName }}</h2>
            <div v-if="roleLabel" class="flex gap-1.5 mt-2 flex-wrap">
              <UBadge color="primary" variant="subtle" size="sm">{{ roleLabel }}</UBadge>
            </div>
            <div class="flex gap-1 mt-2 -ms-2">
              <UButton
                color="neutral"
                variant="ghost"
                size="xs"
                icon="i-heroicons-camera"
                :disabled="avatarSaving"
                @click="fileInput?.click()"
              >
                {{ avatarUrl ? 'تغییر عکس' : 'افزودن عکس' }}
              </UButton>
              <UButton
                v-if="avatarUrl"
                color="error"
                variant="ghost"
                size="xs"
                icon="i-heroicons-trash"
                :disabled="avatarSaving"
                @click="emit('avatar-remove')"
              >
                حذف عکس
              </UButton>
            </div>
          </div>
        </div>

        <!-- the user's own counts (customers only); value null = still loading -->
        <div
          v-if="stats.length"
          class="grid pt-5 mt-5 border-t border-gray-100 dark:border-gray-800 divide-x divide-gray-100 dark:divide-gray-800"
          :class="stats.length === 3 ? 'grid-cols-3' : 'grid-cols-2'"
        >
          <div v-for="item in stats" :key="item.label" class="text-center">
            <USkeleton v-if="item.value === null" class="h-7 w-8 mx-auto" />
            <p v-else class="text-xl font-semibold text-brand-500 dark:text-brand-400">{{ item.value.toLocaleString('fa-IR') }}</p>
            <p class="text-[11px] text-gray-400 dark:text-gray-500 mt-1">{{ item.label }}</p>
          </div>
        </div>
      </UCard>
    </Transition>
  </div>
</template>

<script setup>
defineProps({
  loading: Boolean,
  fullName: String,
  initials: String,
  roleLabel: { type: String, default: '' },
  // [{label, value}]; empty = no stats row (staff)
  stats: { type: Array, default: () => [] },
  avatarUrl: { type: String, default: null },
  avatarSaving: { type: Boolean, default: false },
})

const emit = defineEmits(['avatar-change', 'avatar-remove'])

const fileInput = ref(null)

const onAvatarChange = (event) => {
  const file = event.target.files?.[0]
  // reset so picking the same file again still fires change
  event.target.value = ''
  if (file) emit('avatar-change', file)
}
</script>

<style scoped>
.sk-enter-active { transition: opacity 0.25s ease; }
.sk-leave-active { transition: opacity 0.25s ease; position: absolute; inset: 0; }
.sk-enter-from, .sk-leave-to { opacity: 0; }
</style>
