<template>
  <div class="relative">
    <Transition name="sk">
      <div v-if="pending" key="sk">
        <div class="border-b border-gray-100 dark:border-gray-800 px-6 py-3 bg-gray-50 dark:bg-gray-800/50 flex gap-6">
          <USkeleton class="h-4 w-32 rounded" />
          <USkeleton class="h-4 w-20 rounded" />
          <USkeleton class="h-4 w-16 rounded" />
          <USkeleton class="h-4 w-16 rounded" />
          <USkeleton class="h-4 w-14 rounded" />
        </div>
        <div
          v-for="i in pageSize"
          :key="i"
          class="flex items-center gap-5 px-6 py-4 border-b border-gray-100 dark:border-gray-800 last:border-0"
        >
          <USkeleton class="w-9 h-9 rounded-lg flex-shrink-0" />
          <div class="flex-1 space-y-1.5">
            <USkeleton class="h-4 w-40 rounded" />
            <USkeleton class="h-3 w-24 rounded" />
          </div>
          <USkeleton class="h-4 w-20 rounded" />
          <USkeleton class="h-4 w-12 rounded" />
          <USkeleton class="h-5 w-14 rounded-full" />
          <USkeleton class="h-8 w-8 rounded-lg" />
        </div>
      </div>

      <div v-else key="data">
        <div v-if="rows.length > 0" class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                <th class="text-start text-xs font-medium text-gray-500 dark:text-gray-400 px-6 py-3">کالا</th>
                <th class="text-start text-xs font-medium text-gray-500 dark:text-gray-400 px-6 py-3">انبار</th>
                <th class="text-start text-xs font-medium text-gray-500 dark:text-gray-400 px-6 py-3">موجودی</th>
                <th class="text-start text-xs font-medium text-gray-500 dark:text-gray-400 px-6 py-3">رزرو</th>
                <th class="text-start text-xs font-medium text-gray-500 dark:text-gray-400 px-6 py-3">قابل فروش</th>
                <th class="text-start text-xs font-medium text-gray-500 dark:text-gray-400 px-6 py-3">وضعیت</th>
                <th class="text-start text-xs font-medium text-gray-500 dark:text-gray-400 px-6 py-3">آخرین شمارش</th>
                <th class="px-6 py-3" />
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="row in rows"
                :key="row.id"
                class="border-b border-gray-100 dark:border-gray-800 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors"
              >
                <td class="px-6 py-4">
                  <div class="flex items-center gap-3">
                    <div class="w-9 h-9 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0">
                      <UIcon name="i-heroicons-archive-box" class="w-5 h-5 text-gray-400 dark:text-gray-500" />
                    </div>
                    <div class="min-w-0">
                      <p class="text-sm font-medium text-gray-900 dark:text-white line-clamp-1">{{ row.goodsName ?? '—' }}</p>
                      <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        بچ: <span dir="ltr">{{ row.batchNumber ?? '—' }}</span>
                      </p>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4">
                  <span class="text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">{{ row.warehouseName ?? '—' }}</span>
                </td>
                <td class="px-6 py-4">
                  <span class="text-sm text-gray-900 dark:text-white tabular-nums">{{ formatQuantity(row.quantityOnHand) }}</span>
                </td>
                <td class="px-6 py-4">
                  <span class="text-sm text-gray-600 dark:text-gray-400 tabular-nums">{{ formatQuantity(row.quantityReserved) }}</span>
                </td>
                <td class="px-6 py-4">
                  <span class="text-sm font-bold text-gray-900 dark:text-white tabular-nums">{{ formatQuantity(row.availableQuantity) }}</span>
                </td>
                <td class="px-6 py-4">
                  <UBadge :color="stockStatusMeta(row).color" variant="subtle" size="sm" class="whitespace-nowrap">
                    {{ stockStatusMeta(row).label }}
                  </UBadge>
                </td>
                <td class="px-6 py-4">
                  <span class="text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">{{ formatDate(row.lastCounted) }}</span>
                </td>
                <td class="px-6 py-4">
                  <UDropdownMenu
                    v-if="canAct"
                    :items="[rowActions(row)]"
                    :ui="{ content: 'font-dana w-44' }"
                  >
                    <UButton
                      variant="ghost"
                      icon="i-heroicons-ellipsis-vertical"
                      size="xs"
                      color="neutral"
                      square
                      aria-label="عملیات موجودی"
                    />
                  </UDropdownMenu>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <slot v-else name="empty" />
      </div>
    </Transition>
  </div>
</template>

<script setup>
const props = defineProps({
  rows: { type: Array, required: true },
  pending: { type: Boolean, required: true },
  pageSize: { type: Number, required: true },
  canAct: { type: Boolean, required: true },
  canTransfer: { type: Boolean, required: true },
})

const emit = defineEmits(['adjust', 'transfer'])

const formatQuantity = (value) => (value == null ? '—' : value.toLocaleString('fa-IR'))

const formatDate = (value) => {
  if (!value) return '—'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleDateString('fa-IR')
}

const rowActions = (row) => [
  {
    label: 'تعدیل موجودی',
    icon: 'i-heroicons-adjustments-horizontal',
    onSelect: () => emit('adjust', row),
  },
  {
    label: 'انتقال به انبار دیگر',
    icon: 'i-heroicons-arrows-right-left',
    disabled: !props.canTransfer || (row.availableQuantity ?? 0) <= 0,
    onSelect: () => emit('transfer', row),
  },
]
</script>

<style scoped>
.sk-enter-active,
.sk-leave-active {
  transition: opacity 0.2s ease;
}
.sk-enter-from,
.sk-leave-to {
  opacity: 0;
}
.sk-leave-active {
  position: absolute;
  inset: 0;
}
</style>
