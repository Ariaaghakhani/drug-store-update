<!-- pages/panel/security.vue -->
<template>
  <div class="font-dana" dir="rtl">
    <div class="relative">
      <Transition name="sk">
        <!-- ─── Skeleton ─────────────────────────────────────────────────────── -->
        <div v-if="pending" key="sk" class="space-y-4">
          <UCard :ui="{ body: 'p-0' }">
            <div class="flex items-center gap-2 px-4 sm:px-6 py-4 border-b border-gray-100 dark:border-gray-800">
              <USkeleton class="w-4 h-4 rounded flex-shrink-0" />
              <USkeleton class="h-4 w-28" />
            </div>
            <div class="divide-y divide-gray-100 dark:divide-gray-800">
              <div v-for="i in 3" :key="i" class="flex items-center justify-between px-4 sm:px-6 py-4">
                <div class="flex items-center gap-3">
                  <USkeleton class="w-9 h-9 rounded-lg flex-shrink-0" />
                  <div class="space-y-1.5">
                    <USkeleton class="h-3.5 w-28" />
                    <USkeleton class="h-3 w-40" />
                  </div>
                </div>
                <USkeleton class="h-8 w-16 rounded-lg" />
              </div>
            </div>
          </UCard>

          <UCard :ui="{ body: 'p-0' }">
            <div class="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-gray-100 dark:border-gray-800">
              <div class="flex items-center gap-2">
                <USkeleton class="w-4 h-4 rounded flex-shrink-0" />
                <USkeleton class="h-4 w-20" />
              </div>
              <USkeleton class="h-7 w-36 rounded-lg" />
            </div>
            <div class="divide-y divide-gray-100 dark:divide-gray-800">
              <div v-for="i in 3" :key="i" class="flex items-center gap-3 px-4 sm:px-6 py-4">
                <USkeleton class="w-9 h-9 rounded-lg flex-shrink-0" />
                <div class="flex-1 space-y-1.5">
                  <USkeleton class="h-3.5 w-28" />
                  <USkeleton class="h-3 w-40" />
                  <USkeleton class="h-3 w-32" />
                </div>
                <div class="flex flex-col items-end gap-1.5">
                  <USkeleton class="h-3 w-16" />
                  <USkeleton class="h-7 w-20 rounded-lg" />
                </div>
              </div>
            </div>
          </UCard>

          <UCard :ui="{ body: 'p-0' }">
            <div class="flex items-center gap-2 px-4 sm:px-6 py-4 border-b border-gray-100 dark:border-gray-800">
              <USkeleton class="w-4 h-4 rounded flex-shrink-0" />
              <USkeleton class="h-4 w-24" />
            </div>
            <div class="divide-y divide-gray-100 dark:divide-gray-800">
              <div v-for="i in 4" :key="i" class="flex items-center gap-3 px-4 sm:px-6 py-4">
                <USkeleton class="w-2 h-2 rounded-full flex-shrink-0" />
                <div class="flex-1 space-y-1.5">
                  <USkeleton class="h-3.5 w-24" />
                  <USkeleton class="h-3 w-44" />
                </div>
                <USkeleton class="h-3 w-20 flex-shrink-0" />
              </div>
            </div>
          </UCard>

          <UCard :ui="{ body: 'p-0' }">
            <div class="flex items-center gap-2 px-4 sm:px-6 py-4 border-b border-gray-100 dark:border-gray-800">
              <USkeleton class="w-4 h-4 rounded flex-shrink-0" />
              <USkeleton class="h-4 w-28" />
            </div>
            <div class="divide-y divide-gray-100 dark:divide-gray-800">
              <div v-for="i in 3" :key="i" class="flex items-center justify-between px-4 sm:px-6 py-4">
                <div class="space-y-1.5">
                  <USkeleton class="h-3.5 w-36" />
                  <USkeleton class="h-3 w-56" />
                </div>
                <USkeleton class="h-6 w-11 rounded-full" />
              </div>
            </div>
          </UCard>

          <UCard :ui="{ body: 'p-0' }">
            <div class="flex items-center gap-2 px-4 sm:px-6 py-4 border-b border-gray-100 dark:border-gray-800">
              <USkeleton class="w-4 h-4 rounded flex-shrink-0" />
              <USkeleton class="h-4 w-20" />
            </div>
            <div class="divide-y divide-gray-100 dark:divide-gray-800">
              <div v-for="i in 2" :key="i" class="flex items-center justify-between px-4 sm:px-6 py-4">
                <div class="space-y-1.5">
                  <USkeleton class="h-3.5 w-36" />
                  <USkeleton class="h-3 w-64" />
                </div>
                <USkeleton class="h-9 w-24 rounded-lg" />
              </div>
            </div>
          </UCard>
        </div>

        <!-- ─── Real Content ──────────────────────────────────────────────────── -->
        <div v-else key="content" class="space-y-4">

          <!-- ─── Unified Auth Card ─────────────────────────────────────────── -->
          <UCard :ui="{ body: 'p-0' }">
            <div class="flex items-center gap-2 px-4 sm:px-6 py-4 border-b border-gray-100 dark:border-gray-800">
              <UIcon name="i-heroicons-shield-check" class="w-4 h-4 text-brand-500 flex-shrink-0" />
              <h3 class="text-sm font-medium text-gray-900 dark:text-white">احراز هویت</h3>
            </div>

            <!-- Row 1: Password -->
            <div class="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-gray-100 dark:border-gray-800">
              <div class="flex items-center gap-3">
                <div class="w-9 h-9 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0">
                  <UIcon name="i-heroicons-lock-closed" class="w-5 h-5 text-gray-500 dark:text-gray-400" />
                </div>
                <div>
                  <p class="text-sm font-medium text-gray-900 dark:text-white">رمز عبور</p>
                  <p class="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">آخرین تغییر: ۵ روز پیش</p>
                </div>
              </div>
              <UButton variant="ghost" color="neutral" size="sm" @click="showPasswordModal = true">تغییر</UButton>
            </div>

            <!-- Row 2: Authenticator App -->
            <div class="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-gray-100 dark:border-gray-800">
              <div class="flex items-center gap-3">
                <div :class="['w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0', twoFAEnabled ? 'bg-brand-500/15' : 'bg-gray-100 dark:bg-gray-800']">
                  <UIcon
                    name="i-heroicons-device-phone-mobile"
                    :class="['w-5 h-5', twoFAEnabled ? 'text-brand-500' : 'text-gray-500 dark:text-gray-400']"
                  />
                </div>
                <div>
                  <p class="text-sm font-medium text-gray-900 dark:text-white">اپلیکیشن احراز هویت</p>
                  <p :class="['text-[11px] mt-0.5', twoFAEnabled ? 'text-brand-500 dark:text-brand-400' : 'text-gray-400 dark:text-gray-500']">
                    {{ twoFAEnabled ? 'فعال — Google Authenticator' : 'غیرفعال' }}
                  </p>
                </div>
              </div>
              <UButton v-if="twoFAEnabled" variant="ghost" color="primary" size="sm" @click="show2FAModal = true">مدیریت</UButton>
              <UButton v-else color="primary" size="sm" @click="show2FAModal = true">فعال‌سازی</UButton>
            </div>

            <!-- Row 3: SMS Toggle -->
            <div class="flex items-center justify-between px-4 sm:px-6 py-4">
              <div class="flex items-center gap-3">
                <div class="w-9 h-9 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0">
                  <UIcon name="i-heroicons-chat-bubble-left" class="w-5 h-5 text-gray-500 dark:text-gray-400" />
                </div>
                <div>
                  <p class="text-sm font-medium text-gray-900 dark:text-white">تأیید پیامکی</p>
                  <p class="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">۰۹۱۲***۴۵۶</p>
                </div>
              </div>
              <USwitch v-model="smsEnabled" size="lg" :ui="switchUi" />
            </div>
          </UCard>

          <!-- ─── Active Sessions ─────────────────────────────────────────────── -->
          <UCard :ui="{ body: 'p-0' }">
            <div class="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-gray-100 dark:border-gray-800">
              <div class="flex items-center gap-2">
                <UIcon name="i-heroicons-computer-desktop" class="w-4 h-4 text-brand-500 flex-shrink-0" />
                <h3 class="text-sm font-medium text-gray-900 dark:text-white">جلسات فعال</h3>
              </div>
              <UButton variant="ghost" color="error" size="xs" icon="i-heroicons-arrow-right-on-rectangle" @click="revokeAllSessions">
                خروج از همه دستگاه‌ها
              </UButton>
            </div>
            <div class="divide-y divide-gray-100 dark:divide-gray-800">
              <div
                v-for="session in activeSessions"
                :key="session.id"
                :class="['flex items-center gap-3 px-4 sm:px-6 py-4', session.current && 'bg-brand-500/5 dark:bg-brand-500/10']"
              >
                <div :class="['w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0', session.current ? 'bg-brand-500/15 text-brand-500' : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400']">
                  <UIcon :name="session.icon" class="w-5 h-5" />
                </div>
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2">
                    <p class="text-sm font-medium text-gray-900 dark:text-white">{{ session.device }}</p>
                    <UBadge v-if="session.current" color="primary" variant="subtle" size="xs">فعلی</UBadge>
                  </div>
                  <p class="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">{{ session.browser }}</p>
                  <p class="text-[11px] text-gray-400 dark:text-gray-500">{{ session.location }} · {{ session.ip }}</p>
                </div>
                <div class="flex-shrink-0 flex flex-col items-end gap-1.5">
                  <p class="text-[11px] text-gray-400 dark:text-gray-500">{{ session.lastActive }}</p>
                  <UButton v-if="!session.current" variant="ghost" color="error" size="xs">لغو دسترسی</UButton>
                </div>
              </div>
            </div>
          </UCard>

          <!-- ─── Login History ───────────────────────────────────────────────── -->
          <UCard :ui="{ body: 'p-0' }">
            <div class="flex items-center gap-2 px-4 sm:px-6 py-4 border-b border-gray-100 dark:border-gray-800">
              <UIcon name="i-heroicons-clock" class="w-4 h-4 text-brand-500 flex-shrink-0" />
              <h3 class="text-sm font-medium text-gray-900 dark:text-white">تاریخچه ورود</h3>
            </div>
            <div class="divide-y divide-gray-100 dark:divide-gray-800">
              <div v-for="entry in loginHistory" :key="entry.id" class="flex items-center gap-3 px-4 sm:px-6 py-4">
                <div :class="['w-2 h-2 rounded-full flex-shrink-0', entry.success ? 'bg-brand-500' : 'bg-[var(--color-danger)]']" />
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2 flex-wrap">
                    <p class="text-sm font-medium text-gray-900 dark:text-white">{{ entry.action }}</p>
                    <UBadge v-if="entry.suspicious" color="error" variant="subtle" size="xs">مشکوک</UBadge>
                  </div>
                  <p class="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">{{ entry.device }} · {{ entry.ip }}</p>
                </div>
                <p class="text-[11px] text-gray-400 dark:text-gray-500 flex-shrink-0">{{ entry.time }}</p>
              </div>
            </div>
          </UCard>

          <!-- ─── Security Notifications ──────────────────────────────────────── -->
          <UCard :ui="{ body: 'p-0' }">
            <div class="flex items-center gap-2 px-4 sm:px-6 py-4 border-b border-gray-100 dark:border-gray-800">
              <UIcon name="i-heroicons-bell" class="w-4 h-4 text-brand-500 flex-shrink-0" />
              <h3 class="text-sm font-medium text-gray-900 dark:text-white">اعلان‌های امنیتی</h3>
            </div>
            <div class="divide-y divide-gray-100 dark:divide-gray-800">
              <div v-for="notif in securityNotifications" :key="notif.id" class="flex items-center justify-between px-4 sm:px-6 py-4">
                <div>
                  <p class="text-sm font-medium text-gray-900 dark:text-white">{{ notif.label }}</p>
                  <p class="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">{{ notif.description }}</p>
                </div>
                <USwitch v-model="notif.enabled" size="lg" :ui="switchUi" />
              </div>
            </div>
          </UCard>

          <!-- ─── Danger Zone ─────────────────────────────────────────────────── -->
          <UCard :ui="{ body: 'p-0' }" class="ring-1 ring-[var(--color-danger)]/25 dark:ring-[var(--color-danger)]/20">
            <div class="flex items-center gap-2 px-4 sm:px-6 py-4 border-b border-gray-100 dark:border-gray-800">
              <UIcon name="i-heroicons-exclamation-triangle" class="w-4 h-4 flex-shrink-0" style="color: var(--color-danger)" />
              <h3 class="text-sm font-medium" style="color: var(--color-danger)">منطقه خطر</h3>
            </div>
            <div class="divide-y divide-gray-100 dark:divide-gray-800">
              <div class="flex items-center justify-between px-4 sm:px-6 py-4">
                <div>
                  <p class="text-sm font-medium text-gray-900 dark:text-white">پایان همه جلسات فعال</p>
                  <p class="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">از تمام دستگاه‌های متصل خارج خواهید شد</p>
                </div>
                <UButton variant="outline" color="error" size="sm">پایان جلسات</UButton>
              </div>
              <div class="flex items-center justify-between px-4 sm:px-6 py-4">
                <div>
                  <p class="text-sm font-medium text-gray-900 dark:text-white">حذف حساب کاربری</p>
                  <p class="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">این عملیات غیرقابل بازگشت است و تمام اطلاعات شما حذف خواهد شد</p>
                </div>
                <UButton variant="outline" color="error" size="sm">حذف حساب</UButton>
              </div>
            </div>
          </UCard>
        </div>
      </Transition>
    </div>

    <!-- ─── Password Modal ─────────────────────────────────────────────────────── -->
    <UModal
      v-model:open="showPasswordModal"
      :ui="{ content: 'sm:max-w-md p-0 gap-0 overflow-hidden' }"
      :dismissible="false"
    >
      <template #content>
        <div class="flex flex-col font-dana relative" dir="rtl">
          <!-- Header -->
          <div class="flex items-center px-5 py-4 border-b border-gray-100 dark:border-gray-800 flex-shrink-0">
            <button
              class="ms-auto w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              @click="requestCancel"
            >
              <UIcon name="i-heroicons-x-mark" class="w-4 h-4" />
            </button>
          </div>

          <!-- Progress bar -->
          <div class="flex gap-1.5 px-5 pt-5 pb-1">
            <span
              v-for="i in 4"
              :key="i"
              :class="['h-0.5 flex-1 rounded-full transition-colors duration-300', currentStep >= i ? 'bg-brand-500' : 'bg-gray-200 dark:bg-gray-700']"
            />
          </div>

          <!-- Steps -->
          <div class="relative overflow-hidden">
            <Transition :name="stepTransition" mode="out-in">
              <div :key="currentStep" class="px-5 py-6 flex flex-col gap-4">

                <!-- Step 1: Phone Verification -->
                <template v-if="currentStep === 1">
                  <div class="w-12 h-12 rounded-full bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-500 mx-auto">
                    <UIcon name="i-heroicons-device-phone-mobile" class="w-6 h-6" />
                  </div>
                  <div class="text-center space-y-1">
                    <h3 class="text-base font-semibold text-gray-900 dark:text-white">تأیید شماره موبایل</h3>
                    <p class="text-xs text-gray-400 leading-relaxed">کد تأیید به شماره زیر ارسال می‌شود</p>
                  </div>
                  <UInput model-value="۰۹۱۲***۴۵۶" readonly dir="ltr" size="md" class="w-full" :ui="{ base: 'text-center' }" />
                  <div class="flex flex-col items-center gap-3">
                    <UButton color="primary" block @click="advanceStep">ارسال کد تأیید</UButton>
                    <UButton variant="ghost" color="neutral" @click="requestCancel">انصراف</UButton>
                  </div>
                </template>

                <!-- Step 2: OTP -->
                <template v-else-if="currentStep === 2">
                  <div class="text-center space-y-1">
                    <h3 class="text-base font-semibold text-gray-900 dark:text-white">کد تأیید</h3>
                    <p class="text-xs text-gray-400 leading-relaxed">کد ارسال شده به ۰۹۱۲***۴۵۶ را وارد کنید</p>
                  </div>
                  <div class="flex justify-center gap-2" dir="ltr">
                    <input
                      v-for="(_, idx) in otpDigits"
                      :key="idx"
                      :ref="(el) => { otpRefs[idx] = el }"
                      :value="otpDigits[idx]"
                      type="text"
                      inputmode="numeric"
                      maxlength="1"
                      class="w-12 h-14 text-center text-xl font-semibold border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-colors"
                      @input="handleOtpInput(idx, $event)"
                      @keydown="handleOtpKeydown(idx, $event)"
                    />
                  </div>
                  <p class="text-center text-sm">
                    <button
                      :disabled="resendCountdown > 0"
                      :class="['font-medium transition-colors', resendCountdown > 0 ? 'text-gray-400 dark:text-gray-500 cursor-not-allowed' : 'text-brand-500 hover:text-brand-600 dark:hover:text-brand-400']"
                      @click="resendCountdown === 0 && startResend()"
                    >
                      {{ resendCountdown > 0 ? `ارسال مجدد (${formattedCountdown})` : 'ارسال مجدد' }}
                    </button>
                  </p>
                  <div class="flex flex-col items-center gap-3">
                    <UButton color="primary" block @click="advanceStep">تأیید کد</UButton>
                    <UButton variant="ghost" color="neutral" @click="retreatStep">بازگشت</UButton>
                  </div>
                </template>

                <!-- Step 3: New Password -->
                <template v-else-if="currentStep === 3">
                  <div class="w-12 h-12 rounded-full bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-500 mx-auto">
                    <UIcon name="i-heroicons-lock-closed" class="w-6 h-6" />
                  </div>
                  <div class="text-center space-y-1">
                    <h3 class="text-base font-semibold text-gray-900 dark:text-white">رمز عبور جدید</h3>
                    <p class="text-xs text-gray-400 leading-relaxed">رمز عبور جدید خود را وارد کنید</p>
                  </div>
                  <div class="space-y-2">
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
                  </div>
                  <div class="flex flex-col items-center gap-3">
                    <UButton color="primary" block @click="advanceStep">ذخیره رمز عبور</UButton>
                    <UButton variant="ghost" color="neutral" @click="retreatStep">بازگشت</UButton>
                  </div>
                </template>

                <!-- Step 4: Success -->
                <template v-else-if="currentStep === 4">
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
                    <UButton color="primary" block @click="closePasswordModal">متوجه شدم</UButton>
                  </div>
                </template>

              </div>
            </Transition>
          </div>

          <!-- Cancel confirmation overlay -->
          <Transition name="overlay-fade">
            <div
              v-if="showCancelConfirm"
              class="absolute inset-0 z-20 flex flex-col items-center justify-center p-6 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm"
            >
              <div class="w-12 h-12 rounded-full bg-warning/10 flex items-center justify-center mb-4">
                <UIcon name="i-heroicons-exclamation-triangle" class="w-6 h-6 text-warning" />
              </div>
              <h3 class="text-base font-bold text-gray-900 dark:text-white mb-1">لغو تغییر رمز عبور؟</h3>
              <p class="text-sm text-gray-500 dark:text-gray-400 text-center mb-6">اگر الان خارج شوید، پیشرفت شما ذخیره نمی‌شود</p>
              <div class="flex flex-col gap-2 w-full">
                <UButton color="neutral" variant="outline" block @click="showCancelConfirm = false">ادامه تغییر</UButton>
                <UButton color="error" variant="soft" block @click="closePasswordModal">لغو و بستن</UButton>
              </div>
            </div>
          </Transition>
        </div>
      </template>
    </UModal>

    <!-- ─── 2FA Modal ──────────────────────────────────────────────────────────── -->
    <UModal
      v-model:open="show2FAModal"
      :ui="{ content: 'sm:max-w-md p-0 gap-0 overflow-hidden' }"
    >
      <template #content>
        <div class="flex flex-col font-dana" dir="rtl">
          <!-- Header -->
          <div class="flex items-center gap-3 px-5 py-4 border-b border-gray-100 dark:border-gray-800">
            <div class="w-8 h-8 rounded-lg bg-brand-500/15 flex items-center justify-center flex-shrink-0">
              <UIcon name="i-heroicons-device-phone-mobile" class="w-4 h-4 text-brand-500" />
            </div>
            <h3 class="flex-1 text-sm font-semibold text-gray-900 dark:text-white">
              {{ twoFAEnabled ? 'مدیریت احراز هویت' : 'فعال‌سازی احراز هویت' }}
            </h3>
            <button
              class="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              @click="close2FAModal"
            >
              <UIcon name="i-heroicons-x-mark" class="w-4 h-4" />
            </button>
          </div>

          <!-- Active: management -->
          <div v-if="twoFAEnabled" class="px-5 py-5 space-y-4">
            <div class="flex items-center gap-3 p-4 rounded-xl bg-gray-50 dark:bg-gray-800">
              <div class="w-9 h-9 rounded-lg bg-brand-500/15 flex items-center justify-center flex-shrink-0">
                <UIcon name="i-heroicons-device-phone-mobile" class="w-5 h-5 text-brand-500" />
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-gray-900 dark:text-white">Google Authenticator</p>
                <p class="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">متصل شد — ۳ روز پیش</p>
              </div>
              <UBadge color="success" variant="subtle" size="xs">فعال</UBadge>
            </div>
            <div class="flex items-start gap-3 p-3.5 rounded-xl bg-warning/10 border border-warning/20">
              <UIcon name="i-heroicons-exclamation-triangle" class="w-4 h-4 text-warning flex-shrink-0 mt-0.5" />
              <p class="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                غیرفعال کردن احراز هویت دو مرحله‌ای امنیت حساب شما را کاهش می‌دهد
              </p>
            </div>
            <div class="flex items-center justify-between pt-1">
              <UButton variant="outline" color="neutral" @click="close2FAModal">بستن</UButton>
              <UButton variant="ghost" color="error" @click="deactivate2FA">غیرفعال کردن</UButton>
            </div>
          </div>

          <!-- Inactive: activation -->
          <div v-else class="px-5 py-5 space-y-4">
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
              v-model="twoFAOtp"
              placeholder="کد ۶ رقمی اپلیکیشن"
              dir="ltr"
              inputmode="numeric"
              maxlength="6"
              size="md"
              class="w-full"
              :ui="{ base: 'text-center' }"
            />
            <div class="flex flex-col items-center gap-3 pt-1">
              <UButton color="primary" block @click="activate2FA">تأیید و فعال‌سازی</UButton>
              <UButton variant="ghost" color="neutral" @click="close2FAModal">انصراف</UButton>
            </div>
          </div>
        </div>
      </template>
    </UModal>
  </div>
</template>

<script setup>
const toast = useToast()
const pending = ref(true)

onMounted(async () => {
  await new Promise((r) => setTimeout(r, 600))
  pending.value = false
})

onUnmounted(() => clearInterval(resendTimer))

const switchUi = {
  base: 'data-[state=checked]:bg-brand-500 dark:data-[state=checked]:bg-brand-400 data-[state=unchecked]:bg-gray-300 dark:data-[state=unchecked]:bg-gray-600',
}

// ── Auth card state ────────────────────────────────────────────────────────────
const twoFAEnabled = ref(true)
const smsEnabled = ref(false)

// ── Password modal ─────────────────────────────────────────────────────────────
const showPasswordModal = ref(false)
const showCancelConfirm = ref(false)
const currentStep = ref(1)
const stepTransition = ref('step-forward')
const newPassword = ref('')
const confirmPassword = ref('')
const otpDigits = ref(['', '', '', '', ''])
const otpRefs = []
const resendCountdown = ref(0)
let resendTimer = null

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
const formattedCountdown = computed(() => resendCountdown.value.toLocaleString('fa-IR'))

const startResend = () => {
  resendCountdown.value = 60
  clearInterval(resendTimer)
  resendTimer = setInterval(() => {
    if (resendCountdown.value > 0) resendCountdown.value--
    else clearInterval(resendTimer)
  }, 1000)
}

const advanceStep = () => {
  stepTransition.value = 'step-forward'
  const next = currentStep.value + 1
  if (next === 2) startResend()
  currentStep.value = next
}

const retreatStep = () => {
  stepTransition.value = 'step-backward'
  currentStep.value--
}

const requestCancel = () => {
  if (currentStep.value === 4) closePasswordModal()
  else showCancelConfirm.value = true
}

const closePasswordModal = () => {
  showPasswordModal.value = false
  showCancelConfirm.value = false
  setTimeout(() => {
    currentStep.value = 1
    stepTransition.value = 'step-forward'
    newPassword.value = ''
    confirmPassword.value = ''
    otpDigits.value = ['', '', '', '', '']
    clearInterval(resendTimer)
    resendCountdown.value = 0
  }, 300)
}

const handleOtpInput = (idx, event) => {
  const val = event.target.value.replace(/\D/g, '').slice(-1)
  otpDigits.value[idx] = val
  if (val && idx < 4) nextTick(() => otpRefs[idx + 1]?.focus())
}

const handleOtpKeydown = (idx, event) => {
  if (event.key === 'Backspace' && !otpDigits.value[idx] && idx > 0)
    nextTick(() => otpRefs[idx - 1]?.focus())
}

// ── 2FA modal ──────────────────────────────────────────────────────────────────
const show2FAModal = ref(false)
const twoFAOtp = ref('')

const close2FAModal = () => {
  show2FAModal.value = false
  twoFAOtp.value = ''
}

const deactivate2FA = () => {
  twoFAEnabled.value = false
  show2FAModal.value = false
  toast.add({ title: 'غیرفعال شد', description: 'احراز هویت دو مرحله‌ای غیرفعال شد', color: 'success' })
}

const activate2FA = () => {
  twoFAEnabled.value = true
  show2FAModal.value = false
  twoFAOtp.value = ''
  toast.add({ title: 'فعال شد', description: 'اپلیکیشن احراز هویت با موفقیت فعال شد', color: 'success' })
}

// ── Static data ────────────────────────────────────────────────────────────────
const activeSessions = ref([
  { id: 1, current: true, icon: 'i-heroicons-computer-desktop', device: 'MacBook Pro', browser: 'Chrome 124 · macOS', location: 'تهران', ip: '185.xx.xx.42', lastActive: 'هم‌اکنون' },
  { id: 2, current: false, icon: 'i-heroicons-device-phone-mobile', device: 'Samsung Galaxy S23', browser: 'Samsung Browser · Android 14', location: 'اصفهان', ip: '94.xx.xx.17', lastActive: '۲ ساعت پیش' },
  { id: 3, current: false, icon: 'i-heroicons-computer-desktop', device: 'Windows PC', browser: 'Firefox 125 · Windows 11', location: 'مشهد', ip: '91.xx.xx.88', lastActive: 'دیروز، ۱۴:۳۰' },
])

const loginHistory = ref([
  { id: 1, success: true, suspicious: false, action: 'ورود موفق', device: 'Chrome · MacBook Pro', ip: '185.xx.xx.42', time: 'امروز، ۱۰:۱۵' },
  { id: 2, success: true, suspicious: false, action: 'ورود موفق', device: 'Samsung Browser · Android', ip: '94.xx.xx.17', time: 'دیروز، ۱۸:۴۰' },
  { id: 3, success: false, suspicious: true, action: 'تلاش ناموفق برای ورود', device: 'Chrome · Windows', ip: '212.xx.xx.11', time: 'دیروز، ۰۳:۲۲' },
  { id: 4, success: true, suspicious: false, action: 'ورود موفق', device: 'Firefox · Windows PC', ip: '91.xx.xx.88', time: '۳ روز پیش، ۱۴:۳۰' },
])

const securityNotifications = reactive([
  { id: 'new-device', label: 'ورود از دستگاه جدید', description: 'هنگام ورود از یک دستگاه ناشناس اطلاع‌رسانی شوید', enabled: true },
  { id: 'failed-login', label: 'تلاش‌های ناموفق برای ورود', description: 'پس از ۳ تلاش ناموفق متوالی اطلاع‌رسانی شوید', enabled: true },
  { id: 'profile-change', label: 'تغییرات پروفایل', description: 'هنگام تغییر اطلاعات حساب یا رمز عبور اطلاع‌رسانی شوید', enabled: false },
])

const revokeAllSessions = () =>
  toast.add({ title: 'خروج از همه دستگاه‌ها', description: 'از تمام دستگاه‌های دیگر خارج شدید', color: 'primary' })

useHead({ title: 'امنیت حساب | پنل کاربری' })
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

.strength-bar-enter-active { transition: opacity 0.2s ease, transform 0.2s ease; }
.strength-bar-enter-from { opacity: 0; transform: translateY(-4px); }

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
