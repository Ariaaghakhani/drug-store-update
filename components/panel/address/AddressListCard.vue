<template>
  <UCard :ui="{ body: 'p-0' }">
    <div class="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-gray-100 dark:border-gray-800">
      <div class="flex items-center gap-2">
        <UIcon name="i-heroicons-map-pin" class="w-5 h-5 text-brand-500 flex-shrink-0" />
        <h2 class="text-base font-bold text-gray-900 dark:text-white">آدرس‌های من</h2>
      </div>
      <UButton color="primary" icon="i-heroicons-plus" size="lg" @click="emit('add')">
        افزودن آدرس
      </UButton>
    </div>

    <div class="p-4 sm:p-6">
      <div class="relative">
        <Transition name="sk">
          <!-- Skeleton -->
          <div v-if="loading" key="skeleton" class="space-y-3">
            <UCard v-for="i in 2" :key="i" :ui="{ body: 'p-0' }">
              <div class="flex items-center gap-3 px-4 sm:px-6 py-4 border-b border-gray-100 dark:border-gray-800">
                <USkeleton class="w-9 h-9 rounded-lg flex-shrink-0" />
                <USkeleton class="h-5 flex-1 max-w-[6rem]" />
                <USkeleton class="h-5 w-16 rounded-full" />
              </div>
              <div class="px-4 sm:px-6 py-4 space-y-2 border-b border-gray-100 dark:border-gray-800">
                <USkeleton class="h-4 w-40" />
                <USkeleton class="h-3 w-full" />
                <USkeleton class="h-3 w-2/3" />
              </div>
              <div class="flex items-center justify-between px-4 sm:px-6 py-3.5">
                <USkeleton class="h-7 w-36 rounded-lg" />
                <div class="flex gap-1.5">
                  <USkeleton class="h-8 w-8 rounded-lg" />
                  <USkeleton class="h-8 w-8 rounded-lg" />
                </div>
              </div>
            </UCard>
          </div>

          <!-- Empty state -->
          <div
            v-else-if="addresses.length === 0"
            key="empty"
            class="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl py-14 flex flex-col items-center gap-4 text-center"
          >
            <div class="w-16 h-16 rounded-full bg-brand-500/10 flex items-center justify-center">
              <UIcon name="i-heroicons-map-pin" class="w-8 h-8 text-brand-500" />
            </div>
            <div class="space-y-1">
              <p class="text-base font-bold text-gray-900 dark:text-white">آدرسی ثبت نشده است</p>
              <p class="text-sm text-gray-500 dark:text-gray-400">برای تکمیل سفارش‌هایتان یک آدرس اضافه کنید</p>
            </div>
            <UButton color="primary" icon="i-heroicons-plus" @click="emit('add')">افزودن اولین آدرس</UButton>
          </div>

          <!-- Address list -->
          <div v-else key="content" class="divide-y-2 divide-gray-100 dark:divide-gray-700">
            <AddressCard
              v-for="address in addresses"
              :key="address.id"
              :address="address"
              :deleting="deletingId === address.id"
              @edit="emit('edit', address)"
              @delete="emit('delete', address.id)"
              @set-default="emit('set-default', address.id)"
            />

            <div class="pt-4">
              <button
                class="w-full border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl py-5 flex items-center justify-center gap-2 text-gray-500 dark:text-gray-400 hover:border-brand-500/50 hover:text-brand-500 dark:hover:border-brand-400/50 dark:hover:text-brand-400 transition-colors"
                @click="emit('add')"
              >
                <UIcon name="i-heroicons-plus" class="w-5 h-5" />
                <span class="text-sm font-medium">افزودن آدرس جدید</span>
              </button>
            </div>
          </div>
        </Transition>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import AddressCard from '@/components/panel/address/AddressCard.vue'
import type { Address } from '@/components/panel/address/AddressCard.vue'

defineProps<{
  addresses: Address[]
  loading: boolean
  deletingId: number | null
}>()

const emit = defineEmits<{
  add: []
  edit: [address: Address]
  delete: [id: number]
  'set-default': [id: number]
}>()
</script>

<style scoped>
.sk-enter-active { transition: opacity 0.25s ease; }
.sk-leave-active { transition: opacity 0.25s ease; position: absolute; inset: 0; }
.sk-enter-from, .sk-leave-to { opacity: 0; }
</style>
