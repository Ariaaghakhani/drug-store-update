<!-- components/panel/ImportResultSummary.vue -->
<template>
  <div class="space-y-4">
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <div
        v-for="count in counts"
        :key="count.label"
        class="rounded-xl border border-gray-100 dark:border-gray-800 px-3 py-3 text-center"
      >
        <p class="text-xs text-gray-500 dark:text-gray-400">{{ count.label }}</p>
        <p class="mt-1 text-xl font-black" :class="toneClass(count.color)">
          {{ Number(count.value ?? 0).toLocaleString('fa-IR') }}
        </p>
      </div>
    </div>

    <div v-if="errors.length" class="space-y-2">
      <p class="text-sm font-medium text-error">ردیف‌های ناموفق ({{ errors.length.toLocaleString('fa-IR') }})</p>
      <div class="max-h-64 overflow-auto rounded-xl border border-gray-100 dark:border-gray-800">
        <table class="w-full">
          <thead class="sticky top-0 bg-gray-50 dark:bg-gray-800">
            <tr class="border-b border-gray-100 dark:border-gray-800">
              <th
                v-for="column in columns"
                :key="column.key"
                class="text-start text-xs font-medium text-gray-500 dark:text-gray-400 px-4 py-2"
              >
                {{ column.label }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(row, index) in errors"
              :key="index"
              class="border-b border-gray-100 dark:border-gray-800 last:border-b-0"
            >
              <td
                v-for="column in columns"
                :key="column.key"
                class="px-4 py-2 text-sm text-gray-700 dark:text-gray-300"
                :dir="column.ltr ? 'ltr' : undefined"
                :class="column.ltr ? 'font-mono text-start' : ''"
              >
                {{ row[column.key] ?? '—' }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
// Result of a bulk import: count tiles + a scrollable table of the rows that failed.
// `counts` = [{label, value, color}], `errors` = rows as the backend sends them, `columns` = [{key, label, ltr?}] (ltr for codes/phones).
defineProps({
  counts: { type: Array, default: () => [] },
  errors: { type: Array, default: () => [] },
  columns: { type: Array, required: true },
})

// Nuxt UI color tokens to text classes (dynamic class strings would not survive Tailwind's scan)
const TONE_CLASSES = {
  neutral: 'text-gray-900 dark:text-white',
  primary: 'text-brand-500 dark:text-brand-400',
  success: 'text-success',
  info: 'text-info',
  warning: 'text-warning',
  error: 'text-error',
}

const toneClass = (color) => TONE_CLASSES[color] ?? TONE_CLASSES.neutral
</script>
