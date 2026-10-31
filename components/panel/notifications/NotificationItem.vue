<template>
  <button
    type="button"
    class="w-full flex items-start gap-3 text-start transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50"
    :class="compact ? 'px-4 py-3' : 'px-4 py-4 rounded-xl border border-gray-100 dark:border-gray-800'"
    @click="emit('select', notification)"
  >
    <div
      class="rounded-xl flex items-center justify-center flex-shrink-0"
      :class="[meta.tile, compact ? 'w-9 h-9' : 'w-11 h-11']"
    >
      <UIcon :name="meta.icon" class="w-5 h-5" />
    </div>
    <div class="flex-1 min-w-0">
      <div class="flex items-center gap-2">
        <p
          class="text-sm truncate"
          :class="unread ? 'font-semibold text-gray-900 dark:text-white' : 'font-medium text-gray-600 dark:text-gray-300'"
        >
          {{ notification.title }}
        </p>
        <span v-if="unread" class="w-2 h-2 rounded-full bg-brand-500 dark:bg-brand-400 flex-shrink-0" />
      </div>
      <p
        v-if="notification.body"
        class="text-xs text-gray-500 dark:text-gray-400 mt-0.5 whitespace-pre-line"
        :class="{ 'line-clamp-2': compact }"
      >
        {{ notification.body }}
      </p>
      <p class="text-xs text-gray-400 dark:text-gray-500 mt-1">
        {{ notificationTime(notification.createdAt) }}
      </p>
    </div>
  </button>
</template>

<script setup>
const props = defineProps({
  notification: { type: Object, required: true },
  // bell popover row (smaller tile, clamped body, no border)
  compact: Boolean,
})

const emit = defineEmits(['select'])

const meta = computed(() => notificationTypeMeta(props.notification.type))
const unread = computed(() => !props.notification.readAt)
</script>
