<!-- pages/panel/prescriptions/new.vue -->
<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between gap-3 flex-wrap">
      <h3 class="text-xl font-black text-gray-900 dark:text-white">
        ثبت <span class="text-brand-500">نسخه</span>
      </h3>
      <UButton to="/panel/prescriptions" color="neutral" variant="outline" icon="i-heroicons-arrow-right">
        بازگشت به نسخه‌ها
      </UButton>
    </div>

    <div class="relative">
      <Transition name="sk">
        <div v-if="loading" key="skeleton" class="space-y-4">
          <USkeleton class="h-40 w-full rounded-xl" />
          <USkeleton class="h-40 w-full rounded-xl" />
          <USkeleton class="h-24 w-3/4 rounded-xl" />
        </div>

        <PanelEmptyState
          v-else-if="error"
          key="error"
          variant="error"
          title="دریافت تنظیمات نسخه ناموفق بود"
        >
          <template #action>
            <UButton color="neutral" variant="soft" icon="i-heroicons-arrow-path" @click="load">
              تلاش دوباره
            </UButton>
          </template>
        </PanelEmptyState>

        <PanelEmptyState
          v-else-if="!options?.prescriptionEnabled"
          key="disabled"
          icon="i-heroicons-document-text"
          title="ثبت نسخه در این فروشگاه فعال نیست"
          text="این فروشگاه در حال حاضر نسخه نمی‌پذیرد"
        />

        <UCard v-else key="form">
          <PrescriptionForm :options="options" />
        </UCard>
      </Transition>
    </div>
  </div>
</template>

<script setup>
import PanelEmptyState from '@/components/panel/PanelEmptyState.vue'
import PrescriptionForm from '@/components/panel/prescriptions/PrescriptionForm.vue'

const app = useNuxtApp()

const loading = ref(true)
const error = ref(null)
const options = ref(null)

// Options decide the form: insurances (active only), the store courier and card-to-card switches
async function load() {
  loading.value = true
  error.value = null
  try {
    const response = await app.$api.prescription.getPrescriptionOptions()
    options.value = response.data.data ?? null
  } catch (err) {
    options.value = null
    error.value = err
  } finally {
    loading.value = false
  }
}

onMounted(load)

useHead({ title: 'ثبت نسخه | پنل کاربری' })
</script>

<style scoped>
.sk-enter-active { transition: opacity 0.25s ease; }
.sk-leave-active { transition: opacity 0.25s ease; position: absolute; inset: 0; }
.sk-enter-from, .sk-leave-to { opacity: 0; }
</style>
