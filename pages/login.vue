<template>
  <div
    class="min-h-screen select-none flex items-center justify-center p-4 bg-gradient-to-br from-teal-50 to-cyan-100 dark:from-slate-900 dark:to-slate-800"
  >
    <div class="w-full max-w-4xl flex items-center justify-center">
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

        <!-- Left Side - Login Form -->
        <div
          class="w-full md:w-1/2 bg-white flex-auto h-full dark:bg-gray-800 p-8 md:p-12 flex flex-col justify-center content-between grow gap-y-8"
        >
          <UButton
            icon="i-heroicons-arrow-right-20-solid"
            variant="ghost"
            color="primary"
            class="self-start mb-4 !px-0"
            to="/"
          >
            بازگشت
          </UButton>
          <div class="flex-1 flex flex-col justify-center">
            <div class="text-center mb-8">
              <div
                class="inline-flex items-center justify-center w-16 h-16 bg-teal-100 dark:bg-teal-900/30 rounded-2xl mb-4"
              >
                <svg
                  class="w-8 h-8 text-teal-600 dark:text-teal-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
              </div>
              <h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {{
                  currentStep === 'phone'
                    ? 'ورود به داروپلاس'
                    : 'تایید شماره موبایل'
                }}
              </h2>
              <p class="text-gray-600 dark:text-gray-400">
                {{
                  currentStep === 'phone'
                    ? 'برای ادامه، شماره موبایل خود را وارد کنید'
                    : 'کد تایید ارسال شده را وارد نمایید'
                }}
              </p>
            </div>

            <div v-if="currentStep === 'phone'" class="space-y-6">
              <div class="relative mb-12">
                <!-- margin below to avoid overlap with next input -->
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
                    class="w-full px-4 py-4 pe-12 text-lg border-2 rounded-2xl focus:ring-4 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                    :class="{
                      'border-gray-300 dark:border-gray-600': !phoneError,
                      'border-red-500 dark:border-red-500': phoneError,
                    }"
                    @input="validatePhone"
                    @keyup.enter="handlePhoneSubmit"
                  />

                  <div
                    class="absolute end-4 top-1/2 -translate-y-1/2 text-gray-400"
                  >
                    <svg
                      class="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                </div>

                <!-- Reserve space for the error message -->
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
                :disabled="isLoading || !isValidPhone"
                class="w-full py-4 px-6 text-lg font-semibold text-white rounded-2xl focus:ring-4 focus:ring-teal-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] active:scale-[0.98]"
                style="
                  background: linear-gradient(135deg, #0d9488 0%, #06b6d4 100%);
                "
                @click="handlePhoneSubmit"
              >
                <span v-if="!isLoading">ورود / ثبت نام</span>
                <span v-else class="flex items-center justify-center gap-2">
                  <svg
                    class="animate-spin h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      class="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      stroke-width="4"
                    />
                    <path
                      class="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  در حال ارسال...
                </span>
              </button>

              <p class="text-sm text-center text-gray-600 dark:text-gray-400">
                ورود شما به معنای پذیرش
                <a
                  href="#"
                  class="text-teal-600 dark:text-teal-400 hover:underline"
                  >شرایط و قوانین</a
                >
                داروپلاس است.
              </p>
            </div>

            <div v-else-if="currentStep === 'otp'" class="space-y-6">
              <div
                class="p-4 rounded-xl"
                :class="
                  isNewUser
                    ? 'bg-blue-50 dark:bg-blue-900/20'
                    : 'bg-green-50 dark:bg-green-900/20'
                "
              >
                <p
                  class="text-sm text-center"
                  :class="
                    isNewUser
                      ? 'text-blue-700 dark:text-blue-300'
                      : 'text-green-700 dark:text-green-300'
                  "
                >
                  {{
                    isNewUser
                      ? '🎉 خوش آمدید! برای تکمیل ثبت‌نام کد را وارد کنید'
                      : '✅ کد تایید به شماره ' + phoneNumber + ' ارسال شد'
                  }}
                </p>
              </div>

              <div>
                <label
                  class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  کد تایید
                </label>
                <div class="flex gap-3 justify-center" dir="ltr">
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

              <div class="text-center">
                <p
                  v-if="resendTimer > 0"
                  class="text-sm text-gray-600 dark:text-gray-400"
                >
                  ارسال مجدد کد تا {{ resendTimer }} ثانیه دیگر
                </p>
                <button
                  v-else
                  class="text-sm text-teal-600 dark:text-teal-400 hover:underline"
                  @click="resendOtp"
                >
                  ارسال مجدد کد تایید
                </button>
              </div>

              <button
                :disabled="isLoading || !isValidOtp"
                class="w-full py-4 px-6 text-lg font-semibold text-white rounded-2xl focus:ring-4 focus:ring-teal-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] active:scale-[0.98]"
                style="
                  background: linear-gradient(135deg, #0d9488 0%, #06b6d4 100%);
                "
                @click="handleOtpSubmit"
              >
                <span v-if="!isLoading">{{
                  isNewUser ? 'تکمیل ثبت‌نام' : 'ورود'
                }}</span>
                <span v-else class="flex items-center justify-center gap-2">
                  <svg
                    class="animate-spin h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      class="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      stroke-width="4"
                    />
                    <path
                      class="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  در حال بررسی...
                </span>
              </button>

              <button
                class="w-full py-3 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                @click="goBack"
              >
                بازگشت و ویرایش شماره
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'LoginPage',
  setup() {
    definePageMeta({
      layout: 'auth',
    })
  },
  data() {
    return {
      currentStep: 'phone',
      phoneNumber: '',
      phoneError: '',
      isLoading: false,
      isNewUser: false,
      otpDigits: ['', '', '', '', ''],
      otpInputs: [],
      otpError: '',
      resendTimer: 0,
      resendInterval: null,
    }
  },
  computed: {
    isValidPhone() {
      return /^09\d{9}$/.test(this.phoneNumber)
    },
    isValidOtp() {
      return this.otpDigits.every((digit) => digit !== '')
    },
    otpCode() {
      return this.otpDigits.join('')
    },
  },
  beforeUnmount() {
    if (this.resendInterval) clearInterval(this.resendInterval)
  },
  methods: {
    validatePhone() {
      this.phoneError = ''
      if (this.phoneNumber.length === 0) return
      if (!this.phoneNumber.startsWith('09')) {
        this.phoneError = 'شماره موبایل باید با 09 شروع شود'
        return
      }
      if (this.phoneNumber.length > 0 && this.phoneNumber.length < 11) {
        this.phoneError = 'شماره موبایل باید 11 رقم باشد'
        return
      }
      if (
        this.phoneNumber.length === 11 &&
        !/^09\d{9}$/.test(this.phoneNumber)
      ) {
        this.phoneError = 'فرمت شماره موبایل صحیح نیست'
      }
    },
    async handlePhoneSubmit() {
      this.validatePhone()
      if (!this.isValidPhone || this.isLoading) return
      this.isLoading = true
      try {
        // TODO: Replace with your API call
        // const response = await fetch('/api/auth/send-otp', {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify({ phoneNumber: this.phoneNumber })
        // })
        // const data = await response.json()
        // this.isNewUser = data.isNewUser

        await new Promise((resolve) => setTimeout(resolve, 1500))
        this.isNewUser = Math.random() > 0.5

        this.currentStep = 'otp'
        this.startResendTimer()

        this.$nextTick(() => {
          if (this.otpInputs[0]) this.otpInputs[0].focus()
        })
      } catch {
        this.phoneError = 'خطا در ارسال کد تایید. لطفا دوباره تلاش کنید.'
      } finally {
        this.isLoading = false
      }
    },
    handleOtpInput(index, event) {
      const value = event.target.value
      if (value && !/^\d$/.test(value)) {
        this.otpDigits[index] = ''
        return
      }
      this.otpDigits[index] = value
      this.otpError = ''
      if (value && index < 5) {
        this.$nextTick(() => {
          if (this.otpInputs[index + 1]) this.otpInputs[index + 1].focus()
        })
      }
      if (this.isValidOtp) this.handleOtpSubmit()
    },
    handleOtpKeydown(index, event) {
      if (event.key === 'Backspace' && !this.otpDigits[index] && index > 0) {
        this.$nextTick(() => {
          if (this.otpInputs[index - 1]) this.otpInputs[index - 1].focus()
        })
      }
    },
    handleOtpPaste(event) {
      event.preventDefault()
      const pastedData = event.clipboardData.getData('text').trim()
      if (/^\d{6}$/.test(pastedData)) {
        this.otpDigits = pastedData.split('')
        this.$nextTick(() => {
          if (this.otpInputs[5]) this.otpInputs[5].focus()
        })
        if (this.isValidOtp) this.handleOtpSubmit()
      }
    },
    async handleOtpSubmit() {
      if (!this.isValidOtp || this.isLoading) return
      this.isLoading = true
      this.otpError = ''
      try {
        // TODO: Replace with your API call
        // const response = await fetch('/api/auth/verify-otp', {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify({
        //     phoneNumber: this.phoneNumber,
        //     otp: this.otpCode,
        //     isNewUser: this.isNewUser
        //   })
        // })
        // const data = await response.json()

        await new Promise((resolve) => setTimeout(resolve, 1500))

        // Set authentication
        const { login } = useAuth()
        login('token')

        console.log('✅ Success:', {
          phoneNumber: this.phoneNumber,
          otp: this.otpCode,
          isNewUser: this.isNewUser,
        })

        // Show success message
        const toast = useToast()
        toast.add({
          title: `${this.isNewUser ? 'ثبت‌نام' : 'ورود'} موفقیت‌آمیز بود!`,
          icon: 'i-heroicons-check-circle',
          color: 'green',
        })

        // Redirect to intended page or default
        const route = useRoute()
        const redirectTo = route.query.redirect || '/panel'
        this.$router.push(redirectTo)
      } catch {
        this.otpError = 'کد تایید نادرست است.'
      } finally {
        this.isLoading = false
      }
    },
    async resendOtp() {
      this.isLoading = true
      try {
        await new Promise((resolve) => setTimeout(resolve, 1000))
        this.startResendTimer()
        this.otpDigits = ['', '', '', '', '', '']
        this.otpError = ''
        this.$nextTick(() => {
          if (this.otpInputs[0]) this.otpInputs[0].focus()
        })
      } finally {
        this.isLoading = false
      }
    },
    startResendTimer() {
      this.resendTimer = 120
      if (this.resendInterval) clearInterval(this.resendInterval)
      this.resendInterval = setInterval(() => {
        this.resendTimer--
        if (this.resendTimer <= 0) clearInterval(this.resendInterval)
      }, 1000)
    },
    goBack() {
      this.currentStep = 'phone'
      this.otpDigits = ['', '', '', '', '', '']
      this.otpError = ''
      if (this.resendInterval) clearInterval(this.resendInterval)
    },
  },
}
</script>

<style scoped>
input[type='tel']::-webkit-outer-spin-button,
input[type='tel']::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
input[type='tel'] {
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
</style>
