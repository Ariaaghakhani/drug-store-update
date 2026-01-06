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
                v-bind="currentStepProps"
                @update:phone-number="phoneNumber = $event"
                @update:password="loginPassword = $event"
                @update:error="passwordError = $event"
                @update:digits="otpDigits = $event"
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
const userStore = useUserStore()

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
  errors: { name: '', password: '', passwordConfirm: '' },
})

// Reset Password State
const resetPasswordForm = ref({
  password: '',
  passwordConfirm: '',
  errors: { password: '', passwordConfirm: '' },
})

// Track previous step for better navigation
const previousStep = ref(null)

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
  phone: 'ورود به داروپلاس',
  password: 'ورود به داروپلاس',
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
        password: loginPassword.value,
        error: passwordError.value,
      }

    case 'otp-login':
      return {
        ...baseProps,
        digits: otpDigits.value,
        error: otpError.value,
        timer: resendTimer.value,
        context: 'login',
      }

    case 'otp-register':
      return {
        ...baseProps,
        digits: otpDigits.value,
        error: otpError.value,
        timer: resendTimer.value,
        context: 'register',
      }

    case 'forgot-password-otp':
      return {
        ...baseProps,
        digits: otpDigits.value,
        error: otpError.value,
        timer: resendTimer.value,
        context: 'forgot-password',
      }

    case 'register':
      return { ...baseProps, form: registerForm.value }

    case 'reset-password':
      return { ...baseProps, form: resetPasswordForm.value }

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

const handlePasswordSubmit = async () => {
  isLoading.value = true
  passwordError.value = ''

  try {
    const response = await app.$api.auth.login({
      data: {
        username: phoneNumber.value,
        password: loginPassword.value,
        phone: phoneNumber.value,
        loginType: 'PASSWORD',
      },
    })
    await finalizeLogin(response.data.data)
  } catch (error) {
    console.log(error)
    passwordError.value = 'رمز عبور نادرست است.'
  } finally {
    isLoading.value = false
  }
}

const handleOtpLoginSubmit = async () => {
  isLoading.value = true
  otpError.value = ''

  try {
    const otpCode = otpDigits.value.join('')
    const response = await app.$api.auth.loginOtp({
      data: {
        phone: phoneNumber.value,
        otpCode: otpCode,
      },
    })

    await finalizeLogin(response.data.data)
  } catch {
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
  const firstName = registerForm.value.name.split(' ')[0]
  const lastName = registerForm.value.name.split(' ')[1]
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

  try {
    const response = await app.$api.auth.sendRegisterOtp({
      data: {
        phone: phoneNumber.value,
      },
    })
    toast.success(
      response.data.message,
      '',
      'i-heroicons:chat-bubble-bottom-center-text-16-solid'
    )
    currentStep.value = 'otp-register'
    startResendTimer()
  } catch {
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

  try {
    await app.$api.auth.forgotPasswordOtp({
      data: {
        phone: phoneNumber.value,
      },
    })
    currentStep.value = 'forgot-password-otp'
    startResendTimer()
  } catch {
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
  app.$auth.setUser(data.user)
  userStore.setUser(data.user)
  toast.success('ورود موفقیت‌آمیز بود', '', 'i-heroicons-check-circle')

  const redirectTo = route.query.redirect || '/'
  navigateTo(redirectTo)
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
  try {
    await app.$api.auth.login({
      data: {
        phone: phoneNumber.value,
        username: phoneNumber.value,
        loginType: 'OTP',
      },
    })

    otpSent.value = true
    otpSessionActive.value = true
    previousStep.value = currentStep.value
    currentStep.value = 'otp-login'
    startResendTimer()
    toast.success('کد تایید ارسال شد', '', 'i-heroicons-check-circle')
  } catch {
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
  try {
    // Determine which OTP endpoint to call based on current step
    if (currentStep.value === 'forgot-password-otp') {
      await app.$api.auth.forgotPasswordOtp({
        data: { phone: phoneNumber.value },
      })
    } else if (currentStep.value === 'otp-register') {
      await app.$api.auth.sendRegisterOtp({
        data: { phone: phoneNumber.value },
      })
    } else {
      await app.$api.auth.login({
        data: {
          phone: phoneNumber.value,
          username: phoneNumber.value,
          loginType: 'OTP',
        },
      })
    }

    otpSessionActive.value = true
    startResendTimer()
    resetOtpDigits()

    toast.success('کد تایید مجدد ارسال شد', '', 'i-heroicons-check-circle')
  } catch {
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
    errors: { name: '', password: '', passwordConfirm: '' },
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
