<template>
  <UModal v-model:open="isOpen" :ui="{ content: 'sm:max-w-md p-0 gap-0 overflow-hidden' }" :dismissible="false">
    <template #content>
      <div class="flex flex-col font-dana relative" dir="rtl">
        <div class="flex items-center gap-3 px-5 py-4 border-b border-gray-100 dark:border-gray-800 flex-shrink-0">
          <div class="w-8 h-8 rounded-lg bg-brand-500/15 flex items-center justify-center flex-shrink-0">
            <UIcon name="i-heroicons-device-phone-mobile" class="w-4 h-4 text-brand-500" />
          </div>
          <h3 class="flex-1 text-sm font-semibold text-gray-900 dark:text-white">تغییر شماره موبایل</h3>
          <button
            class="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            @click="requestCancel"
          >
            <UIcon name="i-heroicons-x-mark" class="w-4 h-4" />
          </button>
        </div>

        <Transition name="overlay-fade" mode="out-in">
          <div v-if="showCancelConfirm" key="cancel" class="px-6 py-8 flex flex-col items-center gap-4">
            <div class="w-12 h-12 rounded-full bg-warning/10 flex items-center justify-center">
              <UIcon name="i-heroicons-exclamation-triangle" class="w-6 h-6 text-warning" />
            </div>
            <div class="text-center space-y-1">
              <h3 class="text-base font-bold text-gray-900 dark:text-white">لغو تغییر شماره؟</h3>
              <p class="text-sm text-gray-500 dark:text-gray-400">اگر الان خارج شوید، پیشرفت شما ذخیره نمی‌شود</p>
            </div>
            <div class="flex gap-3 w-full pt-1">
              <UButton color="neutral" variant="soft" class="flex-1 justify-center" @click="showCancelConfirm = false">ادامه تغییر</UButton>
              <UButton color="error" variant="soft" class="flex-1 justify-center" @click="close">لغو و بستن</UButton>
            </div>
          </div>

          <div v-else key="steps">
            <div class="flex gap-1.5 px-5 pt-5 pb-1">
              <span
                v-for="i in 4"
                :key="i"
                :class="['h-0.5 flex-1 rounded-full transition-colors duration-300', step >= i ? 'bg-brand-500' : 'bg-gray-200 dark:bg-gray-700']"
              />
            </div>

            <div class="relative overflow-hidden">
              <Transition :name="stepTransition" mode="out-in">
                <div :key="step" class="px-5 py-6 flex flex-col gap-4">

                  <template v-if="step === 1">
                    <div class="w-12 h-12 rounded-full bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-500 mx-auto">
                      <UIcon name="i-heroicons-device-phone-mobile" class="w-6 h-6" />
                    </div>
                    <div class="text-center space-y-1">
                      <h3 class="text-base font-semibold text-gray-900 dark:text-white">تأیید شماره فعلی</h3>
                      <p class="text-xs text-gray-400 leading-relaxed">کد تأیید به شماره فعلی شما ارسال می‌شود</p>
                    </div>
                    <UInput model-value="۰۹۱۲***۶۷۸۹" readonly dir="ltr" size="md" class="w-full" :ui="{ base: 'text-center' }" />
                    <div class="flex gap-3">
                      <UButton variant="soft" color="neutral" class="flex-1 justify-center" @click="requestCancel">انصراف</UButton>
                      <UButton color="primary" class="flex-1 justify-center" @click="advance">ارسال کد تأیید</UButton>
                    </div>
                  </template>

                  <template v-else-if="step === 2">
                    <div class="text-center space-y-1">
                      <h3 class="text-base font-semibold text-gray-900 dark:text-white">کد تأیید</h3>
                      <p class="text-xs text-gray-400 leading-relaxed">کد ارسال شده به ۰۹۱۲***۶۷۸۹ را وارد کنید</p>
                    </div>
                    <div class="flex justify-center gap-2" dir="ltr">
                      <input
                        v-for="(_, idx) in oldOtp"
                        :key="idx"
                        :ref="(el) => { oldOtpRefs[idx] = el as HTMLInputElement }"
                        :value="oldOtp[idx]"
                        type="text"
                        inputmode="numeric"
                        maxlength="1"
                        class="w-12 h-14 text-center text-xl font-semibold border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-colors"
                        @input="handleOldOtpInput(idx, $event)"
                        @keydown="handleOldOtpKeydown(idx, $event)"
                      />
                    </div>
                    <p class="text-center text-sm">
                      <button
                        :disabled="resendCountdown > 0"
                        :class="['font-medium transition-colors', resendCountdown > 0 ? 'text-gray-400 dark:text-gray-500 cursor-not-allowed' : 'text-brand-500 hover:text-brand-600 dark:hover:text-brand-400']"
                        @click="resendCountdown === 0 && startResend()"
                      >
                        {{ resendCountdown > 0 ? `ارسال مجدد (${resendCountdown.toLocaleString('fa-IR')})` : 'ارسال مجدد' }}
                      </button>
                    </p>
                    <div class="flex gap-3">
                      <UButton variant="soft" color="neutral" class="flex-1 justify-center" @click="retreat">بازگشت</UButton>
                      <UButton color="primary" class="flex-1 justify-center" @click="advance">تأیید و ادامه</UButton>
                    </div>
                  </template>

                  <template v-else-if="step === 3">
                    <div class="w-12 h-12 rounded-full bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-500 mx-auto">
                      <UIcon name="i-heroicons-device-phone-mobile" class="w-6 h-6" />
                    </div>
                    <div class="text-center space-y-1">
                      <h3 class="text-base font-semibold text-gray-900 dark:text-white">شماره جدید</h3>
                      <p class="text-xs text-gray-400 leading-relaxed">شماره موبایل جدید خود را وارد کنید</p>
                    </div>
                    <UInput v-model="newPhone" dir="ltr" placeholder="09xxxxxxxxx" maxlength="11" size="md" class="w-full" :ui="{ base: 'text-center' }" />
                    <div class="flex gap-3">
                      <UButton variant="soft" color="neutral" class="flex-1 justify-center" @click="retreat">بازگشت</UButton>
                      <UButton color="primary" class="flex-1 justify-center" :disabled="newPhone.length < 11" @click="advance">ارسال کد تأیید</UButton>
                    </div>
                  </template>

                  <template v-else-if="step === 4">
                    <div class="text-center space-y-1">
                      <h3 class="text-base font-semibold text-gray-900 dark:text-white">تأیید شماره جدید</h3>
                      <p class="text-xs text-gray-400 leading-relaxed">کد ارسال شده به {{ newPhone }} را وارد کنید</p>
                    </div>
                    <div class="flex justify-center gap-2" dir="ltr">
                      <input
                        v-for="(_, idx) in newOtp"
                        :key="idx"
                        :ref="(el) => { newOtpRefs[idx] = el as HTMLInputElement }"
                        :value="newOtp[idx]"
                        type="text"
                        inputmode="numeric"
                        maxlength="1"
                        class="w-12 h-14 text-center text-xl font-semibold border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-colors"
                        @input="handleNewOtpInput(idx, $event)"
                        @keydown="handleNewOtpKeydown(idx, $event)"
                      />
                    </div>
                    <p class="text-center text-sm">
                      <button
                        :disabled="resendCountdown > 0"
                        :class="['font-medium transition-colors', resendCountdown > 0 ? 'text-gray-400 dark:text-gray-500 cursor-not-allowed' : 'text-brand-500 hover:text-brand-600 dark:hover:text-brand-400']"
                        @click="resendCountdown === 0 && startResend()"
                      >
                        {{ resendCountdown > 0 ? `ارسال مجدد (${resendCountdown.toLocaleString('fa-IR')})` : 'ارسال مجدد' }}
                      </button>
                    </p>
                    <div class="flex gap-3">
                      <UButton variant="soft" color="neutral" class="flex-1 justify-center" @click="retreat">بازگشت</UButton>
                      <UButton color="primary" class="flex-1 justify-center" @click="advance">تأیید و ذخیره</UButton>
                    </div>
                  </template>

                  <template v-else-if="step === 5">
                    <div class="text-center space-y-5 py-2">
                      <div class="flex justify-center">
                        <div class="w-16 h-16 rounded-full bg-success/15 flex items-center justify-center pop-in">
                          <UIcon name="i-heroicons-check" class="w-8 h-8 text-success" />
                        </div>
                      </div>
                      <div class="space-y-1.5">
                        <h3 class="text-base font-semibold text-gray-900 dark:text-white">شماره تغییر کرد</h3>
                        <p class="text-xs text-gray-400 leading-relaxed">شماره موبایل شما با موفقیت به‌روزرسانی شد</p>
                      </div>
                      <UButton color="primary" block @click="close">متوجه شدم</UButton>
                    </div>
                  </template>

                </div>
              </Transition>
            </div>
          </div>
        </Transition>
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
const props = defineProps<{ open: boolean }>()
const emit = defineEmits<{
  'update:open': [value: boolean]
  saved: []
}>()

const isOpen = computed({
  get: () => props.open,
  set: (v) => emit('update:open', v),
})

const step = ref(1)
const stepTransition = ref('step-forward')
const showCancelConfirm = ref(false)
const newPhone = ref('')
const oldOtp = ref(['', '', '', '', ''])
const newOtp = ref(['', '', '', '', ''])
const oldOtpRefs: HTMLInputElement[] = []
const newOtpRefs: HTMLInputElement[] = []
const resendCountdown = ref(0)
let resendTimer: ReturnType<typeof setInterval> | null = null

const startResend = () => {
  resendCountdown.value = 60
  if (resendTimer) clearInterval(resendTimer)
  resendTimer = setInterval(() => {
    if (resendCountdown.value > 0) resendCountdown.value--
    else if (resendTimer) clearInterval(resendTimer)
  }, 1000)
}

const advance = () => {
  stepTransition.value = 'step-forward'
  const next = step.value + 1
  if (next === 2 || next === 4) startResend()
  step.value = next
}

const retreat = () => {
  stepTransition.value = 'step-backward'
  step.value--
}

const requestCancel = () => {
  if (step.value === 5) close()
  else showCancelConfirm.value = true
}

const close = () => {
  isOpen.value = false
  showCancelConfirm.value = false
  setTimeout(() => {
    step.value = 1
    stepTransition.value = 'step-forward'
    newPhone.value = ''
    oldOtp.value = ['', '', '', '', '']
    newOtp.value = ['', '', '', '', '']
    if (resendTimer) clearInterval(resendTimer)
    resendCountdown.value = 0
  }, 300)
}

const handleOldOtpInput = (idx: number, event: Event) => {
  const val = (event.target as HTMLInputElement).value.replace(/\D/g, '').slice(-1)
  oldOtp.value[idx] = val
  if (val && idx < 4) nextTick(() => oldOtpRefs[idx + 1]?.focus())
}
const handleOldOtpKeydown = (idx: number, event: KeyboardEvent) => {
  if (event.key === 'Backspace' && !oldOtp.value[idx] && idx > 0)
    nextTick(() => oldOtpRefs[idx - 1]?.focus())
}
const handleNewOtpInput = (idx: number, event: Event) => {
  const val = (event.target as HTMLInputElement).value.replace(/\D/g, '').slice(-1)
  newOtp.value[idx] = val
  if (val && idx < 4) nextTick(() => newOtpRefs[idx + 1]?.focus())
}
const handleNewOtpKeydown = (idx: number, event: KeyboardEvent) => {
  if (event.key === 'Backspace' && !newOtp.value[idx] && idx > 0)
    nextTick(() => newOtpRefs[idx - 1]?.focus())
}

onUnmounted(() => { if (resendTimer) clearInterval(resendTimer) })
</script>

<style scoped>
.step-forward-enter-active { transition: opacity 0.2s ease, transform 0.2s ease; }
.step-forward-leave-active { transition: opacity 0.15s ease, transform 0.15s ease; }
.step-forward-enter-from { opacity: 0; transform: translateX(20px); }
.step-forward-leave-to   { opacity: 0; transform: translateX(-20px); }

.step-backward-enter-active { transition: opacity 0.2s ease, transform 0.2s ease; }
.step-backward-leave-active { transition: opacity 0.15s ease, transform 0.15s ease; }
.step-backward-enter-from { opacity: 0; transform: translateX(-20px); }
.step-backward-leave-to   { opacity: 0; transform: translateX(20px); }

.overlay-fade-enter-active,
.overlay-fade-leave-active { transition: opacity 0.2s ease; }
.overlay-fade-enter-from,
.overlay-fade-leave-to { opacity: 0; }

@keyframes pop-in {
  0%   { transform: scale(0.5); opacity: 0; }
  70%  { transform: scale(1.1); }
  100% { transform: scale(1);   opacity: 1; }
}
.pop-in { animation: pop-in 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
</style>
