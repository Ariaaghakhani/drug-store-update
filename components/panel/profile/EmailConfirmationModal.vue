<template>
  <UModal v-model:open="isOpen" :ui="{ content: 'sm:max-w-md p-0 gap-0 overflow-hidden' }">
    <template #content>
      <div class="flex flex-col font-dana" dir="rtl">
        <div class="flex items-center gap-3 px-5 py-4 border-b border-gray-100 dark:border-gray-800">
          <div class="w-8 h-8 rounded-lg bg-brand-500/15 flex items-center justify-center flex-shrink-0">
            <UIcon name="i-heroicons-envelope" class="w-4 h-4 text-brand-500" />
          </div>
          <h3 class="flex-1 text-sm font-semibold text-gray-900 dark:text-white">تأیید آدرس ایمیل</h3>
          <button
            class="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            @click="close"
          >
            <UIcon name="i-heroicons-x-mark" class="w-4 h-4" />
          </button>
        </div>

        <Transition name="step-forward" mode="out-in">
          <!-- Step 1: enter the email, BACK sends a code -->
          <div v-if="step === 'email'" key="email" class="px-5 py-5 space-y-4">
            <p class="text-xs text-gray-500 dark:text-gray-400 text-center leading-relaxed">
              یک کد تأیید به آدرس زیر ارسال می‌شود
            </p>
            <UInput v-model="localEmail" dir="ltr" placeholder="example@email.com" size="md" class="w-full" />
            <div class="flex gap-3 pt-1">
              <UButton variant="soft" color="neutral" class="flex-1 justify-center" @click="close">انصراف</UButton>
              <UButton
                color="primary"
                class="flex-1 justify-center"
                icon="i-heroicons-paper-airplane"
                :loading="sending"
                :disabled="!localEmail"
                @click="sendCode"
              >
                ارسال کد تأیید
              </UButton>
            </div>
          </div>

          <!-- Step 2: enter the code -->
          <div v-else-if="step === 'code'" key="code" class="px-5 py-5 space-y-4">
            <p class="text-xs text-gray-500 dark:text-gray-400 text-center leading-relaxed">
              کد ارسال‌شده به
              <span class="font-mono" dir="ltr">{{ localEmail }}</span>
              را وارد کنید
            </p>
            <UInput
              v-model="otpCode"
              dir="ltr"
              inputmode="numeric"
              placeholder="- - - - -"
              size="md"
              class="w-full"
              :color="error ? 'error' : undefined"
              @keyup.enter="verifyCode"
            />
            <p v-if="error" class="text-xs text-error text-center">{{ error }}</p>
            <div class="flex gap-3 pt-1">
              <UButton variant="soft" color="neutral" class="flex-1 justify-center" @click="step = 'email'">ویرایش ایمیل</UButton>
              <UButton
                color="primary"
                class="flex-1 justify-center"
                :loading="verifying"
                :disabled="!otpCode"
                @click="verifyCode"
              >
                تأیید
              </UButton>
            </div>
          </div>

          <!-- Step 3: done -->
          <div v-else key="done" class="px-5 py-5 space-y-4 text-center">
            <div class="flex justify-center">
              <div class="w-16 h-16 rounded-full bg-success/15 flex items-center justify-center pop-in">
                <UIcon name="i-heroicons-check" class="w-8 h-8 text-success" />
              </div>
            </div>
            <div class="space-y-1.5">
              <h3 class="text-base font-semibold text-gray-900 dark:text-white">ایمیل تأیید شد</h3>
              <p class="text-xs text-gray-400 leading-relaxed">
                <span class="font-mono" dir="ltr">{{ localEmail }}</span>
                به حساب شما اضافه شد
              </p>
            </div>
            <UButton color="primary" block @click="close">متوجه شدم</UButton>
          </div>
        </Transition>
      </div>
    </template>
  </UModal>
</template>

<script setup>
const props = defineProps({
  open: Boolean,
  email: String,
})

const emit = defineEmits(['update:open', 'saved'])

const app = useNuxtApp()
const toast = useAppToast()

const isOpen = computed({
  get: () => props.open,
  set: (v) => emit('update:open', v),
})

const localEmail = ref(props.email ?? '')
const otpCode = ref('')
const step = ref('email') // 'email' | 'code' | 'done'
const sending = ref(false)
const verifying = ref(false)
const error = ref('')

watch(
  () => props.open,
  (val) => {
    if (val) {
      localEmail.value = props.email ?? ''
      otpCode.value = ''
      error.value = ''
      step.value = 'email'
    }
  }
)

// POST api/auth/me/email/send-otp {email}
const sendCode = async () => {
  sending.value = true
  try {
    await app.$api.auth.sendEmailOtp({ data: { email: localEmail.value.trim() } })
    otpCode.value = ''
    error.value = ''
    step.value = 'code'
  } catch (err) {
    toast.error('ارسال کد ناموفق بود', err?.response?.data?.message)
  } finally {
    sending.value = false
  }
}

// POST api/auth/me/email/verify-otp {email, otpCode}
const verifyCode = async () => {
  verifying.value = true
  error.value = ''
  try {
    await app.$api.auth.verifyEmailOtp({
      data: { email: localEmail.value.trim(), otpCode: otpCode.value.trim() },
    })
    step.value = 'done'
  } catch (err) {
    error.value = err?.response?.data?.message || 'کد وارد شده نادرست است'
  } finally {
    verifying.value = false
  }
}

const close = () => {
  if (step.value === 'done') emit('saved', localEmail.value.trim())
  isOpen.value = false
}
</script>

<style scoped>
.step-forward-enter-active { transition: opacity 0.2s ease, transform 0.2s ease; }
.step-forward-leave-active { transition: opacity 0.15s ease, transform 0.15s ease; }
.step-forward-enter-from { opacity: 0; transform: translateX(20px); }
.step-forward-leave-to   { opacity: 0; transform: translateX(-20px); }

@keyframes pop-in {
  0%   { transform: scale(0.5); opacity: 0; }
  70%  { transform: scale(1.1); }
  100% { transform: scale(1);   opacity: 1; }
}
.pop-in { animation: pop-in 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
</style>
