<template>
  <UModal v-model:open="isOpen" :ui="{ content: 'sm:max-w-md p-0 gap-0 overflow-hidden' }">
    <template #content>
      <div class="flex flex-col font-dana" dir="rtl">
        <div class="flex items-center gap-3 px-5 py-4 border-b border-gray-100 dark:border-gray-800">
          <div class="w-8 h-8 rounded-lg bg-brand-500/15 flex items-center justify-center flex-shrink-0">
            <UIcon name="i-heroicons-device-phone-mobile" class="w-4 h-4 text-brand-500" />
          </div>
          <h3 class="flex-1 text-sm font-semibold text-gray-900 dark:text-white">
            {{ enabled ? 'مدیریت احراز هویت' : 'فعال‌سازی احراز هویت' }}
          </h3>
          <button
            class="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            @click="close"
          >
            <UIcon name="i-heroicons-x-mark" class="w-4 h-4" />
          </button>
        </div>

        <Transition name="step-forward" mode="out-in">
          <!-- Active: management view -->
          <div v-if="enabled" key="active" class="px-5 py-5 space-y-4">
            <div class="flex items-center gap-3 p-4 rounded-xl bg-gray-50 dark:bg-gray-800">
              <div class="w-9 h-9 rounded-lg bg-brand-500/15 flex items-center justify-center flex-shrink-0">
                <UIcon name="i-heroicons-device-phone-mobile" class="w-5 h-5 text-brand-500" />
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-gray-900 dark:text-white">Google Authenticator</p>
                <p class="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">متصل شد — ۳ روز پیش</p>
              </div>
              <UBadge color="success" variant="subtle" size="sm">فعال</UBadge>
            </div>
            <div class="flex items-start gap-3 p-3.5 rounded-xl bg-warning/10 border border-warning/20">
              <UIcon name="i-heroicons-exclamation-triangle" class="w-4 h-4 text-warning flex-shrink-0 mt-0.5" />
              <p class="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                غیرفعال کردن احراز هویت دو مرحله‌ای امنیت حساب شما را کاهش می‌دهد
              </p>
            </div>
            <div class="flex gap-3 pt-1">
              <UButton variant="soft" color="neutral" class="flex-1 justify-center" @click="close">بستن</UButton>
              <UButton variant="soft" color="error" class="flex-1 justify-center" @click="handleDeactivate">غیرفعال کردن</UButton>
            </div>
          </div>

          <!-- Inactive: activation view -->
          <div v-else key="inactive" class="px-5 py-5 space-y-4">
            <div class="flex justify-center">
              <div class="w-40 h-40 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl flex flex-col items-center justify-center gap-2">
                <UIcon name="i-heroicons-qr-code" class="w-14 h-14 text-gray-300 dark:text-gray-600" />
                <p class="text-[10px] text-gray-400 dark:text-gray-500">QR کد</p>
              </div>
            </div>
            <p class="text-center text-[11px] text-gray-500 dark:text-gray-400">یا کد زیر را به صورت دستی وارد کنید</p>
            <div class="text-center font-mono text-sm tracking-widest bg-gray-50 dark:bg-gray-800 rounded-lg py-2.5 px-4 text-gray-700 dark:text-gray-300 select-all">
              JBSW Y3DP EHPK 3PXP
            </div>
            <UInput
              v-model="otpCode"
              placeholder="کد ۶ رقمی اپلیکیشن"
              dir="ltr"
              inputmode="numeric"
              maxlength="6"
              size="md"
              class="w-full"
              :ui="{ base: 'text-center' }"
            />
            <div class="flex gap-3 pt-1">
              <UButton variant="soft" color="neutral" class="flex-1 justify-center" @click="close">انصراف</UButton>
              <UButton color="primary" class="flex-1 justify-center" :disabled="otpCode.length < 6" @click="handleActivate">
                تأیید و فعال‌سازی
              </UButton>
            </div>
          </div>
        </Transition>
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
const props = defineProps<{
  open: boolean
  enabled: boolean
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  activate: []
  deactivate: []
}>()

const isOpen = computed({
  get: () => props.open,
  set: (v) => emit('update:open', v),
})

const otpCode = ref('')

watch(() => props.open, (val) => { if (!val) setTimeout(() => { otpCode.value = '' }, 300) })

const close = () => { isOpen.value = false }

const handleActivate = () => {
  emit('activate')
  close()
}

const handleDeactivate = () => {
  emit('deactivate')
  close()
}
</script>

<style scoped>
.step-forward-enter-active { transition: opacity 0.2s ease, transform 0.2s ease; }
.step-forward-leave-active { transition: opacity 0.15s ease, transform 0.15s ease; }
.step-forward-enter-from { opacity: 0; transform: translateX(20px); }
.step-forward-leave-to   { opacity: 0; transform: translateX(-20px); }
</style>
