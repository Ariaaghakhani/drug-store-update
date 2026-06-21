<template>
  <div class="relative">
      <Transition name="sk">
        <div v-if="pending" key="sk">
          <div class="border-b border-gray-100 dark:border-gray-800 px-6 py-3 bg-gray-50 dark:bg-gray-800/50 flex gap-6">
            <USkeleton class="h-4 w-32 rounded" />
            <USkeleton class="h-4 w-20 rounded" />
            <USkeleton class="h-4 w-20 rounded" />
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
            <USkeleton class="h-4 w-24 rounded" />
            <USkeleton class="h-5 w-14 rounded-full" />
            <USkeleton class="h-8 w-8 rounded-lg" />
          </div>
        </div>

        <div v-else key="data">
          <div v-if="products.length > 0" class="overflow-x-auto">
            <table class="w-full">
              <thead>
                <tr class="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                  <th class="text-start text-xs font-medium text-gray-500 dark:text-gray-400 px-6 py-3">محصول</th>
                  <th class="text-start text-xs font-medium text-gray-500 dark:text-gray-400 px-6 py-3">دسته‌بندی</th>
                  <th class="text-start text-xs font-medium text-gray-500 dark:text-gray-400 px-6 py-3">قیمت</th>
                  <th class="text-start text-xs font-medium text-gray-500 dark:text-gray-400 px-6 py-3">موجودی</th>
                  <th class="text-start text-xs font-medium text-gray-500 dark:text-gray-400 px-6 py-3">وضعیت</th>
                  <th class="px-6 py-3" />
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="product in products"
                  :key="product.id"
                  class="border-b border-gray-100 dark:border-gray-800 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors"
                >
                  <td class="px-6 py-4">
                    <div class="flex items-center gap-3">
                      <div class="w-9 h-9 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0">
                        <UIcon name="i-heroicons-cube" class="w-5 h-5 text-gray-400 dark:text-gray-500" />
                      </div>
                      <div class="min-w-0">
                        <p class="text-sm font-medium text-gray-900 dark:text-white line-clamp-1">{{ product.nameFa }}</p>
                        <p v-if="product.brandTitle" class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{{ product.brandTitle }}</p>
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-4">
                    <span class="text-sm text-gray-600 dark:text-gray-400">{{ product.category ?? '—' }}</span>
                  </td>
                  <td class="px-6 py-4">
                    <span class="text-sm font-medium text-gray-900 dark:text-white tabular-nums">
                      {{ product.price.toLocaleString('fa-IR') }} تومان
                    </span>
                  </td>
                  <td class="px-6 py-4">
                    <UBadge :color="product.inStock ? 'success' : 'error'" variant="subtle" size="sm">
                      {{ product.inStock ? 'موجود' : 'ناموجود' }}
                    </UBadge>
                  </td>
                  <td class="px-6 py-4">
                    <div class="flex flex-wrap gap-1">
                      <UBadge v-if="product.isPrescriptionRequired" color="warning" variant="subtle" size="sm">
                        نسخه‌دار
                      </UBadge>
                      <UBadge v-if="isNearExpiry(product.expiryDate)" color="warning" variant="subtle" size="sm">
                        نزدیک به انقضا
                      </UBadge>
                      <UBadge v-if="product.discountPercent" color="error" variant="subtle" size="sm">
                        {{ product.discountPercent }}٪ تخفیف
                      </UBadge>
                      <span v-if="!product.isPrescriptionRequired && !isNearExpiry(product.expiryDate) && !product.discountPercent" class="text-xs text-gray-400 dark:text-gray-600">—</span>
                    </div>
                  </td>
                  <td class="px-6 py-4" @click.stop>
                    <UDropdownMenu
                      v-if="canUpdate || canDelete"
                      :items="[rowActions(product)]"
                      :ui="{ content: 'font-dana w-44' }"
                    >
                      <UButton
                        variant="ghost"
                        icon="i-heroicons-ellipsis-vertical"
                        size="xs"
                        color="neutral"
                        square
                      />
                    </UDropdownMenu>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div v-else class="flex flex-col items-center justify-center py-16 gap-3">
            <UIcon name="i-heroicons-cube" class="w-16 h-16 text-gray-300 dark:text-gray-700" />
            <p class="text-base font-bold text-gray-900 dark:text-white">محصولی یافت نشد</p>
            <p class="text-sm text-gray-500 dark:text-gray-400">فیلتر را تغییر دهید یا عبارت جستجو را بررسی کنید</p>
          </div>
        </div>
      </Transition>
    </div>
</template>

<script setup lang="ts">
import type { Product } from '@/types/panel-products'

const props = defineProps<{
  products: Product[]
  pending: boolean
  pageSize: number
  canUpdate: boolean
  canDelete: boolean
}>()

const emit = defineEmits<{
  edit: [product: Product]
  delete: [product: Product]
}>()

const isNearExpiry = (expiryDate?: string): boolean => {
  if (!expiryDate) return false
  const diff = new Date(expiryDate).getTime() - Date.now()
  return diff > 0 && diff <= 90 * 24 * 60 * 60 * 1000
}

const rowActions = (product: Product) => {
  const items: { label: string; icon: string; color?: string; onSelect: () => void }[] = []
  if (props.canUpdate) {
    items.push({
      label: 'ویرایش',
      icon: 'i-heroicons-pencil-square',
      onSelect: () => emit('edit', product),
    })
  }
  if (props.canDelete) {
    items.push({
      label: 'حذف',
      icon: 'i-heroicons-trash',
      color: 'error',
      onSelect: () => emit('delete', product),
    })
  }
  return items
}
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