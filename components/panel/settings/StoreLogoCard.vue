<!-- components/panel/settings/StoreLogoCard.vue -->
<template>
  <UCard :ui="{ body: 'p-0' }">
    <div class="flex items-center gap-2 px-4 sm:px-6 py-4 border-b border-gray-100 dark:border-gray-800">
      <UIcon name="i-heroicons-photo" class="w-4 h-4 text-brand-500 dark:text-brand-400" />
      <h2 class="text-sm font-medium text-gray-900 dark:text-white">لوگوی فروشگاه</h2>
    </div>

    <div class="relative p-4 sm:p-6">
      <Transition name="sk">
        <div v-if="loading" key="skeleton" class="space-y-4">
          <USkeleton class="h-40 w-full rounded-xl" />
          <USkeleton class="h-9 w-40 rounded-lg" />
        </div>

        <PanelEmptyState
          v-else-if="error"
          key="error"
          variant="error"
          title="دریافت لوگو ناموفق بود"
        >
          <template #action>
            <UButton color="neutral" variant="soft" icon="i-heroicons-arrow-path" @click="load">
              تلاش دوباره
            </UButton>
          </template>
        </PanelEmptyState>

        <div v-else key="content" class="space-y-4">
          <div class="flex h-40 items-center justify-center overflow-hidden rounded-xl border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50">
            <img v-if="logoUrl" :src="logoUrl" alt="لوگوی فروشگاه" class="max-h-full max-w-full object-contain p-4">
            <p v-else class="text-sm text-gray-500 dark:text-gray-400">لوگویی ثبت نشده است</p>
          </div>

          <p class="text-xs text-gray-500 dark:text-gray-400">
            فقط PNG یا JPEG تا ۱ مگابایت. در سربرگ گزارش‌ها و فاکتور استفاده می‌شود.
          </p>

          <div class="flex flex-wrap gap-2">
            <FilePickButton
              :label="logoUrl ? 'تغییر لوگو' : 'بارگذاری لوگو'"
              accept="image/png,image/jpeg"
              :loading="uploading"
              :disabled="deleting"
              @pick="onPick"
            />
            <UButton
              v-if="logoUrl"
              color="error"
              variant="outline"
              icon="i-heroicons-trash"
              :disabled="uploading || deleting"
              @click="confirmOpen = true"
            >
              حذف لوگو
            </UButton>
          </div>
        </div>
      </Transition>
    </div>

    <PanelConfirmDialog
      v-model:open="confirmOpen"
      title="حذف لوگو"
      message="لوگوی فروشگاه حذف شود؟ از سربرگ گزارش‌ها و فاکتور هم برداشته می‌شود."
      confirm-label="حذف"
      confirm-color="error"
      :loading="deleting"
      @confirm="removeLogo"
    />
  </UCard>
</template>

<script setup>
// Store logo for report and invoice letterheads. Self-contained: loads and writes through `$api.storeSettings`.
import FilePickButton from '@/components/panel/FilePickButton.vue'
import PanelConfirmDialog from '@/components/panel/PanelConfirmDialog.vue'
import PanelEmptyState from '@/components/panel/PanelEmptyState.vue'
import { apiErrorMessage } from '~/utils/apiError.js'

// BACK StoreLogoServiceImpl: PNG or JPEG, at most 1 MB
const ALLOWED_TYPES = ['image/png', 'image/jpeg']
const MAX_BYTES = 1024 * 1024

const app = useNuxtApp()
const toast = useAppToast()

const logoUrl = ref(null)
const loading = ref(true)
const error = ref(false)
const uploading = ref(false)
const deleting = ref(false)
const confirmOpen = ref(false)

const load = async () => {
  loading.value = true
  error.value = false
  try {
    const res = await app.$api.storeSettings.getStoreLogo()
    logoUrl.value = res.data.data?.url ?? null
  } catch {
    error.value = true
  } finally {
    loading.value = false
  }
}

// Checks type and size here so a bad file never reaches the server; BACK checks again
const onPick = async (file) => {
  if (!ALLOWED_TYPES.includes(file.type)) {
    toast.error('فقط فایل PNG یا JPEG انتخاب کنید')
    return
  }
  if (file.size > MAX_BYTES) {
    toast.error('حجم لوگو نباید بیشتر از ۱ مگابایت باشد')
    return
  }
  uploading.value = true
  try {
    const fd = new FormData()
    fd.append('file', file)
    const res = await app.$api.storeSettings.uploadStoreLogo({ data: fd })
    logoUrl.value = res.data.data?.url ?? null
    toast.success('لوگو ذخیره شد')
  } catch (e) {
    toast.error(apiErrorMessage(e, 'بارگذاری لوگو ناموفق بود'))
  } finally {
    uploading.value = false
  }
}

const removeLogo = async () => {
  deleting.value = true
  try {
    await app.$api.storeSettings.deleteStoreLogo()
    logoUrl.value = null
    confirmOpen.value = false
    toast.success('لوگو حذف شد')
  } catch (e) {
    toast.error(apiErrorMessage(e, 'حذف لوگو ناموفق بود'))
  } finally {
    deleting.value = false
  }
}

onMounted(load)
</script>

<style scoped>
.sk-enter-active { transition: opacity 0.25s ease; }
.sk-leave-active { transition: opacity 0.25s ease; position: absolute; inset: 0; }
.sk-enter-from, .sk-leave-to { opacity: 0; }
</style>
