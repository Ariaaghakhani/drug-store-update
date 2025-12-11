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
                    : currentStep === 'password'
                      ? 'ورود با رمز عبور'
                      : currentStep === 'otp'
                        ? 'ورود با کد تایید'
                        : 'تکمیل ثبت‌نام'
                }}
              </h2>
              <p class="text-gray-600 dark:text-gray-400">
                {{
                  currentStep === 'phone'
                    ? 'برای ادامه، شماره موبایل خود را وارد کنید'
                    : currentStep === 'password'
                      ? 'رمز عبور خود را وارد نمایید'
                      : currentStep === 'otp'
                        ? 'کد تایید ارسال شده را وارد نمایید'
                        : 'لطفا اطلاعات خود را تکمیل کنید'
                }}
              </p>
            </div>

            <!-- Step 1: Phone Number -->
            <div v-if="currentStep === 'phone'" class="space-y-6">
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
                    class="w-full px-4 py-4 pr-12 text-lg border-2 rounded-2xl focus:ring-4 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                    :class="{
                      'border-gray-300 dark:border-gray-600': !phoneError,
                      'border-red-500 dark:border-red-500': phoneError,
                    }"
                    @input="validatePhone"
                    @keyup.enter="handlePhoneSubmit"
                  />

                  <div
                    class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
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
                <span v-if="!isLoading">ادامه</span>
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

              <p class="text-sm text-center text-gray-600 dark:text-gray-400">
                ورود شما به معنای پذیرش
                <a
                  href="#"
                  class="text-teal-600 dark:text-teal-400 hover:underline"
                >
                  شرایط و قوانین
                </a>
                داروپلاس است.
              </p>
            </div>

            <!-- Step 2: Password Entry (for registered users) -->
            <div v-else-if="currentStep === 'password'" class="space-y-6">
              <div>
                <label
                  class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  رمز عبور
                </label>
                <div class="relative">
                  <input
                    v-model="loginPassword"
                    :type="showLoginPassword ? 'text' : 'password'"
                    placeholder="رمز عبور خود را وارد کنید"
                    class="w-full px-4 py-4 pl-12 text-lg border-2 rounded-2xl focus:ring-4 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                    :class="{
                      'border-gray-300 dark:border-gray-600': !passwordError,
                      'border-red-500 dark:border-red-500': passwordError,
                    }"
                    @keyup.enter="handlePasswordSubmit"
                  />
                  <button
                    type="button"
                    class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    @click="showLoginPassword = !showLoginPassword"
                  >
                    <svg
                      v-if="!showLoginPassword"
                      class="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                    <svg
                      v-else
                      class="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                      />
                    </svg>
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
                :disabled="isLoading || !loginPassword"
                class="w-full py-4 px-6 text-lg font-semibold text-white rounded-2xl focus:ring-4 focus:ring-teal-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] active:scale-[0.98]"
                style="
                  background: linear-gradient(135deg, #0d9488 0%, #06b6d4 100%);
                "
                @click="handlePasswordSubmit"
              >
                <span v-if="!isLoading">ورود</span>
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

              <!-- Switch to OTP and Forgot Password -->
              <div class="flex items-center justify-between gap-4 pt-2">
                <button
                  class="flex-1 py-3 px-4 text-sm font-medium text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/20 rounded-xl hover:bg-teal-100 dark:hover:bg-teal-900/30 transition-colors"
                  @click="switchToOtp"
                >
                  ورود با کد تایید
                </button>
                <button
                  class="flex-1 py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  @click="handleForgotPassword"
                >
                  فراموشی رمز عبور
                </button>
              </div>

              <button
                class="w-full py-3 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                @click="goBack"
              >
                بازگشت و ویرایش شماره
              </button>
            </div>

            <!-- Step 3: OTP Verification -->
            <div v-else-if="currentStep === 'otp'" class="space-y-6">
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
                  :disabled="isLoading"
                  class="text-sm text-teal-600 dark:text-teal-400 hover:underline disabled:opacity-50"
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
                <span v-if="!isLoading">تایید و ورود</span>
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

              <!-- Switch back to Password -->
              <button
                class="w-full py-3 px-4 text-sm font-medium text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/20 rounded-xl hover:bg-teal-100 dark:hover:bg-teal-900/30 transition-colors"
                @click="switchToPassword"
              >
                ورود با رمز عبور
              </button>

              <button
                class="w-full py-3 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                @click="goBack"
              >
                بازگشت و ویرایش شماره
              </button>
            </div>

            <!-- Step 4: Registration Form (for new users) -->
            <div v-else-if="currentStep === 'register'" class="space-y-6">
              <div class="space-y-4">
                <!-- Name -->
                <div>
                  <label
                    class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
                    نام و نام خانوادگی
                  </label>
                  <input
                    v-model="registerForm.name"
                    type="text"
                    placeholder="نام و نام خانوادگی خود را وارد کنید"
                    class="w-full px-4 py-3 text-lg border-2 rounded-2xl focus:ring-4 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
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
                  <div class="relative">
                    <input
                      v-model="registerForm.password"
                      :type="showPassword ? 'text' : 'password'"
                      placeholder="حداقل 8 کاراکتر"
                      class="w-full px-4 py-3 pl-12 text-lg border-2 rounded-2xl focus:ring-4 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
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
                      <svg
                        v-if="!showPassword"
                        class="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                      <svg
                        v-else
                        class="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                        />
                      </svg>
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
                  <div class="relative">
                    <input
                      v-model="registerForm.passwordConfirm"
                      :type="showPasswordConfirm ? 'text' : 'password'"
                      placeholder="رمز عبور خود را دوباره وارد کنید"
                      class="w-full px-4 py-3 pl-12 text-lg border-2 rounded-2xl focus:ring-4 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
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
                      <svg
                        v-if="!showPasswordConfirm"
                        class="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                      <svg
                        v-else
                        class="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                        />
                      </svg>
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
                :disabled="isLoading"
                class="w-full py-4 px-6 text-lg font-semibold text-white rounded-2xl focus:ring-4 focus:ring-teal-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] active:scale-[0.98]"
                style="
                  background: linear-gradient(135deg, #0d9488 0%, #06b6d4 100%);
                "
                @click="handleRegisterSubmit"
              >
                <span v-if="!isLoading">تکمیل ثبت‌نام</span>
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
                  در حال ثبت‌نام...
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

<script setup>
import { validatePhoneNumber, isValidPhoneNumber } from '@/utils/validations.js'

definePageMeta({
  layout: 'auth',
})

const app = useNuxtApp()
const router = useRouter()
const route = useRoute()
const toast = useToast()

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

const validateRegisterForm = () => {
  let isValid = true
  registerForm.value.errors = {
    name: '',
    password: '',
    passwordConfirm: '',
  }

  // Name validation
  if (!registerForm.value.name.trim()) {
    registerForm.value.errors.name = 'نام و نام خانوادگی الزامی است'
    isValid = false
  } else if (registerForm.value.name.trim().length < 3) {
    registerForm.value.errors.name = 'نام باید حداقل 3 کاراکتر باشد'
    isValid = false
  }

  // Password validation
  if (!registerForm.value.password) {
    registerForm.value.errors.password = 'رمز عبور الزامی است'
    isValid = false
  } else if (registerForm.value.password.length < 8) {
    registerForm.value.errors.password = 'رمز عبور باید حداقل 8 کاراکتر باشد'
    isValid = false
  } else if (!/(?=.*[a-zA-Z])(?=.*\d)/.test(registerForm.value.password)) {
    registerForm.value.errors.password = 'رمز عبور باید شامل حروف و اعداد باشد'
    isValid = false
  }

  // Password confirmation validation
  if (!registerForm.value.passwordConfirm) {
    registerForm.value.errors.passwordConfirm = 'تکرار رمز عبور الزامی است'
    isValid = false
  } else if (
    registerForm.value.password !== registerForm.value.passwordConfirm
  ) {
    registerForm.value.errors.passwordConfirm =
      'رمز عبور و تکرار آن مطابقت ندارند'
    isValid = false
  }

  return isValid
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
    phoneError.value = 'خطا در بررسی شماره موبایل. لطفا دوباره تلاش کنید.'
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
  if (!validateRegisterForm() || isLoading.value) return

  isLoading.value = true

  try {
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
