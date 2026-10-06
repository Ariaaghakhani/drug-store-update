<template>
  <UModal v-model:open="isOpen" :ui="{ content: 'sm:max-w-md p-0 gap-0 overflow-hidden' }" :dismissible="false">
    <template #content>
      <div class="flex flex-col font-dana" dir="rtl">
        <div class="flex items-center px-5 py-4 border-b border-gray-100 dark:border-gray-800 flex-shrink-0">
          <div class="w-8 h-8 rounded-lg bg-brand-500/15 flex items-center justify-center flex-shrink-0">
            <UIcon name="i-heroicons-lock-closed" class="w-4 h-4 text-brand-500" />
          </div>
          <h3 class="flex-1 text-sm font-semibold text-gray-900 dark:text-white ms-3">تغییر رمز عبور</h3>
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
              <h3 class="text-base font-bold text-gray-900 dark:text-white">لغو تغییر رمز عبور؟</h3>
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
                v-for="i in 2"
                :key="i"
                :class="['h-0.5 flex-1 rounded-full transition-colors duration-300', step >= i ? 'bg-brand-500' : 'bg-gray-200 dark:bg-gray-700']"
              />
            </div>

            <div class="overflow-hidden">
              <Transition name="step-forward" mode="out-in">
                <div :key="step" class="px-5 py-6 flex flex-col gap-4">

                  <template v-if="step === 1">
                    <div class="w-12 h-12 rounded-full bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-500 mx-auto">
                      <UIcon name="i-heroicons-lock-closed" class="w-6 h-6" />
                    </div>
                    <div class="text-center space-y-1">
                      <h3 class="text-base font-semibold text-gray-900 dark:text-white">تغییر رمز عبور</h3>
                      <p class="text-xs text-gray-400 leading-relaxed">رمز عبور فعلی و رمز عبور جدید خود را وارد کنید</p>
                    </div>
                    <div class="space-y-2">
                      <div class="space-y-1">
                        <UInput
                          v-model="currentPassword"
                          type="password"
                          placeholder="رمز عبور فعلی"
                          size="md"
                          class="w-full"
                          :color="currentPasswordError ? 'error' : 'neutral'"
                        />
                        <p v-if="currentPasswordError" class="text-[11px] font-medium text-error">{{ currentPasswordError }}</p>
                      </div>
                      <UInput v-model="newPassword" type="password" placeholder="رمز عبور جدید" size="md" class="w-full" />
                      <Transition name="strength-bar">
                        <div v-if="newPassword" class="space-y-1">
                          <div class="flex gap-1">
                            <div
                              v-for="i in 4"
                              :key="i"
                              :class="['h-1 flex-1 rounded-full transition-all duration-300', i <= passwordStrength ? strengthColor : 'bg-gray-200 dark:bg-gray-700']"
                            />
                          </div>
                          <p :class="['text-[11px] font-medium', strengthTextColor]">{{ strengthLabel }}</p>
                        </div>
                      </Transition>
                      <UInput v-model="confirmPassword" type="password" placeholder="تکرار رمز عبور جدید" size="md" class="w-full" />
                      <p v-if="formError" class="text-[11px] font-medium text-error">{{ formError }}</p>
                    </div>
                    <div class="flex flex-col gap-2">
                      <UButton color="primary" size="lg" block :loading="isSubmitting" :disabled="!canSubmit" @click="submitPassword">ذخیره رمز عبور</UButton>
                      <UButton variant="soft" color="neutral" size="lg" block @click="requestCancel">انصراف</UButton>
                    </div>
                  </template>

                  <template v-else-if="step === 2">
                    <div class="text-center space-y-5 py-2">
                      <div class="flex justify-center">
                        <div class="w-16 h-16 rounded-full bg-success/15 flex items-center justify-center pop-in">
                          <UIcon name="i-heroicons-check" class="w-8 h-8 text-success" />
                        </div>
                      </div>
                      <div class="space-y-1.5">
                        <h3 class="text-base font-semibold text-gray-900 dark:text-white">رمز عبور تغییر کرد</h3>
                        <p class="text-xs text-gray-400 leading-relaxed">از تمام دستگاه‌های دیگر خارج شدید</p>
                      </div>
                      <UButton color="primary" size="lg" block @click="close">متوجه شدم</UButton>
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

<script setup>
const props = defineProps({ open: Boolean })
const emit = defineEmits(['update:open', 'saved'])

const app = useNuxtApp()

const isOpen = computed({
  get: () => props.open,
  set: (v) => emit('update:open', v),
})

const step = ref(1)
const showCancelConfirm = ref(false)
const currentPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const isSubmitting = ref(false)
const currentPasswordError = ref('')
const formError = ref('')

const passwordStrength = computed(() => {
  const p = newPassword.value
  if (!p) return 0
  let s = 0
  if (p.length >= 8) s++
  if (/[A-Z]/.test(p)) s++
  if (/[0-9]/.test(p)) s++
  if (/[^A-Za-z0-9]/.test(p)) s++
  return s
})

const strengthLabel = computed(() => ['', 'ضعیف', 'متوسط', 'خوب', 'قوی'][passwordStrength.value])
const strengthColor = computed(() => ['', 'bg-red-500', 'bg-orange-400', 'bg-yellow-400', 'bg-green-500'][passwordStrength.value])
const strengthTextColor = computed(() => ['', 'text-red-500', 'text-orange-400', 'text-yellow-500', 'text-green-500'][passwordStrength.value])

const canSubmit = computed(() =>
  Boolean(currentPassword.value && newPassword.value && confirmPassword.value) && !isSubmitting.value
)

const submitPassword = async () => {
  currentPasswordError.value = ''
  formError.value = ''

  if (newPassword.value !== confirmPassword.value) {
    formError.value = 'رمز عبور جدید و تکرار آن یکسان نیستند'
    return
  }

  isSubmitting.value = true
  try {
    const response = await app.$api.auth.changePassword({
      data: {
        currentPassword: currentPassword.value,
        newPassword: newPassword.value,
      },
    })
    const data = response.data.data
    app.$auth.setToken(data.accessToken)
    app.$auth.setUser(data.user)
    step.value = 2
  } catch (error) {
    const errorCode = error?.response?.data?.errorCode
    const message = error?.response?.data?.message
    if (errorCode === 'password.current.wrong') {
      currentPasswordError.value = message || 'رمز عبور فعلی اشتباه است'
    } else {
      formError.value = message || 'خطا در تغییر رمز عبور. لطفا دوباره تلاش کنید'
    }
  } finally {
    isSubmitting.value = false
  }
}

const requestCancel = () => {
  if (step.value === 2) close()
  else showCancelConfirm.value = true
}

const close = () => {
  if (step.value === 2) emit('saved')
  isOpen.value = false
  showCancelConfirm.value = false
  setTimeout(() => {
    step.value = 1
    currentPassword.value = ''
    newPassword.value = ''
    confirmPassword.value = ''
    currentPasswordError.value = ''
    formError.value = ''
  }, 300)
}
</script>

<style scoped>
.step-forward-enter-active { transition: opacity 0.2s ease, transform 0.2s ease; }
.step-forward-leave-active { transition: opacity 0.15s ease, transform 0.15s ease; }
.step-forward-enter-from { opacity: 0; transform: translateX(20px); }
.step-forward-leave-to   { opacity: 0; transform: translateX(-20px); }

.overlay-fade-enter-active,
.overlay-fade-leave-active { transition: opacity 0.2s ease; }
.overlay-fade-enter-from,
.overlay-fade-leave-to { opacity: 0; }

.strength-bar-enter-active { transition: opacity 0.2s ease, transform 0.2s ease; }
.strength-bar-enter-from { opacity: 0; transform: translateY(-4px); }

@keyframes pop-in {
  0%   { transform: scale(0.5); opacity: 0; }
  70%  { transform: scale(1.1); }
  100% { transform: scale(1);   opacity: 1; }
}
.pop-in { animation: pop-in 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
</style>
