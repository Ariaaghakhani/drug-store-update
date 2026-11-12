<template>
  <form class="space-y-6" @submit.prevent="handleSubmit">
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
          v-model="localForm.name"
          type="text"
          placeholder="نام و نام خانوادگی خود را وارد کنید"
          autocomplete="off"
          class="w-full px-4 h-14 text-lg border-2 rounded-2xl focus:ring-4 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
          :class="{
            'border-gray-300 dark:border-gray-600': !localForm.errors.name,
            'border-red-500 dark:border-red-500': localForm.errors.name,
          }"
        />
        <p
          v-if="localForm.errors.name"
          class="mt-1 text-sm text-red-600 dark:text-red-400"
        >
          {{ localForm.errors.name }}
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
            v-model="localForm.password"
            :type="showPassword ? 'text' : 'password'"
            placeholder="حداقل 8 کاراکتر"
            autocomplete="off"
            class="w-full h-full px-4 pl-12 text-lg border-2 rounded-2xl focus:ring-4 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
            :class="{
              'border-gray-300 dark:border-gray-600':
                !localForm.errors.password,
              'border-red-500 dark:border-red-500': localForm.errors.password,
            }"
          />
          <button
            type="button"
            class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 flex justify-center items-center"
            @click="showPassword = !showPassword"
          >
            <UIcon
              :name="showPassword ? 'i-heroicons-eye-slash' : 'i-heroicons-eye'"
              class="w-5 h-5"
            />
          </button>
        </div>
        <p
          v-if="localForm.errors.password"
          class="mt-1 text-sm text-red-600 dark:text-red-400"
        >
          {{ localForm.errors.password }}
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
            v-model="localForm.passwordConfirm"
            :type="showPasswordConfirm ? 'text' : 'password'"
            placeholder="رمز عبور خود را دوباره وارد کنید"
            class="w-full h-full px-4 pl-12 text-lg border-2 rounded-2xl focus:ring-4 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
            :class="{
              'border-gray-300 dark:border-gray-600':
                !localForm.errors.passwordConfirm,
              'border-red-500 dark:border-red-500':
                localForm.errors.passwordConfirm,
            }"
          />
          <button
            type="button"
            class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 flex justify-center items-center"
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
          v-if="localForm.errors.passwordConfirm"
          class="mt-1 text-sm text-red-600 dark:text-red-400"
        >
          {{ localForm.errors.passwordConfirm }}
        </p>
      </div>

      <!-- Terms: BACK rejects the sign-up without it once the store has published terms -->
      <div>
        <label
          class="flex items-center gap-3 px-4 py-3 rounded-xl border-2 cursor-pointer transition-colors"
          :class="
            localForm.acceptedTerms
              ? 'bg-brand-500/5 dark:bg-brand-500/10 border-brand-500/40'
              : localForm.errors.acceptedTerms
                ? 'border-red-500 dark:border-red-500'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
          "
        >
          <input
            v-model="localForm.acceptedTerms"
            type="checkbox"
            class="w-4 h-4 accent-[var(--color-brand-500)] flex-shrink-0"
            @change="localForm.errors.acceptedTerms = ''"
          />
          <span class="text-sm text-gray-700 dark:text-gray-300">
            <NuxtLink
              to="/terms"
              target="_blank"
              class="font-medium text-brand-500 dark:text-brand-400 hover:underline"
              @click.stop
            >
              قوانین و شرایط
            </NuxtLink>
            را خوانده‌ام و می‌پذیرم
          </span>
        </label>
        <p
          v-if="localForm.errors.acceptedTerms"
          class="mt-1 text-sm text-red-600 dark:text-red-400"
        >
          {{ localForm.errors.acceptedTerms }}
        </p>
      </div>
    </div>

    <button
      type="submit"
      :disabled="loading"
      class="w-full py-4 px-6 text-lg font-semibold text-white rounded-2xl focus:ring-4 focus:ring-teal-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] active:scale-[0.98]"
      style="background: linear-gradient(135deg, #0d9488 0%, #06b6d4 100%)"
    >
      <span v-if="!loading">تکمیل ثبت‌نام</span>
      <span v-else class="flex items-center justify-center gap-2">
        <UIcon name="i-heroicons-arrow-path" class="w-5 h-5 animate-spin" />
        در حال ثبت‌نام...
      </span>
    </button>

    <button
      type="button"
      class="w-full py-3 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
      @click="emit('goBack')"
    >
      بازگشت و ویرایش شماره
    </button>
  </form>
</template>

<script setup>
import { validateRegisterForm } from '@/utils/validations.js'

const props = defineProps({
  form: {
    type: Object,
    required: true,
  },
  loading: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:form', 'submit', 'goBack'])

const localForm = computed({
  get: () => props.form,
  set: (value) => emit('update:form', value),
})

const showPassword = ref(false)
const showPasswordConfirm = ref(false)

const handleSubmit = () => {
  const { isValid, errors } = validateRegisterForm(localForm.value)
  // shortcut: always required, even for a store with no published terms (BACK only needs it then); upgrade by
  // checking GET api/terms if a store without terms ever goes live
  const termsOk = localForm.value.acceptedTerms === true
  errors.acceptedTerms = termsOk ? '' : 'برای ثبت‌نام باید قوانین و شرایط را بپذیرید'

  localForm.value.errors = errors

  if (isValid && termsOk) {
    emit('submit')
  }
}
</script>
