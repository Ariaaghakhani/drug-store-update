<template>
  <div
    class="min-h-screen select-none flex items-center justify-center p-4 bg-gradient-to-br from-teal-50 to-cyan-100 dark:from-slate-900 dark:to-slate-800"
  >
    <UContainer class="w-full max-w-4xl flex items-center justify-center">
      <div
        class="flex flex-col md:flex-row items-stretch w-full h-full flex-1 rounded-3xl overflow-hidden shadow-2xl"
      >
        <!-- Right Side - Hero Image -->
        <div
          class="hidden md:flex w-1/2 bg-gradient-to-br relative from-teal-600 to-cyan-500 text-white items-center justify-center p-12"
        >
          <div
            class="absolute inset-0"
            style="
              background: linear-gradient(135deg, #0d9488 0%, #06b6d4 100%);
            "
          />
          <div
            class="relative z-10 p-12 flex flex-col items-center justify-center text-white"
          >
            <div class="text-center space-y-6">
              <h1 class="text-4xl font-bold leading-tight">
                سلامتی شما،<br />اولویت ماست
              </h1>
              <p class="text-lg text-white/90">
                خرید آسان و امن دارو با بهترین قیمت و مشاوره رایگان
              </p>

              <div class="flex items-center justify-center gap-4 mt-8">
                <div
                  class="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl rotate-12 animate-float"
                />
                <div
                  class="w-20 h-20 bg-white/30 backdrop-blur-sm rounded-3xl -rotate-6 animate-float-delayed"
                />
                <div
                  class="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl rotate-12 animate-float"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Left Side - Forms -->
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
                <div v-if="currentStep === 'phone'">
                  <h2
                    class="text-3xl font-bold text-gray-900 dark:text-white mb-2"
                  >
                    ورود به داروپلاس
                  </h2>
                  <p
                    v-if="currentStep === 'phone'"
                    class="text-gray-600 dark:text-gray-400"
                  >
                    برای ادامه، شماره موبایل خود را وارد کنید
                  </p>
                </div>
                <div v-else-if="currentStep === 'password'">
                  <h2
                    class="text-3xl font-bold text-gray-900 dark:text-white mb-2"
                  >
                    ورود به داروپلاس
                  </h2>
                  <p class="text-gray-600 dark:text-gray-400">
                    رمز عبور خود را وارد نمایید
                  </p>
                </div>
                <div v-else-if="currentStep === 'otp'">
                  <h2
                    class="text-3xl font-bold text-gray-900 dark:text-white mb-2"
                  >
                    ورود با کد یکبار مصرف
                  </h2>
                  <p class="text-gray-600 dark:text-gray-400">
                    کد تایید ارسال شده را وارد نمایید
                  </p>
                </div>
                <div v-else>
                  <h2
                    class="text-3xl font-bold text-gray-900 dark:text-white mb-2"
                  >
                    تکمیل ثبت‌نام
                  </h2>
                  <p class="text-gray-600 dark:text-gray-400">
                    لطفا اطلاعات خود را تکمیل کنید
                  </p>
                </div>
              </Transition>
            </div>
            <Transition name="fade" mode="out-in">
              <!-- Step 1: Phone Number -->
              <form
                v-if="currentStep === 'phone'"
                class="space-y-6"
                @submit.prevent="handlePhoneSubmit"
              >
                <div class="relative mb-12">
                  <label
                    class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
                    شماره موبایل
                  </label>

                  <div class="relative">
                    <input
                      v-model="phoneNumber"
                      type="tel"
                      placeholder="09xxxxxxxxx"
                      maxlength="11"
                      class="w-full px-4 pr-12 h-14 text-lg border-2 rounded-2xl focus:ring-4 focus:ring-teal-500/20 focus:border-teal-500 transition-all justify-center"
                      :class="{
                        'border-gray-300 dark:border-gray-600': !phoneError,
                        'border-red-500 dark:border-red-500': phoneError,
                      }"
                      @input="validatePhone"
                    />

                    <div
                      class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                    >
                      <UIcon
                        name="i-heroicons-device-phone-mobile"
                        class="w-5 h-5"
                      />
                    </div>
                  </div>

                  <div class="absolute left-0 right-0 mt-1">
                    <Transition name="fade">
                      <p
                        v-if="phoneError"
                        class="text-sm text-red-600 dark:text-red-400 absolute"
                      >
                        {{ phoneError }}
                      </p>
                    </Transition>
                  </div>
                </div>

                <button
                  type="submit"
                  :disabled="isLoading || !isValidPhone"
                  class="w-full py-4 px-6 text-lg font-semibold text-white rounded-2xl focus:ring-4 focus:ring-teal-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] active:scale-[0.98]"
                  style="
                    background: linear-gradient(
                      135deg,
                      #0d9488 0%,
                      #06b6d4 100%
                    );
                  "
                >
                  <span v-if="!isLoading">ادامه</span>
                  <span v-else class="flex items-center justify-center gap-2">
                    <UIcon
                      name="i-heroicons-arrow-path"
                      class="w-5 h-5 animate-spin"
                    />
                    در حال بررسی...
                  </span>
                </button>

                <p class="text-sm text-center text-gray-600 dark:text-gray-400">
                  ورود شما به معنای پذیرش
                  <NuxtLink
                    to="/terms"
                    class="text-teal-600 dark:text-teal-400 hover:underline"
                  >
                    شرایط و قوانین
                  </NuxtLink>
                  داروپلاس است.
                </p>
              </form>

              <!-- Step 2: Password Entry (for registered users) -->
              <form
                v-else-if="currentStep === 'password'"
                class="space-y-6"
                @submit.prevent="handlePasswordSubmit"
              >
                <div>
                  <label
                    class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
                    رمز عبور
                  </label>
                  <div class="relative h-14">
                    <input
                      v-model="loginPassword"
                      :type="showLoginPassword ? 'text' : 'password'"
                      placeholder="رمز عبور خود را وارد کنید"
                      class="w-full h-full px-4 pl-12 text-lg border-2 rounded-2xl focus:ring-4 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                      :class="{
                        'border-gray-300 dark:border-gray-600': !passwordError,
                        'border-red-500 dark:border-red-500': passwordError,
                      }"
                    />
                    <button
                      type="button"
                      class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 flex justify-center items-center"
                      @click="showLoginPassword = !showLoginPassword"
                    >
                      <UIcon
                        :name="
                          showLoginPassword
                            ? 'i-heroicons-eye-slash'
                            : 'i-heroicons-eye'
                        "
                        class="w-5 h-5"
                      />
                    </button>
                  </div>
                  <p
                    v-if="passwordError"
                    class="mt-2 text-sm text-red-600 dark:text-red-400"
                  >
                    {{ passwordError }}
                  </p>
                </div>

                <button
                  type="submit"
                  :disabled="isLoading || !loginPassword"
                  class="w-full py-4 px-6 text-lg font-semibold text-white rounded-2xl focus:ring-4 focus:ring-teal-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] active:scale-[0.98]"
                  style="
                    background: linear-gradient(
                      135deg,
                      #0d9488 0%,
                      #06b6d4 100%
                    );
                  "
                >
                  <span v-if="!isLoading">ورود</span>
                  <span v-else class="flex items-center justify-center gap-2">
                    <UIcon
                      name="i-heroicons-arrow-path"
                      class="w-5 h-5 animate-spin"
                    />
                    در حال بررسی...
                  </span>
                </button>

                <!-- Switch to OTP and Forgot Password -->
                <div class="flex items-center justify-between gap-4 pt-2">
                  <button
                    type="button"
                    class="flex-1 py-3 px-4 text-sm font-medium text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/20 rounded-xl hover:bg-teal-100 dark:hover:bg-teal-900/30 transition-colors"
                    @click="switchToOtp"
                  >
                    ورود با پیامک
                  </button>
                  <button
                    type="button"
                    class="flex-1 py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    @click="handleForgotPassword"
                  >
                    فراموشی رمز عبور
                  </button>
                </div>

                <button
                  type="button"
                  class="w-full py-3 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                  @click="goBack"
                >
                  بازگشت و ویرایش شماره
                </button>
              </form>

              <!-- Step 3: OTP Verification -->
              <form
                v-else-if="currentStep === 'otp'"
                class="space-y-6"
                @submit.prevent="handleOtpSubmit"
              >
                <div>
                  <label
                    class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
                    کد تایید
                  </label>
                  <div class="flex gap-3 justify-center h-14" dir="ltr">
                    <input
                      v-for="(digit, index) in otpDigits"
                      :key="index"
                      :ref="(el) => (otpInputs[index] = el)"
                      v-model="otpDigits[index]"
                      type="tel"
                      maxlength="1"
                      class="w-14 h-14 text-center text-2xl font-bold border-2 rounded-xl focus:ring-4 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                      :class="{
                        'border-gray-300 dark:border-gray-600': !otpError,
                        'border-red-500 dark:border-red-500': otpError,
                      }"
                      @input="handleOtpInput(index, $event)"
                      @keydown="handleOtpKeydown(index, $event)"
                      @paste="handleOtpPaste"
                    />
                  </div>
                  <p
                    v-if="otpError"
                    class="mt-2 text-sm text-center text-red-600 dark:text-red-400"
                  >
                    {{ otpError }}
                  </p>
                </div>

                <button
                  type="submit"
                  :disabled="isLoading || !isValidOtp"
                  class="w-full py-4 px-6 text-lg font-semibold text-white rounded-2xl focus:ring-4 focus:ring-teal-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] active:scale-[0.98]"
                  style="
                    background: linear-gradient(
                      135deg,
                      #0d9488 0%,
                      #06b6d4 100%
                    );
                  "
                >
                  <span v-if="!isLoading">تایید و ورود</span>
                  <span v-else class="flex items-center justify-center gap-2">
                    <UIcon
                      name="i-heroicons-arrow-path"
                      class="w-5 h-5 animate-spin"
                    />
                    در حال بررسی...
                  </span>
                </button>

                <!-- Switch back to Password -->
                <div class="flex items-center justify-between gap-4 pt-2">
                  <div class="flex-1 text-center">
                    <p
                      v-if="resendTimer > 0"
                      class="text-sm text-gray-600 dark:text-gray-400"
                    >
                      ارسال مجدد کد تا {{ resendTimer }} ثانیه دیگر
                    </p>
                    <button
                      v-else
                      type="button"
                      :disabled="isLoading"
                      class="text-sm text-teal-600 dark:text-teal-400 hover:underline disabled:opacity-50"
                      @click="resendOtp"
                    >
                      ارسال مجدد کد تایید
                    </button>
                  </div>
                  <button
                    type="button"
                    class="flex-1 py-3 px-4 text-sm font-medium text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/20 rounded-xl hover:bg-teal-100 dark:hover:bg-teal-900/30 transition-colors"
                    @click="switchToPassword"
                  >
                    ورود با رمز عبور
                  </button>
                </div>

                <button
                  type="button"
                  class="w-full py-3 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                  @click="goBack"
                >
                  بازگشت و ویرایش شماره
                </button>
              </form>

              <!-- Step 4: Registration Form (for new users) -->
              <form
                v-else-if="currentStep === 'register'"
                class="space-y-6"
                @submit.prevent="handleRegisterSubmit"
              >
                <div class="space-y-4">
                  <!-- Name -->
                  <div>
                    <label
                      class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                      for="fullName"
                    >
                      نام و نام خانوادگی
                    </label>
                    <input
                      id="fullName"
                      v-model="registerForm.name"
                      autocomplete="off"
                      type="text"
                      placeholder="نام و نام خانوادگی خود را وارد کنید"
                      class="w-full px-4 h-14 text-lg border-2 rounded-2xl focus:ring-4 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                      :class="{
                        'border-gray-300 dark:border-gray-600':
                          !registerForm.errors.name,
                        'border-red-500 dark:border-red-500':
                          registerForm.errors.name,
                      }"
                    />
                    <p
                      v-if="registerForm.errors.name"
                      class="mt-1 text-sm text-red-600 dark:text-red-400"
                    >
                      {{ registerForm.errors.name }}
                    </p>
                  </div>

                  <!-- Password -->
                  <div>
                    <label
                      class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                    >
                      رمز عبور
                    </label>
                    <div class="relative h-14">
                      <input
                        v-model="registerForm.password"
                        autocomplete="off"
                        :type="showPassword ? 'text' : 'password'"
                        placeholder="حداقل 8 کاراکتر"
                        class="w-full h-full px-4 pl-12 text-lg border-2 rounded-2xl focus:ring-4 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                        :class="{
                          'border-gray-300 dark:border-gray-600':
                            !registerForm.errors.password,
                          'border-red-500 dark:border-red-500':
                            registerForm.errors.password,
                        }"
                      />
                      <button
                        type="button"
                        class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        @click="showPassword = !showPassword"
                      >
                        <UIcon
                          :name="
                            showPassword
                              ? 'i-heroicons-eye-slash'
                              : 'i-heroicons-eye'
                          "
                          class="w-5 h-5"
                        />
                      </button>
                    </div>
                    <p
                      v-if="registerForm.errors.password"
                      class="mt-1 text-sm text-red-600 dark:text-red-400"
                    >
                      {{ registerForm.errors.password }}
                    </p>
                  </div>

                  <!-- Password Confirmation -->
                  <div>
                    <label
                      class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                    >
                      تکرار رمز عبور
                    </label>
                    <div class="relative h-14">
                      <input
                        v-model="registerForm.passwordConfirm"
                        :type="showPasswordConfirm ? 'text' : 'password'"
                        placeholder="رمز عبور خود را دوباره وارد کنید"
                        class="w-full h-full px-4 pl-12 text-lg border-2 rounded-2xl focus:ring-4 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                        :class="{
                          'border-gray-300 dark:border-gray-600':
                            !registerForm.errors.passwordConfirm,
                          'border-red-500 dark:border-red-500':
                            registerForm.errors.passwordConfirm,
                        }"
                      />
                      <button
                        type="button"
                        class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        @click="showPasswordConfirm = !showPasswordConfirm"
                      >
                        <UIcon
                          :name="
                            showPasswordConfirm
                              ? 'i-heroicons-eye-slash'
                              : 'i-heroicons-eye'
                          "
                          class="w-5 h-5"
                        />
                      </button>
                    </div>
                    <p
                      v-if="registerForm.errors.passwordConfirm"
                      class="mt-1 text-sm text-red-600 dark:text-red-400"
                    >
                      {{ registerForm.errors.passwordConfirm }}
                    </p>
                  </div>
                </div>

                <button
                  type="submit"
                  :disabled="isLoading"
                  class="w-full py-4 px-6 text-lg font-semibold text-white rounded-2xl focus:ring-4 focus:ring-teal-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] active:scale-[0.98]"
                  style="
                    background: linear-gradient(
                      135deg,
                      #0d9488 0%,
                      #06b6d4 100%
                    );
                  "
                >
                  <span v-if="!isLoading">تکمیل ثبت‌نام</span>
                  <span v-else class="flex items-center justify-center gap-2">
                    <UIcon
                      name="i-heroicons-arrow-path"
                      class="w-5 h-5 animate-spin"
                    />
                    در حال ثبت‌نام...
                  </span>
                </button>

                <button
                  type="button"
                  class="w-full py-3 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                  @click="goBack"
                >
                  بازگشت و ویرایش شماره
                </button>
              </form>
            </Transition>
          </div>
        </div>
      </div>
    </UContainer>
  </div>
</template>

<script setup>
import {
  validatePhoneNumber,
  isValidPhoneNumber,
  validateRegisterForm,
} from '@/utils/validations.js'

definePageMeta({
  layout: 'auth',
})

const app = useNuxtApp()
const router = useRouter()
const route = useRoute()
const toast = useAppToast()

// State
const currentStep = ref('phone') // 'phone' | 'password' | 'otp' | 'register'
const phoneNumber = ref('')
const phoneError = ref('')
const isLoading = ref(false)
const isUserRegistered = ref(false)

// Password Login State
const loginPassword = ref('')
const passwordError = ref('')
const showLoginPassword = ref(false)

// OTP State
const otpDigits = ref(['', '', '', '', ''])
const otpInputs = ref([])
const otpError = ref('')
const resendTimer = ref(0)
const resendInterval = ref(null)

// Registration Form State
const registerForm = ref({
  name: '',
  password: '',
  passwordConfirm: '',
  errors: {
    name: '',
    password: '',
    passwordConfirm: '',
  },
})

// Password visibility toggles
const showPassword = ref(false)
const showPasswordConfirm = ref(false)

// Computed
const isValidOtp = computed(() =>
  otpDigits.value.every((digit) => digit !== '')
)

const otpCode = computed(() => otpDigits.value.join(''))

const isValidPhone = computed(() => isValidPhoneNumber(phoneNumber.value))

// Methods
const validatePhone = () => {
  phoneError.value = validatePhoneNumber(phoneNumber.value)
}

const handlePhoneSubmit = async () => {
  validatePhone()
  if (!isValidPhone.value || isLoading.value) return

  isLoading.value = true
  try {
    const response = await app.$api.auth.checkUser({
      data: {
        phone: phoneNumber.value,
      },
    })

    // response.data is true if user is registered, false if new user
    isUserRegistered.value = response.data

    if (isUserRegistered.value) {
      // User exists → go to password entry (not OTP by default)
      currentStep.value = 'password'
    } else {
      // New user → go to registration form
      currentStep.value = 'register'
    }
  } catch (error) {
    toast.error(
      'خطا در بررسی شماره موبایل',
      ' لطفا دوباره تلاش کنید',
      'i-hugeicons:wifi-error-02'
    )
    console.error('Check user error:', error)
  } finally {
    isLoading.value = false
  }
}

const handlePasswordSubmit = async () => {
  if (!loginPassword.value || isLoading.value) return

  isLoading.value = true
  passwordError.value = ''

  try {
    const config = {
      data: {
        username: phoneNumber.value,
        password: loginPassword.value,
        phone: phoneNumber.value,
        loginType: 'PASSWORD',
      },
    }
    const response = await app.$api.auth.login(config)
    app.$auth.setToken(response.data.accessToken)
    app.$auth.setUser(response.data.user)

    toast.add({
      title: 'ورود موفقیت‌آمیز بود!',
      icon: 'i-heroicons-check-circle',
      color: 'green',
    })

    const redirectTo = route.query.redirect || '/'
    await router.push(redirectTo)
  } catch (error) {
    passwordError.value = 'رمز عبور نادرست است.'
    console.error('Password login error:', error)
  } finally {
    isLoading.value = false
  }
}

const switchToOtp = async () => {
  isLoading.value = true
  try {
    // Send OTP to user's phone
    // await app.$api.auth.sendOtp({
    //   data: {
    //     phone: phoneNumber.value,
    //   },
    // })

    currentStep.value = 'otp'
    startResendTimer()

    nextTick(() => {
      if (otpInputs.value[0]) otpInputs.value[0].focus()
    })

    toast.add({
      title: 'کد تایید ارسال شد',
      icon: 'i-heroicons-check-circle',
      color: 'green',
    })
  } catch {
    toast.add({
      title: 'خطا در ارسال کد تایید',
      description: 'لطفا دوباره تلاش کنید.',
      icon: 'i-heroicons-x-circle',
      color: 'red',
    })
  } finally {
    isLoading.value = false
  }
}

const switchToPassword = () => {
  currentStep.value = 'password'
  otpDigits.value = ['', '', '', '', '']
  otpError.value = ''

  if (resendInterval.value) {
    clearInterval(resendInterval.value)
    resendInterval.value = null
  }
}

const handleForgotPassword = () => {
  // TODO: Implement forgot password flow
  toast.add({
    title: 'بازیابی رمز عبور',
    description: 'این قابلیت به زودی فعال می‌شود.',
    icon: 'i-heroicons-information-circle',
    color: 'blue',
  })
}

const startResendTimer = () => {
  resendTimer.value = 60
  if (resendInterval.value) clearInterval(resendInterval.value)

  resendInterval.value = setInterval(() => {
    resendTimer.value--
    if (resendTimer.value <= 0) {
      clearInterval(resendInterval.value)
    }
  }, 1000)
}

const handleOtpInput = (index, event) => {
  const value = event.target.value
  if (value && !/^\d$/.test(value)) {
    otpDigits.value[index] = ''
    return
  }

  otpDigits.value[index] = value
  otpError.value = ''

  if (value && index < 5) {
    nextTick(() => {
      if (otpInputs.value[index + 1]) otpInputs.value[index + 1].focus()
    })
  }

  if (isValidOtp.value) handleOtpSubmit()
}

const handleOtpKeydown = (index, event) => {
  if (event.key === 'Backspace' && !otpDigits.value[index] && index > 0) {
    nextTick(() => {
      if (otpInputs.value[index - 1]) otpInputs.value[index - 1].focus()
    })
  }
}

const handleOtpPaste = (event) => {
  event.preventDefault()
  const pastedData = event.clipboardData.getData('text').trim()

  if (/^\d{6}$/.test(pastedData)) {
    otpDigits.value = pastedData.split('')
    nextTick(() => {
      if (otpInputs.value[5]) otpInputs.value[5].focus()
    })
    if (isValidOtp.value) handleOtpSubmit()
  }
}

const handleOtpSubmit = async () => {
  if (!isValidOtp.value || isLoading.value) return

  isLoading.value = true
  otpError.value = ''

  try {
    // const response = await app.$api.auth.verifyOtp({
    //   data: {
    //     phone: phoneNumber.value,
    //     otp: otpCode.value,
    //   },
    // })

    // Store authentication token
    // const token = response.data.token
    // Use your auth system to store the token

    toast.add({
      title: 'ورود موفقیت‌آمیز بود!',
      icon: 'i-heroicons-check-circle',
      color: 'green',
    })

    const redirectTo = route.query.redirect || '/panel'
    await router.push(redirectTo)
  } catch (error) {
    otpError.value = 'کد تایید نادرست است.'
    console.error('OTP verification error:', error)
  } finally {
    isLoading.value = false
  }
}

const handleRegisterSubmit = async () => {
  const { isValid, errors } = validateRegisterForm(registerForm.value)

  registerForm.value.errors = errors

  if (!isValid) return

  isLoading.value = true

  try {
    const config = {
      data: {
        phone: phoneNumber.value,
      },
    }
    const response = await app.$api.auth.register(config, 'register')
    console.log(response)
    // const response = await app.$api.auth.register({
    //   data: {
    //     phone: phoneNumber.value,
    //     name: registerForm.value.name.trim(),
    //     password: registerForm.value.password,
    //   },
    // })

    // Store authentication token
    // const token = response.data.token
    // Use your auth system to store the token

    toast.add({
      title: 'ثبت‌نام موفقیت‌آمیز بود!',
      icon: 'i-heroicons-check-circle',
      color: 'green',
    })

    const redirectTo = route.query.redirect || '/panel'
    await router.push(redirectTo)
  } catch (error) {
    toast.add({
      title: 'خطا در ثبت‌نام',
      description: 'لطفا دوباره تلاش کنید.',
      icon: 'i-heroicons-x-circle',
      color: 'red',
    })
    console.error('Registration error:', error)
  } finally {
    isLoading.value = false
  }
}

const resendOtp = async () => {
  if (isLoading.value) return

  isLoading.value = true
  try {
    await app.$api.auth.sendOtp({
      data: {
        phone: phoneNumber.value,
      },
    })

    startResendTimer()
    otpDigits.value = ['', '', '', '', '']
    otpError.value = ''

    nextTick(() => {
      if (otpInputs.value[0]) otpInputs.value[0].focus()
    })

    toast.add({
      title: 'کد تایید مجدد ارسال شد',
      icon: 'i-heroicons-check-circle',
      color: 'green',
    })
  } catch {
    toast.add({
      title: 'خطا در ارسال مجدد کد',
      description: 'لطفا دوباره تلاش کنید.',
      icon: 'i-heroicons-x-circle',
      color: 'red',
    })
  } finally {
    isLoading.value = false
  }
}

const goBack = () => {
  currentStep.value = 'phone'
  loginPassword.value = ''
  passwordError.value = ''
  otpDigits.value = ['', '', '', '', '']
  otpError.value = ''
  resendTimer.value = 0

  // Reset registration form
  registerForm.value = {
    name: '',
    password: '',
    passwordConfirm: '',
    errors: {
      name: '',
      password: '',
      passwordConfirm: '',
    },
  }
  showPassword.value = false
  showPasswordConfirm.value = false
  showLoginPassword.value = false

  if (resendInterval.value) {
    clearInterval(resendInterval.value)
    resendInterval.value = null
  }
}

// Lifecycle
onBeforeUnmount(() => {
  if (resendInterval.value) clearInterval(resendInterval.value)
})
</script>

<style scoped>
input[type='tel']::-webkit-outer-spin-button,
input[type='tel']::-webkit-inner-spin-button,
input[type='number']::-webkit-outer-spin-button,
input[type='number']::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

input[type='tel'],
input[type='number'] {
  -moz-appearance: textfield;
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0) rotate(12deg);
  }
  50% {
    transform: translateY(-10px) rotate(12deg);
  }
}

@keyframes float-delayed {
  0%,
  100% {
    transform: translateY(0) rotate(-6deg);
  }
  50% {
    transform: translateY(-15px) rotate(-6deg);
  }
}

.animate-float {
  animation: float 3s ease-in-out infinite;
}

.animate-float-delayed {
  animation: float-delayed 3s ease-in-out infinite;
  animation-delay: 0.5s;
}

.dark input {
  background-color: #1f2937;
  color: white;
}

.dark input::placeholder {
  color: #9ca3af;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
