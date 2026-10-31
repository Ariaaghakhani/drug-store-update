<template>
  <div class="flex items-center gap-3 flex-shrink-0">
    <div
      class="flex items-center justify-center flex-shrink-0"
      :style="{ width: `${size}px`, height: `${size}px` }"
    >
      <svg
        :width="size"
        :height="size"
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label="کپسول"
      >
        <circle cx="16" cy="16" r="16" :fill="isDark ? '#14B8A6' : '#2C7A7B'" />
        <g transform="rotate(-45 16 16)">
          <rect x="6" y="11.25" width="20" height="9.5" rx="4.75" fill="white" />
          <path
            d="M16 11.25H21.25A4.75 4.75 0 0 1 21.25 20.75H16Z"
            fill="#9EDEDE"
          />
        </g>
      </svg>
    </div>
    <span
      v-if="showName"
      class="font-black"
      :class="[textClass, isDark ? 'text-brand-400' : 'text-brand-500 dark:text-brand-400']"
    >
      کپسول
    </span>
  </div>
</template>

<script setup>
const props = defineProps({
  size: { type: Number, default: 40 },
  showName: { type: Boolean, default: true },
  textClass: { type: String, default: 'text-xl' },
  // Force the dark palette regardless of color mode (e.g. the always-dark footer)
  forceDark: { type: Boolean, default: false },
})

const colorMode = useColorMode()
const isDark = computed(() => props.forceDark || colorMode.value === 'dark')
</script>
