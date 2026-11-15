<template>
  <div
    class="min-h-screen select-none flex items-center justify-center p-4 bg-gradient-to-br from-teal-50 to-cyan-100 dark:from-slate-900 dark:to-slate-800"
  >
    <UContainer class="w-full max-w-4xl flex items-center justify-center">
      <div
        class="flex flex-col md:flex-row items-stretch w-full h-full flex-1 rounded-3xl overflow-hidden shadow-2xl"
      >
        <!-- Hero Section -->
        <AuthHero />

        <!-- Forms Section -->
        <div
          class="w-full md:w-1/2 bg-white flex-auto h-full dark:bg-gray-800 p-8 md:p-12 flex flex-col justify-center content-between grow gap-y-8"
        >
          <NuxtLink to="/">
            <UButton
              icon="i-heroicons-arrow-right-20-solid"
              variant="ghost"
              color="primary"
              class="self-start mb-4"
            >
              بازگشت به صفحه اصلی
            </UButton>
          </NuxtLink>

          <div class="flex-1 flex flex-col justify-center">
            <!-- Header -->
            <div class="text-center mb-8">
              <div
                class="inline-flex items-center justify-center w-16 h-16 bg-teal-100 dark:bg-teal-900/30 rounded-2xl mb-4"
              >
                <UIcon
                  name="i-heroicons-building-storefront"
                  class="w-8 h-8 text-teal-600 dark:text-teal-400"
                />
              </div>

              <Transition name="fade" mode="out-in">
                <div :key="currentStep">
                  <h2
                    class="text-3xl font-bold text-gray-900 dark:text-white mb-2"
                  >
                    {{ stepTitles[currentStep] }}
                  </h2>
                  <p class="text-gray-600 dark:text-gray-400">
                    {{ stepDescriptions[currentStep] }}
                  </p>
                </div>
              </Transition>
            </div>

            <!-- Forms -->
            <Transition name="fade" mode="out-in">
              <component
                :is="currentStepComponent"
                ref="stepRef"
                v-bind="currentStepProps"
                @update:phone-number="phoneNumber = $event"
                @update:password="loginPassword = $event"
                @update:error="passwordError = $event"
                @update:digits="otpDigits = $event"
                @update:captcha="captcha = $event"
                @update:form="registerForm = $event"
                @submit="handleCurrentStepSubmit"
                @switch-to-otp="switchToOtp"
                @switch-to-password="switchToPassword"
                @forgot-password="handleForgotPassword"
                @resend="handleResendOtp"
                @go-back="handleGoBack"
              />
            </Transition>
          </div>
        </div>
      </div>
    </UContainer>

    <!-- Store admins must accept the platform agreement before a panel login (BACK 403 platform.terms.acceptance.required) -->
    <UModal
      v-model:open="termsOpen"
      title="قرارداد پلتفرم"
      description="برای ورود به پنل، قرارداد پلتفرم را بخوانید و بپذیرید"
    >
      <template #body>
        <div class="space-y-6 select-text">
          <template v-if="termsLoading">
            <USkeleton v-for="n in 3" :key="n" class="h-4 w-full" />
          </template>
          <p v-else-if="!platformTerms.length" class="text-sm text-gray-500 dark:text-gray-400">
            متن قرارداد در دسترس نیست. با پذیرش، نسخه‌ی منتشرشده‌ی فعلی را می‌پذیرید.
          </p>
          <template v-else>
            <section v-for="doc in platformTerms" :key="doc.id">
              <h3 class="text-base font-bold text-gray-900 dark:text-white">
                {{ doc.title }}
                <span v-if="doc.version" class="text-xs font-normal text-gray-500 dark:text-gray-400">(نسخه {{ doc.version }})</span>
              </h3>
              <p class="mt-2 text-sm leading-7 whitespace-pre-line text-gray-700 dark:text-gray-300">{{ htmlToText(doc.content) }}</p>
            </section>
          </template>
        </div>
      </template>
      <template #footer>
        <div class="flex w-full gap-2 justify-end">
          <UButton color="neutral" variant="outline" :disabled="isLoading" @click="termsOpen = false">انصراف</UButton>
          <UButton color="primary" :loading="isLoading" :disabled="termsLoading" @click="acceptPlatformTerms">
            می‌پذیرم و وارد می‌شوم
          </UButton>
        </div>
      </template>
    </UModal>
  </div>
</template>

<script setup>
import PhoneStep from '@/components/auth/PhoneStep.vue'
import PasswordStep from '@/components/auth/PasswordStep.vue'
import OtpStep from '@/components/auth/OtpStep.vue'
import RegisterStep from '@/components/auth/RegisterStep.vue'
import ResetPasswordStep from '@/components/auth/ResetPasswordStep.vue'
import AuthHero from '@/components/auth/AuthHero.vue'

definePageMeta({
  layout: 'auth',
})

const app = useNuxtApp()
const route = useRoute()
const toast = useAppToast()

// State
const currentStep = ref('phone') // 'phone' | 'password' | 'otp-login' | 'register' | 'otp-register' | 'forgot-password-otp' | 'reset-password'
const phoneNumber = ref('')
const isLoading = ref(false)

// Password State
const loginPassword = ref('')
const passwordError = ref('')

// OTP State
const otpDigits = ref(['', '', '', '', ''])
const otpError = ref('')
const resendTimer = ref(0)
const resendInterval = ref(null)
const otpSent = ref(false)
const otpSessionActive = ref(false)

// Register State
const registerForm = ref({
  name: '',
  password: '',
  passwordConfirm: '',
  acceptedTerms: false,
  errors: { name: '', password: '', passwordConfirm: '', acceptedTerms: '' },
})

// Reset Password State
const resetPasswordForm = ref({
  password: '',
  passwordConfirm: '',
  errors: { password: '', passwordConfirm: '' },
})

// Track previous step for better navigation
const previousStep = ref(null)

// Captcha (B8b): one model for every captcha-bearing request. The field lives in the step that sends the
// request (password, register, reset-password, OTP resend) and stays hidden unless the backend asks for it.
const CAPTCHA_ERROR_MESSAGE = 'کد امنیتی نادرست است'
const CAPTCHA_ERROR_CODES = ['captcha.required', 'captcha.invalid']
const captcha = ref({ captchaId: null, captchaAnswer: null })
const captchaError = ref('')
const stepRef = ref(null)
const captchaProps = computed(() => ({
  phoneNumber: phoneNumber.value,
  captcha: captcha.value,
  captchaError: captchaError.value,
}))

const clearCaptcha = () => {
  captcha.value = { captchaId: null, captchaAnswer: null }
}

// Challenges are single-use, so every failed captcha-bearing request gets a fresh one. A captcha.* error also
// shows the inline message and opens the field first (the OTP step mounts it on demand).
// Returns true when the failure was a captcha error, so the caller can skip its own error text.
const handleCaptchaFailure = async (error) => {
  const isCaptchaError = CAPTCHA_ERROR_CODES.includes(error?.response?.data?.errorCode)
  if (isCaptchaError) {
    captchaError.value = CAPTCHA_ERROR_MESSAGE
    await stepRef.value?.openCaptcha?.()
    stepRef.value?.captcha?.force()
  }
  await stepRef.value?.captcha?.reset()
  return isCaptchaError
}

// Step Configuration
const stepComponents = {
  phone: PhoneStep,
  password: PasswordStep,
  'otp-login': OtpStep,
  'otp-register': OtpStep,
  'forgot-password-otp': OtpStep,
  register: RegisterStep,
  'reset-password': ResetPasswordStep,
}

const stepTitles = {
  phone: 'ورود به CAPSULE کپسول',
  password: 'ورود به CAPSULE کپسول',
  'otp-login': 'ورود با کد یکبار مصرف',
  'otp-register': 'تایید شماره موبایل',
  'forgot-password-otp': 'بازیابی رمز عبور',
  register: 'تکمیل ثبت‌نام',
  'reset-password': 'تنظیم رمز عبور جدید',
}

const stepDescriptions = {
  phone: 'برای ادامه، شماره موبایل خود را وارد کنید',
  password: 'رمز عبور خود را وارد نمایید',
  'otp-login': 'کد تایید ارسال شده را وارد نمایید',
  'otp-register': 'کد تایید به شماره موبایل شما ارسال شد',
  'forgot-password-otp': 'کد تایید برای بازیابی رمز عبور ارسال شد',
  register: 'لطفا اطلاعات خود را تکمیل کنید',
  'reset-password': 'رمز عبور جدید خود را وارد کنید',
}

// Computed
const currentStepComponent = computed(() => stepComponents[currentStep.value])

const currentStepProps = computed(() => {
  const baseProps = { loading: isLoading.value }

  switch (currentStep.value) {
    case 'phone':
      return { ...baseProps, phoneNumber: phoneNumber.value }

    case 'password':
      return {
        ...baseProps,
        ...captchaProps.value,
        password: loginPassword.value,
        error: passwordError.value,
      }

    case 'otp-login':
      return {
        ...baseProps,
        ...captchaProps.value,
        digits: otpDigits.value,
        error: otpError.value,
        timer: resendTimer.value,
        context: 'login',
      }

    case 'otp-register':
      return {
        ...baseProps,
        ...captchaProps.value,
        digits: otpDigits.value,
        error: otpError.value,
        timer: resendTimer.value,
        context: 'register',
      }

    case 'forgot-password-otp':
      return {
        ...baseProps,
        ...captchaProps.value,
        digits: otpDigits.value,
        error: otpError.value,
        timer: resendTimer.value,
        context: 'forgot-password',
      }

    case 'register':
      return { ...baseProps, ...captchaProps.value, form: registerForm.value }

    case 'reset-password':
      return { ...baseProps, ...captchaProps.value, form: resetPasswordForm.value }

    default:
      return baseProps
  }
})

// OTP Context
// const otpContext = computed(() => {
//   return currentStep.value === 'otp-register' ? 'register' : 'login'
// })

// Methods
const handleCurrentStepSubmit = async () => {
  switch (currentStep.value) {
    case 'phone':
      await handlePhoneSubmit()
      break
    case 'password':
      await handlePasswordSubmit()
      break
    case 'otp-login':
      await handleOtpLoginSubmit()
      break
    case 'otp-register':
      await handleOtpRegisterSubmit()
      break
    case 'forgot-password-otp':
      await handleForgotPasswordOtpSubmit()
      break
    case 'register':
      await handleRegisterSubmit()
      break
    case 'reset-password':
      await handleResetPasswordSubmit()
      break
  }
}

const handlePhoneSubmit = async () => {
  isLoading.value = true
  try {
    const response = await app.$api.auth.checkUser({
      data: { phone: phoneNumber.value },
    })

    if (response.data.data) {
      // User exists → go to password
      previousStep.value = 'phone'
      currentStep.value = 'password'
    } else {
      // New user → go to register
      previousStep.value = 'phone'
      currentStep.value = 'register'
    }
  } catch {
    toast.error(
      'خطا در بررسی شماره موبایل',
      'لطفا دوباره تلاش کنید',
      'i-hugeicons:wifi-error-02'
    )
  } finally {
    isLoading.value = false
  }
}

// Platform agreement: a store admin's panel login answers 403 until they accept it; the same request is then repeated
// with acceptedPlatformTerms (an OTP code is not consumed by the 403, so it can be resent as is).
const termsOpen = ref(false)
const termsLoading = ref(false)
const platformTerms = ref([])
let retryWithTerms = null

const isTermsRequired = (error) => error?.response?.data?.errorCode === 'platform.terms.acceptance.required'

const askPlatformTerms = async (retry) => {
  retryWithTerms = retry
  termsOpen.value = true
  termsLoading.value = true
  try {
    const response = await app.$api.storefront.getPlatformTerms()
    platformTerms.value = response.data.data ?? []
  } catch {
    platformTerms.value = []
  } finally {
    termsLoading.value = false
  }
}

// Once accepted, every later login attempt of this visit carries the flag (see acceptPlatformTerms)
const platformTermsAccepted = ref(false)
const withPlatformTerms = (accepted) => accepted === true || platformTermsAccepted.value
// the acceptance belongs to one account: a different phone starts over
watch(phoneNumber, () => (platformTermsAccepted.value = false))

const acceptPlatformTerms = async () => {
  if (!retryWithTerms) return
  platformTermsAccepted.value = true
  // BACK checks the captcha before the agreement and a challenge is single-use, so the 403 already used this
  // attempt's answer: resending it would only fail as captcha.invalid. Ask for a new one; the next submit carries
  // the acceptance.
  if (captcha.value.captchaId) {
    termsOpen.value = false
    await stepRef.value?.captcha?.reset()
    captchaError.value = 'قرارداد پذیرفته شد. کد امنیتی جدید را وارد کنید و دوباره وارد شوید.'
    return
  }
  await retryWithTerms(true)
  termsOpen.value = false
}

const handlePasswordSubmit = async (acceptedPlatformTerms = false) => {
  isLoading.value = true
  passwordError.value = ''
  captchaError.value = ''

  try {
    const response = await app.$api.auth.login({
      data: {
        username: phoneNumber.value,
        password: loginPassword.value,
        phone: phoneNumber.value,
        loginType: 'PASSWORD',
        ...captcha.value,
        ...(withPlatformTerms(acceptedPlatformTerms) && { acceptedPlatformTerms: true }),
      },
    })
    await finalizeLogin(response.data.data)
  } catch (error) {
    if (isTermsRequired(error)) {
      askPlatformTerms(handlePasswordSubmit)
      return
    }
    console.log(error)
    // A captcha error is shown under the captcha, not as a wrong password
    if (await handleCaptchaFailure(error)) return
    passwordError.value = 'رمز عبور نادرست است.'
  } finally {
    isLoading.value = false
  }
}

const handleOtpLoginSubmit = async (acceptedPlatformTerms = false) => {
  isLoading.value = true
  otpError.value = ''

  try {
    const otpCode = otpDigits.value.join('')
    const response = await app.$api.auth.loginOtp({
      data: {
        phone: phoneNumber.value,
        otpCode: otpCode,
        ...(withPlatformTerms(acceptedPlatformTerms) && { acceptedPlatformTerms: true }),
      },
    })

    await finalizeLogin(response.data.data)
  } catch (error) {
    if (isTermsRequired(error)) {
      askPlatformTerms(handleOtpLoginSubmit)
      return
    }
    toast.error(
      'خطا در ارسال کد یکبار مصرف',
      'لطفا دوباره تلاش کنید',
      'i-hugeicons:wifi-error-02'
    )
  } finally {
    isLoading.value = false
  }
}

const handleOtpRegisterSubmit = async () => {
  isLoading.value = true
  otpError.value = ''
  // Everything after the first word is the surname (a three-word name used to lose its last word)
  const [firstName, ...rest] = registerForm.value.name.trim().split(/\s+/)
  const lastName = rest.join(' ') || undefined
  try {
    const otpCode = otpDigits.value.join('')
    const response = await app.$api.auth.register({
      data: {
        username: phoneNumber.value,
        phone: phoneNumber.value,
        password: registerForm.value.password,
        otpCode: otpCode,
        firstName: firstName,
        lastName: lastName,
        // BACK requires it whenever the store has published terms (400 terms.acceptance.required)
        acceptedTerms: registerForm.value.acceptedTerms === true,
      },
      mode: 'register',
    })
    await finalizeLogin(response.data.data)
  } catch (error) {
    console.log(error)
    toast.error('کد تایید نادرست است.', 'لطفا از صحت کد وارد شده مطمئن شوید')
  } finally {
    isLoading.value = false
  }
}

const handleForgotPasswordOtpSubmit = async () => {
  isLoading.value = true
  otpError.value = ''

  try {
    const otpCode = otpDigits.value.join('')
    // Verify OTP for password reset
    await app.$api.auth.forgotPassword({
      data: {
        username: phoneNumber.value,
        newPassword: resetPasswordForm.value.password,
        phone: phoneNumber.value,
        otpCode: otpCode,
      },
    })

    toast.success(
      'رمز عبور با موفقیت تغییر یافت',
      '',
      'i-heroicons-check-circle'
    )
    previousStep.value = 'forgot-password-otp'
    currentStep.value = 'password'
  } catch {
    otpError.value = 'کد تایید نادرست است.'
  } finally {
    isLoading.value = false
  }
}

const handleRegisterSubmit = async () => {
  isLoading.value = true
  captchaError.value = ''

  try {
    const response = await app.$api.auth.sendRegisterOtp({
      data: {
        phone: phoneNumber.value,
        ...captcha.value,
      },
    })
    clearCaptcha()
    toast.success(
      response.data.message,
      '',
      'i-heroicons:chat-bubble-bottom-center-text-16-solid'
    )
    currentStep.value = 'otp-register'
    startResendTimer()
  } catch (error) {
    if (await handleCaptchaFailure(error)) return
    toast.error(
      'خطا در ثبت‌نام',
      'لطفا دوباره تلاش کنید.',
      'i-heroicons-x-circle'
    )
  } finally {
    isLoading.value = false
  }
}

const handleResetPasswordSubmit = async () => {
  isLoading.value = true
  captchaError.value = ''

  try {
    await app.$api.auth.forgotPasswordOtp({
      data: {
        phone: phoneNumber.value,
        ...captcha.value,
      },
    })
    clearCaptcha()
    currentStep.value = 'forgot-password-otp'
    startResendTimer()
  } catch (error) {
    if (await handleCaptchaFailure(error)) return
    toast.error(
      'خطا در ارسال کد یک‌بار مصرف',
      'لطفا دوباره تلاش کنید',
      'i-heroicons-x-circle'
    )
  } finally {
    isLoading.value = false
  }
}

const finalizeLogin = async (data) => {
  app.$auth.setToken(data.accessToken)
  app.$auth.setUser(data.user) // This now automatically syncs with userStore
  // Menus must be cached before navigating: the /panel route guard reads them synchronously
  await useUserPanelTabs().refreshMenus()
  toast.success('ورود موفقیت‌آمیز بود', '', 'i-heroicons-check-circle')

  const redirectTo = route.query.redirect || '/panel/dashboard'
  await navigateTo(redirectTo)
}

const startResendTimer = () => {
  resendTimer.value = 120
  if (resendInterval.value) clearInterval(resendInterval.value)

  resendInterval.value = setInterval(() => {
    resendTimer.value--
    if (resendTimer.value <= 0) {
      clearInterval(resendInterval.value)
      otpSessionActive.value = false
    }
  }, 1000)
}

const switchToOtp = async () => {
  // Check if OTP is already sent and session is active
  if (otpSent.value && otpSessionActive.value) {
    previousStep.value = currentStep.value
    currentStep.value = 'otp-login'

    if (resendTimer.value === 0) {
      startResendTimer()
    }
    return
  }

  // Send OTP for the first time
  isLoading.value = true
  captchaError.value = ''
  try {
    await app.$api.auth.login({
      data: {
        phone: phoneNumber.value,
        username: phoneNumber.value,
        loginType: 'OTP',
        ...captcha.value,
      },
    })
    clearCaptcha()

    otpSent.value = true
    otpSessionActive.value = true
    previousStep.value = currentStep.value
    currentStep.value = 'otp-login'
    startResendTimer()
    toast.success('کد تایید ارسال شد', '', 'i-heroicons-check-circle')
  } catch (error) {
    if (await handleCaptchaFailure(error)) return
    toast.error('خطا در ارسال کد تایید', '', 'i-heroicons-x-circle')
  } finally {
    isLoading.value = false
  }
}

const switchToPassword = () => {
  previousStep.value = currentStep.value
  currentStep.value = 'password'
  resetOtpState()
}

const handleForgotPassword = async () => {
  previousStep.value = currentStep.value
  currentStep.value = 'reset-password'
  // isLoading.value = true
  //
  // try {
  //   // Send OTP for password reset
  //   await app.$api.auth.sendResetOtp({
  //     data: {
  //       phone: phoneNumber.value,
  //     },
  //   })
  //
  //   previousStep.value = 'password'
  //   currentStep.value = 'forgot-password-otp'
  //   startResendTimer()
  //
  //   toast.success(
  //     'کد تایید ارسال شد',
  //     'کد بازیابی به شماره موبایل شما ارسال شد',
  //     'i-heroicons-check-circle'
  //   )
  // } catch {
  //   toast.error(
  //     'خطا در ارسال کد تایید',
  //     'لطفا دوباره تلاش کنید',
  //     'i-heroicons-x-circle'
  //   )
  // } finally {
  //   isLoading.value = false
  // }
}

const handleResendOtp = async () => {
  if (isLoading.value) return

  isLoading.value = true
  captchaError.value = ''
  try {
    // Determine which OTP endpoint to call based on current step
    if (currentStep.value === 'forgot-password-otp') {
      await app.$api.auth.forgotPasswordOtp({
        data: { phone: phoneNumber.value, ...captcha.value },
      })
    } else if (currentStep.value === 'otp-register') {
      await app.$api.auth.sendRegisterOtp({
        data: { phone: phoneNumber.value, ...captcha.value },
      })
    } else {
      await app.$api.auth.login({
        data: {
          phone: phoneNumber.value,
          username: phoneNumber.value,
          loginType: 'OTP',
          ...captcha.value,
        },
      })
    }

    clearCaptcha()
    stepRef.value?.closeCaptcha?.()
    otpSessionActive.value = true
    startResendTimer()
    resetOtpDigits()

    toast.success('کد تایید مجدد ارسال شد', '', 'i-heroicons-check-circle')
  } catch (error) {
    if (await handleCaptchaFailure(error)) return
    toast.error(
      'خطا در ارسال مجدد کد',
      'لطفا دوباره تلاش کنید',
      'i-heroicons-x-circle'
    )
  } finally {
    isLoading.value = false
  }
}

const handleGoBack = () => {
  // Smart back navigation based on current step
  switch (currentStep.value) {
    case 'password':
    case 'register':
      // Go back to phone
      resetAll()
      currentStep.value = 'phone'
      break

    case 'otp-login':
      // Go back to password
      currentStep.value = 'password'
      resetOtpState()
      break

    case 'forgot-password-otp':
      // Go back to phone (cancel reset process)
      resetAll()
      currentStep.value = 'phone'
      break

    case 'reset-password':
      // Go back to password
      currentStep.value = 'password'
      resetOtpState()
      break

    case 'otp-register':
      // Go back to phone (user wants to change number)
      resetAll()
      currentStep.value = 'phone'
      break

    default:
      currentStep.value = 'phone'
      resetAll()
  }
}

const resetOtpDigits = () => {
  otpDigits.value = ['', '', '', '', '']
  otpError.value = ''
}

const resetOtpState = () => {
  resetOtpDigits()
  // Don't reset otpSent and timer - keep session active
}

const resetAll = () => {
  captchaError.value = ''
  clearCaptcha()
  loginPassword.value = ''
  passwordError.value = ''
  otpDigits.value = ['', '', '', '', '']
  otpError.value = ''
  resendTimer.value = 0
  otpSent.value = false
  otpSessionActive.value = false

  registerForm.value = {
    name: '',
    password: '',
    passwordConfirm: '',
    acceptedTerms: false,
    errors: { name: '', password: '', passwordConfirm: '', acceptedTerms: '' },
  }

  resetPasswordForm.value = {
    password: '',
    passwordConfirm: '',
    errors: { password: '', passwordConfirm: '' },
  }

  if (resendInterval.value) {
    clearInterval(resendInterval.value)
    resendInterval.value = null
  }
}

onBeforeUnmount(() => {
  if (resendInterval.value) clearInterval(resendInterval.value)
})
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
