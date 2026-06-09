<!-- pages/panel/profile.vue -->
<template>
  <div class="font-dana" dir="rtl">
    <div class="relative">
      <Transition name="sk">
        <!-- ─── Skeleton ─────────────────────────────────────────────────────── -->
        <div v-if="pending" key="sk" class="space-y-4">
          <!-- Avatar Hero skeleton -->
          <UCard>
            <div
              class="flex items-center gap-5 pb-5 border-b border-gray-100 dark:border-gray-800"
            >
              <USkeleton class="w-[72px] h-[72px] rounded-full flex-shrink-0" />
              <div class="space-y-2">
                <USkeleton class="h-5 w-32" />
                <USkeleton class="h-3 w-24" />
                <div class="flex gap-1.5 mt-1">
                  <USkeleton class="h-5 w-20 rounded-full" />
                  <USkeleton class="h-5 w-24 rounded-full" />
                </div>
              </div>
            </div>
            <div class="grid grid-cols-3 pt-5">
              <div class="text-center space-y-2">
                <USkeleton class="h-7 w-8 mx-auto" />
                <USkeleton class="h-3 w-12 mx-auto" />
              </div>
              <div
                class="text-center border-x border-gray-100 dark:border-gray-800 space-y-2"
              >
                <USkeleton class="h-7 w-8 mx-auto" />
                <USkeleton class="h-3 w-20 mx-auto" />
              </div>
              <div class="text-center space-y-2">
                <USkeleton class="h-7 w-8 mx-auto" />
                <USkeleton class="h-3 w-20 mx-auto" />
              </div>
            </div>
          </UCard>

          <!-- Personal Info skeleton -->
          <UCard :ui="{ body: 'p-0' }">
            <div
              class="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-gray-100 dark:border-gray-800"
            >
              <div class="flex items-center gap-2">
                <USkeleton class="w-4 h-4 rounded flex-shrink-0" />
                <USkeleton class="h-4 w-20" />
              </div>
              <USkeleton class="h-7 w-16 rounded-lg" />
            </div>
            <div class="divide-y divide-gray-100 dark:divide-gray-800">
              <div
                v-for="i in 4"
                :key="i"
                class="flex items-center gap-3 px-4 sm:px-6 py-4"
              >
                <USkeleton class="w-9 h-9 rounded-lg flex-shrink-0" />
                <div class="flex-1 space-y-1.5">
                  <USkeleton class="h-3 w-16" />
                  <USkeleton class="h-3.5 w-28" />
                </div>
              </div>
            </div>
          </UCard>

          <!-- Contact & Verification skeleton -->
          <UCard :ui="{ body: 'p-0' }">
            <div
              class="flex items-center gap-2 px-4 sm:px-6 py-4 border-b border-gray-100 dark:border-gray-800"
            >
              <USkeleton class="w-4 h-4 rounded flex-shrink-0" />
              <USkeleton class="h-4 w-32" />
            </div>
            <div class="divide-y divide-gray-100 dark:divide-gray-800">
              <div
                v-for="i in 2"
                :key="i"
                class="flex items-center gap-3 px-4 sm:px-6 py-4"
              >
                <USkeleton class="w-9 h-9 rounded-lg flex-shrink-0" />
                <div class="flex-1 space-y-1.5">
                  <USkeleton class="h-3.5 w-20" />
                  <USkeleton class="h-3 w-28" />
                </div>
                <div class="flex items-center gap-2 flex-shrink-0">
                  <USkeleton class="h-5 w-16 rounded-full" />
                  <USkeleton class="h-7 w-12 rounded-lg" />
                </div>
              </div>
              <div class="flex items-center justify-between px-4 sm:px-6 py-4">
                <div class="flex items-center gap-3">
                  <USkeleton class="w-9 h-9 rounded-lg flex-shrink-0" />
                  <div class="space-y-1.5">
                    <USkeleton class="h-3.5 w-28" />
                    <USkeleton class="h-3 w-36" />
                  </div>
                </div>
                <USkeleton class="h-6 w-11 rounded-full" />
              </div>
            </div>
          </UCard>
        </div>

        <!-- ─── Real Content ──────────────────────────────────────────────────── -->
        <div v-else key="content" class="space-y-4">
          <!-- ─── Avatar Hero + Stats ─────────────────────────────────────────── -->
          <UCard>
            <!-- Hero row -->
            <div
              class="flex items-center gap-5 pb-5 border-b border-gray-100 dark:border-gray-800"
            >
              <div class="relative flex-shrink-0">
                <div
                  class="w-[72px] h-[72px] rounded-full bg-brand-500/15 border-2 border-brand-500/30 flex items-center justify-center"
                >
                  <span class="text-2xl font-semibold text-brand-500">
                    {{ userInitials }}
                  </span>
                </div>
                <button
                  class="absolute bottom-0 end-0 w-[22px] h-[22px] rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center shadow-sm hover:border-brand-500 dark:hover:border-brand-400 group transition-colors"
                  @click="fileInput?.click()"
                >
                  <UIcon
                    name="i-heroicons-camera"
                    class="w-3 h-3 text-gray-400 group-hover:text-brand-500 dark:group-hover:text-brand-400 transition-colors"
                  />
                </button>
                <input
                  ref="fileInput"
                  type="file"
                  accept="image/*"
                  class="hidden"
                  @change="handleAvatarChange"
                />
              </div>

              <div>
                <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
                  {{ userFullName }}
                </h2>
                <p class="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                  عضو از {{ memberSince }}
                </p>
                <div class="flex gap-1.5 mt-2.5 flex-wrap">
                  <UBadge color="success" variant="subtle" size="sm">
                    حساب تأیید شده
                  </UBadge>
                  <UBadge color="warning" variant="subtle" size="sm">
                    کد ملی تأیید نشده
                  </UBadge>
                </div>
              </div>
            </div>

            <!-- Stats row -->
            <div class="grid grid-cols-3 pt-5">
              <div class="text-center">
                <p class="text-xl font-semibold text-brand-500">
                  {{ toPersian(stats.orders) }}
                </p>
                <p class="text-[11px] text-gray-400 dark:text-gray-500 mt-1">
                  سفارش‌ها
                </p>
              </div>
              <div
                class="text-center border-x border-gray-100 dark:border-gray-800"
              >
                <p class="text-xl font-semibold text-brand-500">
                  {{ toPersian(stats.addresses) }}
                </p>
                <p class="text-[11px] text-gray-400 dark:text-gray-500 mt-1">
                  آدرس‌های ذخیره‌شده
                </p>
              </div>
              <div class="text-center">
                <p class="text-xl font-semibold text-brand-500">
                  {{ toPersian(stats.prescriptions) }}
                </p>
                <p class="text-[11px] text-gray-400 dark:text-gray-500 mt-1">
                  داروهای نسخه‌ای
                </p>
              </div>
            </div>
          </UCard>

          <!-- ─── Personal Info ───────────────────────────────────────────────────── -->
          <UCard :ui="{ body: 'p-0' }">
            <div
              class="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-gray-100 dark:border-gray-800"
            >
              <div class="flex items-center gap-2">
                <UIcon
                  name="i-heroicons-user"
                  class="w-4 h-4 text-brand-500 flex-shrink-0"
                />
                <h3 class="text-sm font-medium text-gray-900 dark:text-white">
                  اطلاعات شخصی
                </h3>
              </div>
              <UButton
                variant="soft"
                color="neutral"
                size="lg"
                icon="i-heroicons-pencil-square"
                @click="showProfileModal = true"
                >ویرایش</UButton
              >
            </div>
            <div class="divide-y divide-gray-100 dark:divide-gray-800">
              <div class="flex items-center gap-3 px-4 sm:px-6 py-4">
                <div
                  :class="[
                    'w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0',
                    form.firstName || form.lastName
                      ? 'bg-brand-500/15'
                      : 'bg-warning/10',
                  ]"
                >
                  <UIcon
                    name="i-heroicons-user-circle"
                    :class="[
                      'w-5 h-5',
                      form.firstName || form.lastName
                        ? 'text-brand-500'
                        : 'text-warning',
                    ]"
                  />
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-[11px] text-gray-400 dark:text-gray-500">
                    نام و نام خانوادگی
                  </p>
                  <p
                    class="text-sm font-medium text-gray-900 dark:text-white mt-0.5"
                  >
                    {{
                      form.firstName || form.lastName
                        ? `${form.firstName} ${form.lastName}`.trim()
                        : 'تعیین نشده'
                    }}
                  </p>
                </div>
              </div>
              <div class="flex items-center gap-3 px-4 sm:px-6 py-4">
                <div
                  :class="[
                    'w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0',
                    form.nationalId ? 'bg-brand-500/15' : 'bg-warning/10',
                  ]"
                >
                  <UIcon
                    name="i-heroicons-identification"
                    :class="[
                      'w-5 h-5',
                      form.nationalId ? 'text-brand-500' : 'text-warning',
                    ]"
                  />
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-[11px] text-gray-400 dark:text-gray-500">
                    کد ملی
                  </p>
                  <p
                    class="text-sm font-medium text-gray-900 dark:text-white mt-0.5"
                  >
                    {{ form.nationalId || 'تعیین نشده' }}
                  </p>
                </div>
              </div>
              <div
                class="flex items-center gap-3 px-4 sm:px-6 py-4 border-b border-gray-100 dark:border-gray-800"
              >
                <div
                  :class="[
                    'w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0',
                    form.birthDate ? 'bg-brand-500/15' : 'bg-warning/10',
                  ]"
                >
                  <UIcon
                    name="i-heroicons-calendar-days"
                    :class="[
                      'w-5 h-5',
                      form.birthDate ? 'text-brand-500' : 'text-warning',
                    ]"
                  />
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-[11px] text-gray-400 dark:text-gray-500">
                    تاریخ تولد
                  </p>
                  <p
                    class="text-sm font-medium text-gray-900 dark:text-white mt-0.5"
                  >
                    {{ form.birthDate || 'تعیین نشده' }}
                  </p>
                </div>
              </div>
              <div class="flex items-center gap-3 px-4 sm:px-6 py-4">
                <div
                  :class="[
                    'w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0',
                    form.gender && form.gender !== 'unspecified'
                      ? 'bg-brand-500/15'
                      : 'bg-warning/10',
                  ]"
                >
                  <UIcon
                    name="i-heroicons-user"
                    :class="[
                      'w-5 h-5',
                      form.gender && form.gender !== 'unspecified'
                        ? 'text-brand-500'
                        : 'text-warning',
                    ]"
                  />
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-[11px] text-gray-400 dark:text-gray-500">
                    جنسیت
                  </p>
                  <p
                    class="text-sm font-medium text-gray-900 dark:text-white mt-0.5"
                  >
                    {{ genderLabel }}
                  </p>
                </div>
              </div>
            </div>
          </UCard>

          <!-- ─── Contact & Verification ────────────────────────────────────────── -->
          <UCard :ui="{ body: 'p-0' }">
            <div
              class="flex items-center gap-2 px-4 sm:px-6 py-4 border-b border-gray-100 dark:border-gray-800"
            >
              <UIcon
                name="i-heroicons-shield-check"
                class="w-4 h-4 text-brand-500 flex-shrink-0"
              />
              <h3 class="text-sm font-medium text-gray-900 dark:text-white">
                اطلاعات تماس و تأیید
              </h3>
            </div>

            <!-- Mobile — verified -->
            <div
              class="flex items-center gap-3 px-4 sm:px-6 py-4 border-b border-gray-100 dark:border-gray-800"
            >
              <div
                class="w-9 h-9 rounded-lg bg-brand-500/15 flex items-center justify-center flex-shrink-0"
              >
                <UIcon
                  name="i-heroicons-device-phone-mobile"
                  class="w-5 h-5 text-brand-500"
                />
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-gray-900 dark:text-white">
                  شماره موبایل
                </p>
                <p
                  dir="ltr"
                  class="text-xs text-gray-400 dark:text-gray-500 mt-0.5 text-right"
                >
                  0912•••6789
                </p>
              </div>
              <UButton
                variant="soft"
                color="neutral"
                size="lg"
                icon="i-heroicons-pencil-square"
                class="flex-shrink-0"
                @click="showPhoneModal = true"
                >ویرایش</UButton
              >
            </div>

            <!-- Email -->
            <div
              class="flex items-center gap-3 px-4 sm:px-6 py-4 border-b border-gray-100 dark:border-gray-800"
            >
              <div
                :class="['w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0', emailVerified ? 'bg-brand-500/15' : 'bg-warning/10']"
              >
                <UIcon
                  name="i-heroicons-envelope"
                  :class="['w-5 h-5', emailVerified ? 'text-brand-500' : 'text-warning']"
                />
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2">
                  <p class="text-sm font-medium text-gray-900 dark:text-white">ایمیل</p>
                  <UBadge :color="emailVerified ? 'success' : 'warning'" variant="subtle" size="sm">{{ emailVerified ? 'تأیید شده' : 'تأیید نشده' }}</UBadge>
                </div>
                <p dir="ltr" class="text-xs text-gray-400 dark:text-gray-500 mt-0.5 text-right">example@email.com</p>
              </div>
              <UButton
                :color="emailVerified ? 'neutral' : 'primary'"
                :variant="emailVerified ? 'soft' : undefined"
                size="lg"
                icon="i-heroicons-envelope"
                class="flex-shrink-0"
                @click="showEmailModal = true"
                >{{ emailVerified ? 'تغییر ایمیل' : 'ارسال لینک' }}</UButton
              >
            </div>

            <!-- SMS Notifications -->
            <div class="flex items-center justify-between px-4 sm:px-6 py-4">
              <div class="flex items-center gap-3">
                <div
                  :class="['w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors duration-300', preferences.smsNotifications ? 'bg-brand-500/15' : 'bg-gray-100 dark:bg-gray-800']"
                >
                  <UIcon
                    name="i-heroicons-chat-bubble-left-ellipsis"
                    :class="['w-5 h-5 transition-colors duration-300', preferences.smsNotifications ? 'text-brand-500' : 'text-gray-500 dark:text-gray-400']"
                  />
                </div>
                <div>
                  <p class="text-sm font-medium text-gray-900 dark:text-white">
                    اعلان‌های پیامکی
                  </p>
                  <p
                    class="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5"
                  >
                    وضعیت سفارش، تخفیف‌ها
                  </p>
                </div>
              </div>
              <USwitch
                v-model="preferences.smsNotifications"
                size="lg"
                :ui="{
                  base: 'data-[state=checked]:bg-brand-500 dark:data-[state=checked]:bg-brand-400 data-[state=unchecked]:bg-gray-300 dark:data-[state=unchecked]:bg-gray-600',
                }"
              />
            </div>
          </UCard>
        </div>
      </Transition>
    </div>

    <!-- ─── Phone Change Modal ──────────────────────────────────────────────── -->
    <UModal v-model:open="showPhoneModal" :ui="{ content: 'sm:max-w-md p-0 gap-0 overflow-hidden' }" :dismissible="false">
      <template #content>
        <div class="flex flex-col font-dana relative" dir="rtl">
          <!-- Header -->
          <div class="flex items-center gap-3 px-5 py-4 border-b border-gray-100 dark:border-gray-800 flex-shrink-0">
            <div class="w-8 h-8 rounded-lg bg-brand-500/15 flex items-center justify-center flex-shrink-0">
              <UIcon name="i-heroicons-device-phone-mobile" class="w-4 h-4 text-brand-500" />
            </div>
            <h3 class="flex-1 text-sm font-semibold text-gray-900 dark:text-white">تغییر شماره موبایل</h3>
            <button class="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" @click="requestPhoneCancel">
              <UIcon name="i-heroicons-x-mark" class="w-4 h-4" />
            </button>
          </div>

          <Transition name="overlay-fade" mode="out-in">

          <!-- Cancel confirmation -->
          <div v-if="showPhoneCancelConfirm" key="cancel" class="px-6 py-8 flex flex-col items-center gap-4">
            <div class="w-12 h-12 rounded-full bg-warning/10 flex items-center justify-center">
              <UIcon name="i-heroicons-exclamation-triangle" class="w-6 h-6 text-warning" />
            </div>
            <div class="text-center space-y-1">
              <h3 class="text-base font-bold text-gray-900 dark:text-white">لغو تغییر شماره؟</h3>
              <p class="text-sm text-gray-500 dark:text-gray-400">اگر الان خارج شوید، پیشرفت شما ذخیره نمی‌شود</p>
            </div>
            <div class="flex gap-3 w-full pt-1">
              <UButton color="neutral" variant="soft" class="flex-1 justify-center" @click="showPhoneCancelConfirm = false">ادامه تغییر</UButton>
              <UButton color="error" variant="soft" class="flex-1 justify-center" @click="closePhoneModal">لغو و بستن</UButton>
            </div>
          </div>

          <!-- Progress bar + Steps -->
          <div v-else key="steps">
          <div class="flex gap-1.5 px-5 pt-5 pb-1">
            <span v-for="i in 4" :key="i" :class="['h-0.5 flex-1 rounded-full transition-colors duration-300', phoneStep >= i ? 'bg-brand-500' : 'bg-gray-200 dark:bg-gray-700']" />
          </div>

          <div class="relative overflow-hidden">
            <Transition :name="phoneStepTransition" mode="out-in">
              <div :key="phoneStep" class="px-5 py-6 flex flex-col gap-4">

                <!-- Step 1: Confirm current phone -->
                <template v-if="phoneStep === 1">
                  <div class="w-12 h-12 rounded-full bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-500 mx-auto">
                    <UIcon name="i-heroicons-device-phone-mobile" class="w-6 h-6" />
                  </div>
                  <div class="text-center space-y-1">
                    <h3 class="text-base font-semibold text-gray-900 dark:text-white">تأیید شماره فعلی</h3>
                    <p class="text-xs text-gray-400 leading-relaxed">کد تأیید به شماره فعلی شما ارسال می‌شود</p>
                  </div>
                  <UInput model-value="۰۹۱۲***۶۷۸۹" readonly dir="ltr" size="md" class="w-full" :ui="{ base: 'text-center' }" />
                  <div class="flex gap-3">
                    <UButton variant="soft" color="neutral" class="flex-1 justify-center" @click="requestPhoneCancel">انصراف</UButton>
                    <UButton color="primary" class="flex-1 justify-center" @click="advancePhoneStep">ارسال کد تأیید</UButton>
                  </div>
                </template>

                <!-- Step 2: OTP for current phone -->
                <template v-else-if="phoneStep === 2">
                  <div class="text-center space-y-1">
                    <h3 class="text-base font-semibold text-gray-900 dark:text-white">کد تأیید</h3>
                    <p class="text-xs text-gray-400 leading-relaxed">کد ارسال شده به ۰۹۱۲***۶۷۸۹ را وارد کنید</p>
                  </div>
                  <div class="flex justify-center gap-2" dir="ltr">
                    <input v-for="(_, idx) in phoneOldOtp" :key="idx" :ref="(el) => { phoneOldOtpRefs[idx] = el }" :value="phoneOldOtp[idx]" type="text" inputmode="numeric" maxlength="1" class="w-12 h-14 text-center text-xl font-semibold border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-colors" @input="handleOldOtpInput(idx, $event)" @keydown="handleOldOtpKeydown(idx, $event)" />
                  </div>
                  <p class="text-center text-sm">
                    <button :disabled="phoneResendCountdown > 0" :class="['font-medium transition-colors', phoneResendCountdown > 0 ? 'text-gray-400 dark:text-gray-500 cursor-not-allowed' : 'text-brand-500 hover:text-brand-600 dark:hover:text-brand-400']" @click="phoneResendCountdown === 0 && startPhoneResend()">
                      {{ phoneResendCountdown > 0 ? `ارسال مجدد (${formattedPhoneCountdown})` : 'ارسال مجدد' }}
                    </button>
                  </p>
                  <div class="flex gap-3">
                    <UButton variant="soft" color="neutral" class="flex-1 justify-center" @click="retreatPhoneStep">بازگشت</UButton>
                    <UButton color="primary" class="flex-1 justify-center" @click="advancePhoneStep">تأیید و ادامه</UButton>
                  </div>
                </template>

                <!-- Step 3: New phone number -->
                <template v-else-if="phoneStep === 3">
                  <div class="w-12 h-12 rounded-full bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-500 mx-auto">
                    <UIcon name="i-heroicons-device-phone-mobile" class="w-6 h-6" />
                  </div>
                  <div class="text-center space-y-1">
                    <h3 class="text-base font-semibold text-gray-900 dark:text-white">شماره جدید</h3>
                    <p class="text-xs text-gray-400 leading-relaxed">شماره موبایل جدید خود را وارد کنید</p>
                  </div>
                  <UInput v-model="newPhone" dir="ltr" placeholder="09xxxxxxxxx" maxlength="11" size="md" class="w-full" :ui="{ base: 'text-center' }" />
                  <div class="flex gap-3">
                    <UButton variant="soft" color="neutral" class="flex-1 justify-center" @click="retreatPhoneStep">بازگشت</UButton>
                    <UButton color="primary" class="flex-1 justify-center" :disabled="newPhone.length < 11" @click="advancePhoneStep">ارسال کد تأیید</UButton>
                  </div>
                </template>

                <!-- Step 4: OTP for new phone -->
                <template v-else-if="phoneStep === 4">
                  <div class="text-center space-y-1">
                    <h3 class="text-base font-semibold text-gray-900 dark:text-white">تأیید شماره جدید</h3>
                    <p class="text-xs text-gray-400 leading-relaxed">کد ارسال شده به {{ newPhone }} را وارد کنید</p>
                  </div>
                  <div class="flex justify-center gap-2" dir="ltr">
                    <input v-for="(_, idx) in phoneNewOtp" :key="idx" :ref="(el) => { phoneNewOtpRefs[idx] = el }" :value="phoneNewOtp[idx]" type="text" inputmode="numeric" maxlength="1" class="w-12 h-14 text-center text-xl font-semibold border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-colors" @input="handleNewOtpInput(idx, $event)" @keydown="handleNewOtpKeydown(idx, $event)" />
                  </div>
                  <p class="text-center text-sm">
                    <button :disabled="phoneResendCountdown > 0" :class="['font-medium transition-colors', phoneResendCountdown > 0 ? 'text-gray-400 dark:text-gray-500 cursor-not-allowed' : 'text-brand-500 hover:text-brand-600 dark:hover:text-brand-400']" @click="phoneResendCountdown === 0 && startPhoneResend()">
                      {{ phoneResendCountdown > 0 ? `ارسال مجدد (${formattedPhoneCountdown})` : 'ارسال مجدد' }}
                    </button>
                  </p>
                  <div class="flex gap-3">
                    <UButton variant="soft" color="neutral" class="flex-1 justify-center" @click="retreatPhoneStep">بازگشت</UButton>
                    <UButton color="primary" class="flex-1 justify-center" @click="advancePhoneStep">تأیید و ذخیره</UButton>
                  </div>
                </template>

                <!-- Step 5: Success -->
                <template v-else-if="phoneStep === 5">
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
                    <UButton color="primary" block @click="closePhoneModal">متوجه شدم</UButton>
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

    <!-- ─── Email Verification Modal ──────────────────────────────────────────── -->
    <UModal v-model:open="showEmailModal" :ui="{ content: 'sm:max-w-md p-0 gap-0 overflow-hidden' }">
      <template #content>
        <div class="flex flex-col font-dana" dir="rtl">
          <!-- Header -->
          <div class="flex items-center gap-3 px-5 py-4 border-b border-gray-100 dark:border-gray-800">
            <div class="w-8 h-8 rounded-lg bg-brand-500/15 flex items-center justify-center flex-shrink-0">
              <UIcon name="i-heroicons-envelope" class="w-4 h-4 text-brand-500" />
            </div>
            <h3 class="flex-1 text-sm font-semibold text-gray-900 dark:text-white">تأیید آدرس ایمیل</h3>
            <button class="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" @click="closeEmailModal">
              <UIcon name="i-heroicons-x-mark" class="w-4 h-4" />
            </button>
          </div>

          <!-- Unsent state -->
          <Transition name="step-forward" mode="out-in">
            <div v-if="!emailLinkSent" key="unsent" class="px-5 py-5 space-y-4">
              <p class="text-xs text-gray-500 dark:text-gray-400 text-center leading-relaxed">یک لینک تأیید به آدرس زیر ارسال می‌شود</p>
              <UInput v-model="emailAddress" dir="ltr" placeholder="example@email.com" size="md" class="w-full" />
              <div class="flex gap-3 pt-1">
                <UButton variant="soft" color="neutral" class="flex-1 justify-center" @click="closeEmailModal">انصراف</UButton>
                <UButton color="primary" class="flex-1 justify-center" icon="i-heroicons-paper-airplane" :loading="emailSending" :disabled="!emailAddress" @click="sendEmailLink">ارسال لینک تأیید</UButton>
              </div>
            </div>

            <!-- Sent state -->
            <div v-else key="sent" class="px-5 py-5 space-y-4 text-center">
              <div class="flex justify-center">
                <div class="w-16 h-16 rounded-full bg-success/15 flex items-center justify-center pop-in">
                  <UIcon name="i-heroicons-paper-airplane" class="w-8 h-8 text-success" />
                </div>
              </div>
              <div class="space-y-1.5">
                <h3 class="text-base font-semibold text-gray-900 dark:text-white">لینک ارسال شد</h3>
                <p class="text-xs text-gray-400 leading-relaxed">ایمیل تأیید به <span class="font-mono" dir="ltr">example@email.com</span> ارسال شد</p>
              </div>
              <UButton color="primary" block @click="closeEmailModal">متوجه شدم</UButton>
            </div>
          </Transition>
        </div>
      </template>
    </UModal>

    <!-- ─── Edit Profile Modal ───────────────────────────────────────────────── -->
    <UModal
      v-model:open="showProfileModal"
      :ui="{ content: 'sm:max-w-md p-0 gap-0 overflow-hidden' }"
      :dismissible="false"
    >
      <template #content>
        <div class="flex flex-col font-dana" dir="rtl">
          <!-- Header -->
          <div
            class="flex items-center gap-3 px-5 py-4 border-b border-gray-100 dark:border-gray-800"
          >
            <div
              class="w-8 h-8 rounded-lg bg-brand-500/15 flex items-center justify-center flex-shrink-0"
            >
              <UIcon name="i-heroicons-user" class="w-4 h-4 text-brand-500" />
            </div>
            <h3
              class="flex-1 text-sm font-semibold text-gray-900 dark:text-white"
            >
              ویرایش اطلاعات شخصی
            </h3>
            <button
              class="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              @click="closeProfileModal"
            >
              <UIcon name="i-heroicons-x-mark" class="w-4 h-4" />
            </button>
          </div>

          <!-- Form fields -->
          <div class="px-5 py-5 space-y-4">
            <div class="grid grid-cols-2 gap-3">
              <UFormField label="نام" name="firstName">
                <UInput
                  v-model="modalForm.firstName"
                  placeholder="نام"
                  class="w-full"
                />
              </UFormField>
              <UFormField label="نام خانوادگی" name="lastName">
                <UInput
                  v-model="modalForm.lastName"
                  placeholder="نام خانوادگی"
                  class="w-full"
                />
              </UFormField>
            </div>
            <UFormField label="کد ملی" name="nationalId">
              <UInput
                v-model="modalForm.nationalId"
                dir="ltr"
                placeholder="0000000000"
                maxlength="10"
                class="w-full"
              />
            </UFormField>
            <UFormField label="تاریخ تولد" name="birthDate">
              <UInput
                v-model="modalForm.birthDate"
                dir="ltr"
                placeholder="1370/01/01"
                class="w-full"
              />
            </UFormField>
            <UFormField label="جنسیت" name="gender" class="*:font-dana">
              <USelect
                v-model="modalForm.gender"
                :items="genderOptions"
                class="w-full *:font-dana"
              />
            </UFormField>
          </div>

          <!-- Footer -->
          <div
            class="flex items-center justify-end gap-2 px-5 py-4 border-t border-gray-100 dark:border-gray-800"
          >
            <UButton
              variant="soft"
              color="neutral"
              size="lg"
              @click="closeProfileModal"
              >انصراف</UButton
            >
            <UButton
              color="primary"
              size="lg"
              :loading="isLoading"
              :disabled="!modalHasChanges"
              @click="saveProfile"
              >ذخیره تغییرات</UButton
            >
          </div>
        </div>
      </template>
    </UModal>
  </div>
</template>

<script setup>
const app = useNuxtApp()
const userStore = useUserStore()
const toast = useToast()

const fileInput = ref(null)
const isLoading = ref(false)
const pending = ref(true)

// ── User identity ──────────────────────────────────────────────────────────
const userFullName = computed(() => {
  const user = userStore.currentUser || app.$auth?.user
  if (!user?.person) return 'کاربر مهمان'
  return (
    `${user.person.firstName || ''} ${user.person.lastName || ''}`.trim() ||
    'کاربر'
  )
})

const userInitials = computed(() => {
  const user = userStore.currentUser || app.$auth?.user
  if (!user?.person) return 'ک'
  const first = user.person.firstName?.[0] || ''
  const last = user.person.lastName?.[0] || ''
  return first + last || 'ک'
})

const memberSince = 'اردیبهشت ۱۴۰۳'

const stats = { orders: 12, addresses: 3, prescriptions: 8 }

const toPersian = (n) => n.toLocaleString('fa-IR')

// ── Form ───────────────────────────────────────────────────────────────────
const form = ref({
  firstName: '',
  lastName: '',
  nationalId: '',
  birthDate: '',
  gender: 'unspecified',
})

const loadUserData = () => {
  const user = userStore.currentUser || app.$auth?.user
  if (user?.person) {
    form.value = {
      firstName: user.person.firstName || '',
      lastName: user.person.lastName || '',
      nationalId: user.person.nationalId || '',
      birthDate: user.person.birthDate || '',
      gender: user.person.gender || 'unspecified',
    }
  } else {
    form.value = {
      firstName: 'آریا',
      lastName: 'آقاخانی',
      nationalId: '',
      birthDate: '',
      gender: 'unspecified',
    }
  }
}

const genderLabel = computed(() => {
  if (!form.value.gender || form.value.gender === 'unspecified')
    return 'تعیین نشده'
  return (
    genderOptions.find((o) => o.value === form.value.gender)?.label ||
    'تعیین نشده'
  )
})

// ── Edit profile modal ─────────────────────────────────────────────────────
const showProfileModal = ref(false)
const modalForm = ref({
  firstName: '',
  lastName: '',
  nationalId: '',
  birthDate: '',
  gender: 'unspecified',
})

const modalHasChanges = computed(() =>
  Object.keys(modalForm.value).some((k) => modalForm.value[k] !== form.value[k])
)

watch(showProfileModal, (open) => {
  if (open) modalForm.value = { ...form.value }
})

const closeProfileModal = () => {
  showProfileModal.value = false
}

const saveProfile = async () => {
  isLoading.value = true
  try {
    await new Promise((r) => setTimeout(r, 800))
    form.value = { ...modalForm.value }
    showProfileModal.value = false
    toast.add({
      title: 'موفق',
      description: 'اطلاعات شما با موفقیت به‌روزرسانی شد',
      color: 'success',
    })
  } catch {
    toast.add({
      title: 'خطا',
      description: 'مشکلی در به‌روزرسانی اطلاعات پیش آمد',
      color: 'error',
    })
  } finally {
    isLoading.value = false
  }
}

// ── Phone change modal ─────────────────────────────────────────────────────
const showPhoneModal = ref(false)
const showPhoneCancelConfirm = ref(false)
const phoneStep = ref(1)
const phoneStepTransition = ref('step-forward')
const newPhone = ref('')
const phoneOldOtp = ref(['', '', '', '', ''])
const phoneNewOtp = ref(['', '', '', '', ''])
const phoneOldOtpRefs = []
const phoneNewOtpRefs = []
const phoneResendCountdown = ref(0)
let phoneResendTimer = null

const formattedPhoneCountdown = computed(() => phoneResendCountdown.value.toLocaleString('fa-IR'))

const startPhoneResend = () => {
  phoneResendCountdown.value = 60
  clearInterval(phoneResendTimer)
  phoneResendTimer = setInterval(() => {
    if (phoneResendCountdown.value > 0) phoneResendCountdown.value--
    else clearInterval(phoneResendTimer)
  }, 1000)
}

const advancePhoneStep = () => {
  phoneStepTransition.value = 'step-forward'
  const next = phoneStep.value + 1
  if (next === 2 || next === 4) startPhoneResend()
  phoneStep.value = next
}

const retreatPhoneStep = () => {
  phoneStepTransition.value = 'step-backward'
  phoneStep.value--
}

const requestPhoneCancel = () => {
  if (phoneStep.value === 5) closePhoneModal()
  else showPhoneCancelConfirm.value = true
}

const closePhoneModal = () => {
  showPhoneModal.value = false
  showPhoneCancelConfirm.value = false
  setTimeout(() => {
    phoneStep.value = 1
    phoneStepTransition.value = 'step-forward'
    newPhone.value = ''
    phoneOldOtp.value = ['', '', '', '', '']
    phoneNewOtp.value = ['', '', '', '', '']
    clearInterval(phoneResendTimer)
    phoneResendCountdown.value = 0
  }, 300)
}

const handleOldOtpInput = (idx, event) => {
  const val = event.target.value.replace(/\D/g, '').slice(-1)
  phoneOldOtp.value[idx] = val
  if (val && idx < 4) nextTick(() => phoneOldOtpRefs[idx + 1]?.focus())
}
const handleOldOtpKeydown = (idx, event) => {
  if (event.key === 'Backspace' && !phoneOldOtp.value[idx] && idx > 0)
    nextTick(() => phoneOldOtpRefs[idx - 1]?.focus())
}
const handleNewOtpInput = (idx, event) => {
  const val = event.target.value.replace(/\D/g, '').slice(-1)
  phoneNewOtp.value[idx] = val
  if (val && idx < 4) nextTick(() => phoneNewOtpRefs[idx + 1]?.focus())
}
const handleNewOtpKeydown = (idx, event) => {
  if (event.key === 'Backspace' && !phoneNewOtp.value[idx] && idx > 0)
    nextTick(() => phoneNewOtpRefs[idx - 1]?.focus())
}

// ── Email verification modal ───────────────────────────────────────────────
const showEmailModal = ref(false)
const emailLinkSent = ref(false)
const emailSending = ref(false)
const emailVerified = ref(false)
const emailAddress = ref('')

const closeEmailModal = () => {
  showEmailModal.value = false
  setTimeout(() => { emailLinkSent.value = false }, 300)
}

const sendEmailLink = async () => {
  emailSending.value = true
  await new Promise((r) => setTimeout(r, 800))
  emailSending.value = false
  emailLinkSent.value = true
}

const handleAvatarChange = (event) => {
  const file = event.target.files?.[0]
  if (file) {
    toast.add({
      title: 'تصویر انتخاب شد',
      description: 'آپلود تصویر پروفایل به زودی فعال خواهد شد',
      color: 'primary',
    })
  }
}

// ── Preferences ────────────────────────────────────────────────────────────
const preferences = reactive({ smsNotifications: true })

const genderOptions = [
  { label: 'انتخاب کنید', value: 'unspecified' },
  { label: 'مرد', value: 'male' },
  { label: 'زن', value: 'female' },
]

onMounted(async () => {
  await new Promise((r) => setTimeout(r, 600))
  loadUserData()
  pending.value = false
})

onUnmounted(() => clearInterval(phoneResendTimer))

useHead({ title: 'پروفایل | پنل کاربری' })
</script>

<style scoped>
.sk-enter-active { transition: opacity 0.25s ease; }
.sk-leave-active { transition: opacity 0.25s ease; position: absolute; inset: 0; }
.sk-enter-from, .sk-leave-to { opacity: 0; }

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
